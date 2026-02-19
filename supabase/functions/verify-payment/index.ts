import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Helper para logging estruturado
const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

// Buscar sessão Stripe via fetch (sem SDK)
async function retrieveStripeSession(sessionId: string, stripeSecretKey: string): Promise<{
  payment_status: string;
  payment_intent: string | null;
  metadata: { vaga_id?: string; estudio_id?: string };
  invoice: { hosted_invoice_url: string | null; invoice_pdf: string | null } | null;
}> {
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=invoice`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    logStep("Stripe API error", errorData);
    throw new Error(errorData.error?.message || 'Sessão não encontrada no Stripe');
  }

  return await response.json();
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
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Criar cliente Supabase com token do usuário
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Obter usuário autenticado via getUser
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      logStep("ERROR: Invalid token", { error: userError?.message });
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    logStep("User authenticated", { userId });

    // Parse request body
    const { session_id } = await req.json();
    
    if (!session_id) {
      logStep("ERROR: Missing session_id");
      return new Response(
        JSON.stringify({ error: "session_id é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Verifying payment for session", { session_id });

    // Verificar Stripe key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Stripe não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Consultar sessão diretamente no Stripe via fetch
    let session;
    try {
      session = await retrieveStripeSession(session_id, stripeKey);
      logStep("Stripe session retrieved", { 
        payment_status: session.payment_status,
        payment_intent: session.payment_intent 
      });
    } catch (stripeError) {
      logStep("ERROR: Failed to retrieve Stripe session", { error: String(stripeError) });
      return new Response(
        JSON.stringify({ error: "Sessão de pagamento não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar status do pagamento
    if (session.payment_status !== "paid") {
      logStep("Payment not completed", { payment_status: session.payment_status });
      return new Response(
        JSON.stringify({ 
          success: false, 
          status: "unpaid", 
          error: "Pagamento não confirmado" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extrair metadata
    const vagaId = session.metadata?.vaga_id;
    const estudioId = session.metadata?.estudio_id;

    if (!vagaId || !estudioId) {
      logStep("ERROR: Invalid session metadata", { metadata: session.metadata });
      return new Response(
        JSON.stringify({ error: "Metadata inválida na sessão" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Session metadata valid", { vagaId, estudioId });

    // Verificar ownership do usuário no estúdio
    const { data: membership, error: membershipError } = await supabase
      .from("estudio_membros")
      .select("role")
      .eq("user_id", userId)
      .eq("estudio_id", estudioId)
      .eq("ativo", true)
      .single();

    if (membershipError || !membership) {
      logStep("ERROR: User not a member of studio", { error: membershipError?.message });
      return new Response(
        JSON.stringify({ error: "Você não é membro deste estúdio" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (membership.role !== "super_admin") {
      logStep("ERROR: User is not super_admin", { role: membership.role });
      return new Response(
        JSON.stringify({ error: "Sem permissão para verificar este pagamento" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("User authorized as super_admin");

    // Buscar vaga para validar status
    const { data: vaga, error: vagaError } = await supabase
      .from("vagas")
      .select("id, status")
      .eq("id", vagaId)
      .single();

    if (vagaError || !vaga) {
      logStep("ERROR: Vaga not found", { error: vagaError?.message });
      return new Response(
        JSON.stringify({ error: "Vaga não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar se já foi processada
    if (vaga.status === "publicada") {
      logStep("Vaga already published, returning success");
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: "already_processed", 
          vaga_id: vagaId 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (vaga.status !== "aguardando_pagamento") {
      logStep("ERROR: Invalid vaga status", { status: vaga.status });
      return new Response(
        JSON.stringify({ error: "Status da vaga inválido para ativação" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Criar cliente admin para operações com service_role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verificar se pagamento já foi processado
    const { data: pagamento, error: pagamentoError } = await supabaseAdmin
      .from("pagamentos")
      .select("id, status")
      .eq("stripe_session_id", session_id)
      .single();

    if (pagamentoError) {
      logStep("WARNING: Payment record not found", { error: pagamentoError.message });
      // Continuar mesmo sem registro - pode ter sido criado antes do registro
    }

    if (pagamento?.status === "completed") {
      logStep("Payment already completed, returning success");
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: "already_processed", 
          vaga_id: vagaId 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Processing payment activation");

    // Atualizar vaga para publicada
    const { error: updateVagaError } = await supabaseAdmin
      .from("vagas")
      .update({ 
        status: "publicada", 
        ativa: true,
        atualizada_em: new Date().toISOString()
      })
      .eq("id", vagaId);

    if (updateVagaError) {
      logStep("ERROR: Failed to update vaga", { error: updateVagaError.message });
      return new Response(
        JSON.stringify({ error: "Erro ao ativar vaga" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Vaga updated to publicada");

    // Atualizar registro de pagamento
    if (pagamento) {
      const { error: updatePagamentoError } = await supabaseAdmin
        .from("pagamentos")
        .update({
          status: "completed",
          stripe_payment_id: session.payment_intent as string,
          atualizado_em: new Date().toISOString(),
          invoice_url: session.invoice?.hosted_invoice_url ?? null,
          invoice_pdf_url: session.invoice?.invoice_pdf ?? null,
        })
        .eq("id", pagamento.id);

      if (updatePagamentoError) {
        logStep("WARNING: Failed to update payment record", { error: updatePagamentoError.message });
        // Não falhar por isso - vaga já foi ativada
      } else {
        logStep("Payment record updated to completed");
      }
    }

    logStep("Payment verification completed successfully", { vaga_id: vagaId });

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: "paid", 
        vaga_id: vagaId 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("FATAL ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
