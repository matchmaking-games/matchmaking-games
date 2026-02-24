import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();

    const assunto = formData.get("assunto") as string;
    const tipo = formData.get("tipo") as string;
    const mensagem = formData.get("mensagem") as string;
    const nome = formData.get("nome") as string;
    const email = formData.get("email") as string;
    const userId = formData.get("user_id") as string;
    const origem = formData.get("origem") as string;
    const userAgent = formData.get("user_agent") as string;
    const imagem = formData.get("imagem") as File | null;

    if (!tipo || !mensagem) {
      return new Response(
        JSON.stringify({ error: "Campos 'tipo' e 'mensagem' são obrigatórios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Timestamp em horário de Brasília
    const now = new Date();
    const brDate = now.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const brTime = now.toLocaleTimeString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
    });
    const timestamp = `${brDate} às ${brTime}`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #22e47a; border-bottom: 2px solid #22e47a; padding-bottom: 8px;">
          [${tipo}] Novo ticket de suporte
        </h2>

        <h3 style="margin-top: 24px;">📋 Tipo</h3>
        <p>${tipo}</p>

        <h3 style="margin-top: 24px;">📝 Assunto</h3>
        <p>${assunto}</p>

        <h3 style="margin-top: 24px;">👤 Remetente</h3>
        <p>
          <strong>Nome:</strong> ${nome}<br/>
          <strong>Email:</strong> ${email}<br/>
          <strong>User ID:</strong> ${userId}
        </p>

        <h3 style="margin-top: 24px;">💬 Mensagem</h3>
        <p style="white-space: pre-wrap;">${mensagem}</p>

        <h3 style="margin-top: 24px;">🔧 Contexto Técnico</h3>
        <p>
          <strong>Data/hora:</strong> ${timestamp}<br/>
          <strong>Página de origem:</strong> ${origem}<br/>
          <strong>User Agent:</strong> ${userAgent}
        </p>
      </div>
    `;

    // Build Resend payload
    const resendPayload: Record<string, unknown> = {
      from: "Matchmaking <noreply@matchmaking.games>",
      to: ["lucas.pimenta@matchmaking.games"],
      reply_to: email,
      subject: `[${tipo}] ${assunto}`,
      html: htmlBody,
    };

    // Handle image attachment
    if (imagem && imagem.size > 0) {
      const arrayBuffer = await imagem.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64Content = btoa(binary);

      resendPayload.attachments = [
        {
          filename: imagem.name,
          content: base64Content,
          type: imagem.type,
        },
      ];
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Resend API error: ${resendResponse.status}`);
    }

    const result = await resendResponse.json();
    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-support-email:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno ao enviar email." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
