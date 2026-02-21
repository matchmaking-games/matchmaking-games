import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @deno-types="npm:@types/pdf-parse"
import pdf from "npm:pdf-parse";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[PROCESS-LINKEDIN-PDF] ${step}${d}`);
};

// --- Section splitter ---

interface Sections {
  experiences: string;
  education: string;
  skills: string;
}

function splitSections(text: string): Sections {
  const markers: { key: keyof Sections; patterns: RegExp[] }[] = [
    {
      key: "experiences",
      patterns: [/^Experiência$/im, /^Experience$/im],
    },
    {
      key: "education",
      patterns: [/^Formação acadêmica$/im, /^Formação Acadêmica$/im, /^Formacao academica$/im, /^Education$/im],
    },
    {
      key: "skills",
      patterns: [
        /^Principais competências$/im,
        /^Principais Competências$/im,
        /^Principais competencias$/im,
        /^Top Skills$/im,
        /^Skills$/im,
      ],
    },
  ];

  // Find positions of each section
  const positions: { key: keyof Sections; index: number }[] = [];

  for (const marker of markers) {
    for (const pattern of marker.patterns) {
      const match = pattern.exec(text);
      if (match) {
        positions.push({ key: marker.key, index: match.index });
        break; // use first match per key
      }
    }
  }

  // Sort by position
  positions.sort((a, b) => a.index - b.index);

  const result: Sections = { experiences: "", education: "", skills: "" };

  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].index;
    const end = i + 1 < positions.length ? positions[i + 1].index : text.length;
    result[positions[i].key] = text.slice(start, end).trim();
  }

  return result;
}

// --- AI prompt ---

function buildPrompt(pdfText: string): string {
  return `Você é um assistente especializado em extrair informações estruturadas de currículos do LinkedIn.

Extraia as informações deste currículo do LinkedIn e retorne APENAS JSON válido, sem markdown, sem explicações, sem preamble.

REGRAS CRÍTICAS DE DATAS: Converta TODAS as datas para formato ISO YYYY-MM. Mapeamento em português: janeiro/jan=01, fevereiro/fev=02, março/mar=03, abril/abr=04, maio/mai=05, junho/jun=06, julho/jul=07, agosto/ago=08, setembro/set=09, outubro/out=10, novembro/nov=11, dezembro/dez=12. Se data atual (Present, Atual, até hoje): retorne null. SEMPRE use 2 dígitos para mês.

ESTRUTURA DO JSON:
{
  "basic_info": { "name": "", "email": "", "phone": "", "linkedin_url": "", "location": "", "bio": "" },
  "experiences": [{ "company": "", "role": "", "start_date": "YYYY-MM", "end_date": "YYYY-MM ou null", "location": "", "description": "" }],
  "education": [{ "institution": "", "degree": "", "field": "", "start_year": "YYYY", "end_year": "YYYY ou null" }],
  "skills": ["string"]
}

REGRAS: Se a pessoa teve múltiplos cargos na mesma empresa, crie entradas SEPARADAS no array. Preservar TODA a descrição original, não resumir. Extrair skills apenas da seção "Principais competências". Se informação não existir: retornar string vazia "" ou null. Nunca inventar dados. Preservar acentos em português.

TEXTO DO CURRÍCULO:
${pdfText}

Retorne APENAS o JSON, sem \`\`\`json, sem explicações:`;
}

// --- AI call with retry ---

async function callAI(pdfText: string, apiKey: string): Promise<Record<string, unknown>> {
  const prompt = buildPrompt(pdfText);

  for (let attempt = 0; attempt < 2; attempt++) {
    logStep(`AI call attempt ${attempt + 1}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      logStep("AI gateway error", { status: response.status, body: errText });
      if (attempt === 1) throw new Error(`AI gateway returned ${response.status}`);
      continue;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      logStep("AI returned empty content");
      if (attempt === 1) throw new Error("AI returned empty content");
      continue;
    }

    try {
      return JSON.parse(content);
    } catch {
      logStep("JSON parse failed, retrying", { content: content.slice(0, 200) });
      if (attempt === 1) throw new Error("AI returned invalid JSON after 2 attempts");
    }
  }

  throw new Error("AI call failed");
}

// --- Main handler ---

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let supabase: ReturnType<typeof createClient> | null = null;
  let userId: string | null = null;

  try {
    // 1. Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      logStep("Auth failed", { error: userError?.message });
      return new Response(JSON.stringify({ success: false, error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    userId = user.id;
    logStep("User authenticated", { userId });

    // 2. Rate limit
    const { data: importCount, error: rpcError } = await supabase.rpc("count_recent_imports", {
      p_user_id: userId,
    });

    if (rpcError) {
      logStep("RPC error (non-blocking)", { error: rpcError.message });
      // Fail-open: allow if RPC fails
    } else if (importCount >= 3) {
      logStep("Rate limit exceeded", { count: importCount });
      return new Response(JSON.stringify({ success: false, error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Extract PDF from FormData
    const formData = await req.formData();
    const file = formData.get("pdf"); // campo "pdf" conforme enviado pelo frontend

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ success: false, error: "Arquivo PDF é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (file.type !== "application/pdf") {
      return new Response(JSON.stringify({ success: false, error: "Apenas arquivos PDF são aceitos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ success: false, error: "Arquivo excede o limite de 10MB" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("PDF received", { name: file.name, size: file.size });

    // 4. Extract text
    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = new Uint8Array(arrayBuffer);
    const pdfData = await pdf(pdfBuffer);
    const fullText = pdfData.text;

    if (!fullText || fullText.trim().length === 0) {
      throw new Error("Não foi possível extrair texto do PDF");
    }

    logStep("Text extracted", { length: fullText.length });

    // 5. Split sections
    const sections = splitSections(fullText);
    logStep("Sections split", {
      experiences: sections.experiences.length,
      education: sections.education.length,
      skills: sections.skills.length,
    });

    // 6. Call AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const extractedData = await callAI(fullText, LOVABLE_API_KEY);
    logStep("AI extraction complete");

    // 7. Record success in import_history
    const processingTime = Date.now() - startTime;
    const itemsImported = {
      experiences: Array.isArray(extractedData.experiences) ? extractedData.experiences.length : 0,
      education: Array.isArray(extractedData.education) ? extractedData.education.length : 0,
      skills: Array.isArray(extractedData.skills) ? extractedData.skills.length : 0,
    };

    const { error: insertError } = await supabase.from("import_history").insert({
      user_id: userId,
      status: "success",
      source_type: "linkedin_pdf",
      items_imported: itemsImported,
      processing_time_ms: processingTime,
    });

    if (insertError) {
      logStep("Failed to record import history", { error: insertError.message });
    }

    // 8. Return success
    logStep("Done", { processingTime });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          extracted_data: extractedData,
          raw_text: {
            full: fullText,
            sections,
          },
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logStep("ERROR", { message: errorMessage });

    // Record error in import_history
    if (supabase && userId) {
      const { error: insertError } = await supabase.from("import_history").insert({
        user_id: userId,
        status: "error",
        source_type: "linkedin_pdf",
        error_message: errorMessage,
        processing_time_ms: Date.now() - startTime,
      });

      if (insertError) {
        logStep("Failed to record error in history", { error: insertError.message });
      }
    }

    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
