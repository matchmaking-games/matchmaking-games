import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[PROCESS-LINKEDIN-PDF] ${step}${d}`);
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
      patterns: [/Experiência/i, /Experience/i],
    },
    {
      key: "education",
      patterns: [/Formação acadêmica/i, /Formacao academica/i, /Education/i],
    },
    {
      key: "skills",
      patterns: [/Principais competências/i, /Principais competencias/i, /Top Skills/i, /Skills/i],
    },
  ];

  const positions: { key: keyof Sections; index: number }[] = [];

  for (const marker of markers) {
    for (const pattern of marker.patterns) {
      const match = pattern.exec(text);
      if (match) {
        positions.push({ key: marker.key, index: match.index });
        break;
      }
    }
  }

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
  return `Você é um assistente especializado em extrair informações estruturadas de currículos do LinkedIn em português brasileiro.

Sua única tarefa é ler o texto de um currículo e retornar um JSON válido com as informações extraídas. Você não deve explicar nada, não deve fazer perguntas, não deve adicionar comentários. Apenas retorne o JSON.

---

## REGRAS DE DATAS

Todas as datas devem ser convertidas para o formato ISO.

Para experiências profissionais, o formato é YYYY-MM (ano e mês). Exemplos de conversão:
- "jan de 2021" → "2021-01"
- "março 2019" → "2019-03"
- "out. 2022" → "2022-10"
- "Present", "Atual", "até o momento", "o momento" → null
- Se tiver apenas o ano sem mês → use "YYYY-01"

Mapeamento completo de meses em português:
janeiro/jan = 01, fevereiro/fev = 02, março/mar = 03, abril/abr = 04,
maio/mai = 05, junho/jun = 06, julho/jul = 07, agosto/ago = 08,
setembro/set = 09, outubro/out = 10, novembro/nov = 11, dezembro/dez = 12

Para formações acadêmicas, o formato é apenas YYYY (somente o ano). Exemplos:
- "2018" → "2018"
- "jan de 2018" → "2018"
- "Present", "Atual" → null

---

## REGRAS PARA tipo_emprego (experiências)

Cada cargo deve ter um campo tipo_emprego. Você deve inferir o valor correto com base no título do cargo e na descrição. Os únicos valores permitidos são: clt, pj, freelancer, estagio, tempo_integral.

Use estas regras para inferir:
- Se o cargo ou descrição mencionar "estágio", "estagiário", "intern" ou "internship" → use "estagio"
- Se o cargo ou descrição mencionar "freelance", "freelancer", "autônomo" ou "autônoma" → use "freelancer"
- Se o cargo ou descrição mencionar "PJ", "pessoa jurídica" ou "CNPJ" → use "pj"
- Se o cargo ou descrição mencionar "full-time", "tempo integral" → use "tempo_integral"
- Em todos os outros casos → use "clt"

---

## REGRAS PARA tipo (formações acadêmicas)

Cada formação deve ter um campo tipo. Você deve inferir o valor correto com base no nome do grau ou título da formação. Os únicos valores permitidos são: graduacao, pos, tecnico, curso, certificacao, ensino_medio, mestrado, doutorado, mba.

Use estas regras para inferir:
- Se mencionar "bacharelado", "licenciatura", "graduação" ou "bachelor" → use "graduacao"
- Se mencionar "pós-graduação", "especialização", "lato sensu" ou "pós graduação" → use "pos"
- Se mencionar "mestrado", "mestre", "stricto sensu" ou "master" → use "mestrado"
- Se mencionar "doutorado", "doutor" ou "PhD" → use "doutorado"
- Se mencionar "MBA" → use "mba"
- Se mencionar "técnico" ou "tecnólogo" → use "tecnico"
- Se mencionar "ensino médio", "segundo grau" ou "high school" → use "ensino_medio"
- Se mencionar "certificação" ou "certificate" → use "certificacao"
- Em todos os outros casos → use "curso"

---

## REGRAS PARA AGRUPAMENTO DE CARGOS POR EMPRESA

REGRA CRÍTICA: Se a pessoa teve múltiplos cargos na mesma empresa, eles devem ser agrupados dentro de um ÚNICO objeto no array "experiences", com todos os cargos listados no array "cargos".

O LinkedIn apresenta múltiplos cargos na mesma empresa de duas formas:
1. Uma linha com o nome da empresa seguida de um tempo total (ex: "1 ano 3 meses"), com múltiplos cargos indentados abaixo — todos pertencem ao mesmo objeto.
2. Entradas separadas com o MESMO nome de empresa — devem ser agrupadas no mesmo objeto.

Para empresas com um único cargo, o array "cargos" terá apenas 1 item.

SEMPRE retorne a estrutura com o array "cargos", nunca retorne campos de cargo diretamente no objeto da empresa.

Os cargos dentro do array devem estar ordenados do mais recente para o mais antigo (com base em start_date).

---

## REGRAS GERAIS

- Preserve TODA a descrição original de cada cargo. Não resuma, não corte, não parafraseie.
- Extraia skills apenas da seção "Principais competências" do currículo. Não invente skills a partir da descrição das experiências.
- Se uma informação não existir no currículo, retorne string vazia "" para campos de texto ou null para datas.
- Nunca invente dados que não estão no currículo.
- Preserve acentos e caracteres especiais em português.
- NÃO extraia localização/cidade/estado das experiências. Esses dados serão preenchidos manualmente pelo usuário.

---

## ESTRUTURA DO JSON QUE VOCÊ DEVE RETORNAR

{
  "basic_info": {
    "name": "nome completo da pessoa",
    "email": "email se disponível, senão string vazia",
    "phone": "telefone se disponível, senão string vazia",
    "linkedin_url": "URL do LinkedIn se disponível, senão string vazia",
    "bio": "resumo profissional se disponível, senão string vazia"
  },
  "experiences": [
    {
      "company": "nome da empresa",
      "cargos": [
        {
          "role": "título exato do cargo",
          "tipo_emprego": "clt | pj | freelancer | estagio | tempo_integral",
          "start_date": "YYYY-MM ou null",
          "end_date": "YYYY-MM ou null",
          "is_current": true ou false,
          "description": "descrição completa e preservada, senão string vazia"
        }
      ]
    }
  ],
  "education": [
    {
      "institution": "nome da instituição",
      "tipo": "graduacao | pos | tecnico | curso | certificacao | ensino_medio | mestrado | doutorado | mba",
      "field": "nome do curso ou área de estudo",
      "start_year": "YYYY ou null",
      "end_year": "YYYY ou null"
    }
  ],
  "skills": ["skill 1", "skill 2"]
}

---

## TEXTO DO CURRÍCULO

${pdfText}

---

Retorne APENAS o JSON acima preenchido. Sem \`\`\`json, sem explicações, sem texto antes ou depois do JSON.`;
}

// --- AI call with retry ---

async function callAI(pdfText: string, apiKey: string): Promise<Record<string, unknown>> {
  const prompt = buildPrompt(pdfText);

  for (let attempt = 0; attempt < 2; attempt++) {
    logStep(`AI call attempt ${attempt + 1}`);

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      logStep("Gemini API error", { status: response.status, body: errText });
      if (attempt === 1) throw new Error(`Gemini API returned ${response.status}`);
      continue;
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      logStep("Gemini returned empty content");
      if (attempt === 1) throw new Error("Gemini returned empty content");
      continue;
    }

    try {
      return JSON.parse(content);
    } catch {
      logStep("JSON parse failed, retrying", { content: content.slice(0, 200) });
      if (attempt === 1) throw new Error("Gemini returned invalid JSON after 2 attempts");
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
    } else if (importCount >= 3) {
      logStep("Rate limit exceeded", { count: importCount });
      return new Response(JSON.stringify({ success: false, error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Read text from JSON body
    const { text, filename } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ success: false, error: "Texto do PDF é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Text received", { length: text.length, filename });

    const fullText = text;

    if (!fullText || fullText.trim().length < 100) {
      throw new Error(
        "Não foi possível extrair texto suficiente do PDF. Verifique se o arquivo é o PDF gerado pelo LinkedIn.",
      );
    }

    // 4. Call AI
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const extractedData = await callAI(fullText, GEMINI_API_KEY);
    logStep("AI extraction complete");

    // 7. Record success in import_history
    const processingTime = Date.now() - startTime;
    const experiencesArr = Array.isArray(extractedData.experiences) ? extractedData.experiences : [];
    const totalCargos = experiencesArr.reduce((sum: number, exp: any) => {
      const cargos = Array.isArray(exp.cargos) ? exp.cargos : [exp];
      return sum + cargos.length;
    }, 0);
    const itemsImported = {
      experiences: totalCargos,
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

    const sections = splitSections(fullText);
    logStep("Sections split", {
      experiences: sections.experiences.length,
      education: sections.education.length,
      skills: sections.skills.length,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          extracted_data: extractedData,
          raw_text: {
            full: fullText,
            sections: sections,
          },
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logStep("ERROR", { message: errorMessage });

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
