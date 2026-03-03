import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Helper para logging estruturado
const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Criar sessão Stripe via fetch (sem SDK)
async function createStripeCheckoutSession(params: {
  stripeSecretKey: string;
  titulo: string;
  vagaId: string;
  estudioId: string;
  siteUrl: string;
}): Promise<{ url: string; id: string }> {
  const { stripeSecretKey, titulo, vagaId, estudioId, siteUrl } = params;

  // PREÇO HARDCODED: R$ 97,00 = 9700 centavos
  const PRECO_DESTAQUE_CENTAVOS = "9700";

  const body = new URLSearchParams({
    mode: "payment",
    "payment_method_types[0]": "card",
    "line_items[0][price_data][currency]": "brl",
    "line_items[0][price_data][product_data][name]": "Vaga em Destaque - 30 dias",
    "line_items[0][price_data][product_data][description]": `Destaque para: ${titulo}`,
    "line_items[0][price_data][unit_amount]": PRECO_DESTAQUE_CENTAVOS,
    "line_items[0][quantity]": "1",
    "invoice_creation[enabled]": "true",
    "metadata[vaga_id]": vagaId,
    "metadata[estudio_id]": estudioId,
    success_url: `${siteUrl}/studio/manage/dashboard?studio=${estudioId}&payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/studio/manage/dashboard?studio=${estudioId}&payment=cancelled`,
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    logStep("Stripe API error", errorData);
    throw new Error(errorData.error?.message || "Erro ao criar sessão Stripe");
  }

  const session = await response.json();
  return { url: session.url, id: session.id };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Verificar authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Criar cliente Supabase com token do usuário
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Obter usuário autenticado via getUser
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      logStep("ERROR: Invalid token", { error: userError?.message });
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    logStep("User authenticated", { userId });

    // Parse request body
    const { vaga_id } = await req.json();

    if (!vaga_id) {
      logStep("ERROR: Missing vaga_id");
      return new Response(JSON.stringify({ error: "vaga_id é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Processing checkout for vaga", { vaga_id });

    // Buscar vaga
    const { data: vaga, error: vagaError } = await supabase
      .from("vagas")
      .select("id, estudio_id, tipo_publicacao, status, titulo")
      .eq("id", vaga_id)
      .single();

    if (vagaError || !vaga) {
      logStep("ERROR: Vaga not found", { error: vagaError?.message });
      return new Response(JSON.stringify({ error: "Vaga não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Vaga found", { titulo: vaga.titulo, tipo_publicacao: vaga.tipo_publicacao, status: vaga.status });

    // Validar tipo de publicação
    if (vaga.tipo_publicacao !== "destaque") {
      logStep("ERROR: Vaga is not destaque type");
      return new Response(JSON.stringify({ error: "Esta vaga não é do tipo destaque" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validar status
    if (vaga.status !== "aguardando_pagamento") {
      logStep("ERROR: Invalid status for payment", { currentStatus: vaga.status });
      return new Response(JSON.stringify({ error: "Status inválido para pagamento. Esperado: aguardando_pagamento" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verificar membership do usuário no estúdio
    const { data: membership, error: membershipError } = await supabase
      .from("estudio_membros")
      .select("role")
      .eq("user_id", userId)
      .eq("estudio_id", vaga.estudio_id)
      .eq("ativo", true)
      .single();

    if (membershipError || !membership) {
      logStep("ERROR: User not a member of studio", { error: membershipError?.message });
      return new Response(JSON.stringify({ error: "Você não é membro deste estúdio" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (membership.role !== "super_admin") {
      logStep("ERROR: User is not super_admin", { role: membership.role });
      return new Response(JSON.stringify({ error: "Apenas super_admin pode processar pagamentos" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("User authorized as super_admin");

    // Verificar Stripe key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not configured");
      return new Response(JSON.stringify({ error: "Stripe não configurado" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SITE_URL = Deno.env.get("SITE_URL") || "https://matchmaking-games.lovable.app";

    logStep("Creating Stripe checkout session via fetch", { amount: 9700 });

    // Criar sessão Stripe via fetch
    const session = await createStripeCheckoutSession({
      stripeSecretKey: stripeKey,
      titulo: vaga.titulo,
      vagaId: vaga.id,
      estudioId: vaga.estudio_id,
      siteUrl: SITE_URL,
    });

    logStep("Stripe session created", { sessionId: session.id });

    // Inserir registro de pagamento com service_role
    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { error: insertError } = await supabaseAdmin.from("pagamentos").insert({
      estudio_id: vaga.estudio_id,
      vaga_id: vaga.id,
      stripe_session_id: session.id,
      amount: 9700,
      currency: "brl",
      status: "pending",
    });

    if (insertError) {
      logStep("ERROR: Failed to insert payment record", { error: insertError.message });
      // Não falhar a requisição por isso, o pagamento pode prosseguir
    } else {
      logStep("Payment record created");
    }

    logStep("Checkout session ready", { url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("FATAL ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
