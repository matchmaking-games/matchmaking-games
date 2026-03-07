import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { inviteId } = await req.json();
    console.log("[SEND-INVITE-EMAIL] Received request", { inviteId });

    if (!inviteId) {
      return new Response(JSON.stringify({ success: false, error: "inviteId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("[SEND-INVITE-EMAIL] RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ success: false, error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: invite, error: fetchError } = await supabase
      .from("estudio_convites")
      .select("token, email_convidado, role, estudios(nome, logo_url)")
      .eq("id", inviteId)
      .single();

    if (fetchError || !invite) {
      console.error("[SEND-INVITE-EMAIL] Invite not found", { inviteId, error: fetchError });
      return new Response(JSON.stringify({ success: false, error: "Invite not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const estudio = invite.estudios as { nome: string; logo_url: string | null };
    const estudioNome = estudio.nome;
    const inviteLink = `https://matchmaking.games/invite/${invite.token}`;
    const roleTraduzida = invite.role === "super_admin" ? "Super Administrador" : "Membro";

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Convite para ${estudioNome}</title></head><body style="margin:0;padding:0;background-color:#1c1b1b;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1c1b1b"><tr><td align="center" style="padding:40px 20px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#292929;border-radius:12px;overflow:hidden"><tr><td align="center" style="padding:32px 40px 24px;background-color:#292929"><img src="https://njyoimhjfqtygnlccjzq.supabase.co/storage/v1/object/public/public-images/matchmaking-logo.png" alt="Matchmaking" width="180" style="display:block;max-width:180px;height:auto"></td></tr><tr><td style="padding:0 40px 32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><h1 style="margin:0 0 24px;color:#ffffff;font-size:24px;font-weight:700;line-height:1.3">Você recebeu um convite!</h1></td></tr><tr><td><p style="margin:0 0 16px;color:#a3a3a3;font-size:16px;line-height:1.6;text-align:center"><strong style="color:#ffffff">${estudioNome}</strong> convidou você para fazer parte da equipe como <strong style="color:#22e47a">${roleTraduzida}</strong>.</p><p style="margin:0 0 32px;color:#a3a3a3;font-size:16px;line-height:1.6;text-align:center">Clique no botão abaixo para aceitar o convite e começar a colaborar:</p></td></tr><tr><td align="center" style="padding:0 0 32px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background-color:#22e47a;border-radius:8px"><a href="${inviteLink}" target="_blank" style="display:inline-block;padding:14px 32px;color:#1c1b1b;font-size:16px;font-weight:700;text-decoration:none;border-radius:8px">Aceitar convite</a></td></tr></table></td></tr><tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1c1b1b;border-radius:8px"><tr><td style="padding:16px 20px"><p style="margin:0 0 8px;color:#a3a3a3;font-size:13px">Ou copie e cole este link:</p><p style="margin:0;color:#22e47a;font-size:13px;word-break:break-all">${inviteLink}</p></td></tr></table></td></tr></table></td></tr><tr><td style="padding:24px 40px 32px;border-top:1px solid #3a3a3a"><p style="margin:0 0 8px;color:#737373;font-size:13px;text-align:center">⏰ Este convite expira em 7 dias</p><p style="margin:0;color:#737373;font-size:13px;text-align:center">Se você não reconhece este convite, pode ignorar este email</p></td></tr></table></td></tr></table></body></html>`;

    console.log("[SEND-INVITE-EMAIL] Sending email to", invite.email_convidado);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Matchmaking <contato@matchmaking.games>",
        to: invite.email_convidado,
        subject: `Convite para ${estudioNome}`,
        html,
      }),
    });

    const resendBody = await resendRes.json();

    if (!resendRes.ok) {
      console.error("[SEND-INVITE-EMAIL] Resend error", { status: resendRes.status, error: resendBody });
      return new Response(JSON.stringify({ success: false, error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[SEND-INVITE-EMAIL] Email sent successfully", { emailId: resendBody.id });

    return new Response(JSON.stringify({ success: true, emailId: resendBody.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[SEND-INVITE-EMAIL] Unexpected error", err);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
