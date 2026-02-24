import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, AlertCircle, Clock, Shield, Building2, LogOut } from "lucide-react";

interface InviteData {
  id: string;
  estudio_id: string;
  email_convidado: string;
  role: "super_admin" | "member";
  aceito: boolean;
  expira_em: string;
  estudio_nome: string;
  estudio_logo_url: string | null;
}

const AcceptInvite = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [existingUser, setExistingUser] = useState<boolean | null>(null);
  const processedRef = useRef(false);

  // Effect 1: Fetch invite + auth state
  useEffect(() => {
    const init = async () => {
      if (!token) {
        setError("not_found");
        setLoading(false);
        return;
      }

      // Get session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUserEmail(session.user.email ?? null);
        setUserId(session.user.id);
      }

      // Fetch invite via RPC
      const { data, error: rpcError } = await supabase.rpc("get_invite_by_token", {
        invite_token: token,
      });

      if (rpcError || !data) {
        setError("not_found");
        setLoading(false);
        return;
      }

      const inviteData = data as unknown as InviteData;

      // Check expired
      if (new Date(inviteData.expira_em) < new Date()) {
        setInvite(inviteData);
        setError("expired");
        setLoading(false);
        return;
      }

      // Check already accepted
      if (inviteData.aceito) {
        // If logged in, check if user is already member
        if (session?.user) {
          const { data: member } = await supabase
            .from("estudio_membros")
            .select("id")
            .eq("estudio_id", inviteData.estudio_id)
            .eq("user_id", session.user.id)
            .eq("ativo", true)
            .maybeSingle();

          if (member) {
            toast.info("Você já é membro deste estúdio!");
            navigate(`/studio/manage/dashboard?studio=${inviteData.estudio_id}`, { replace: true });
            return;
          }
        }
        setInvite(inviteData);
        setError("already_used");
        setLoading(false);
        return;
      }

      setInvite(inviteData);

      // If not logged in, check if email has account
      // TODO: regenerar tipos do Supabase para incluir check_email_exists
      // Função existe no banco mas foi criada após a última geração de tipos O as any é um cast temporário que ignora a checagem de tipo. Não é elegante mas é seguro aqui — a função existe no banco, o TypeScript só não sabe disso ainda. Para o MVP está OK.
      if (!session?.user) {
        const { data: exists } = await (supabase as any).rpc("check_email_exists", {
          email_to_check: inviteData.email_convidado,
        });
        setExistingUser(!!exists);
      }

      setLoading(false);
    };

    init();
  }, [token, navigate]);

  // Effect 2: Auto-process if logged in with correct email
  useEffect(() => {
    if (!invite || !userEmail || !userId || invite.aceito || processing || processedRef.current) return;
    if (error) return;

    if (userEmail.toLowerCase() === invite.email_convidado.toLowerCase()) {
      processedRef.current = true;
      acceptInvite();
    }
  }, [invite, userEmail, userId]);

  const acceptInvite = async () => {
    if (!token) return;
    setProcessing(true);

    const { data, error: rpcError } = await supabase.rpc("accept_studio_invite", {
      invite_token: token,
    });

    if (rpcError) {
      console.error("Error accepting invite:", rpcError);
      setError("generic");
      setProcessing(false);
      return;
    }

    const result = data as unknown as { success: boolean; error?: string; already_member?: boolean };

    if (!result.success) {
      if (result.error === "email_mismatch") {
        setError("email_mismatch");
      } else if (result.error === "expired") {
        setError("expired");
      } else if (result.error === "already_accepted") {
        toast.info("Você já é membro deste estúdio!");
        navigate(`/studio/manage/dashboard?studio=${invite?.estudio_id}`, { replace: true });
        return;
      } else if (result.error === "no_profile") {
        // User has auth but no profile, redirect to onboarding
        navigate(`/onboarding?redirect=/invite/${token}`, { replace: true });
        return;
      } else {
        setError("generic");
      }
      setProcessing(false);
      return;
    }

    if (result.already_member) {
      toast.info("Você já é membro deste estúdio!");
    } else {
      toast.success(`Bem-vindo ao ${invite?.estudio_nome}!`);
    }
    navigate(`/studio/manage/dashboard?studio=${invite?.estudio_id}`, { replace: true });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = `/invite/${token}`;
  };

  const handleLoginRedirect = () => {
    navigate(`/login?redirect=${encodeURIComponent(`/invite/${token}`)}`);
  };

  const handleSignupRedirect = () => {
    navigate(
      `/signup?redirect=${encodeURIComponent(`/invite/${token}`)}&email=${encodeURIComponent(invite?.email_convidado || "")}`,
    );
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Validando convite...</p>
        </div>
      </div>
    );
  }

  // Processing
  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Adicionando você ao estúdio...</p>
          <p className="text-sm text-muted-foreground">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  // Error: not found
  if (error === "not_found") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-muted-foreground" />
            </div>
            <CardTitle className="font-display">Convite não encontrado</CardTitle>
            <CardDescription>Este link de convite é inválido ou já foi usado.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error: expired
  if (error === "expired" && invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Clock className="w-12 h-12 text-muted-foreground" />
            </div>
            <CardTitle className="font-display">Convite expirado</CardTitle>
            <CardDescription>
              Este convite expirou em{" "}
              {new Date(invite.expira_em).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
              .
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Entre em contato com <span className="font-medium text-foreground">{invite.estudio_nome}</span> para
              solicitar um novo convite.
            </p>
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => navigate("/")}>
                Voltar para Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error: already used
  if (error === "already_used") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-muted-foreground" />
            </div>
            <CardTitle className="font-display">Convite já utilizado</CardTitle>
            <CardDescription>Este convite já foi usado por outra pessoa.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error: email mismatch
  if (error === "email_mismatch" && invite && userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12 text-muted-foreground" />
            </div>
            <CardTitle className="font-display">Email incorreto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Este convite foi enviado para:</p>
              <p className="text-sm font-medium text-foreground bg-secondary/50 px-3 py-2 rounded-md text-center">
                {invite.email_convidado}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Você está logado como <span className="font-medium text-foreground">{userEmail}</span>. Faça logout e
              acesse novamente com o email correto.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
                Cancelar
              </Button>
              <Button className="flex-1 gap-2" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Fazer Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error: generic
  if (error === "generic") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-muted-foreground" />
            </div>
            <CardTitle className="font-display">Erro ao aceitar convite</CardTitle>
            <CardDescription>Ocorreu um erro ao processar o convite. Tente novamente.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not logged in: show invite card with login/signup
  if (!userId && invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="w-16 h-16">
                {invite.estudio_logo_url ? (
                  <AvatarImage src={invite.estudio_logo_url} alt={invite.estudio_nome} />
                ) : null}
                <AvatarFallback className="bg-secondary text-foreground">
                  <Building2 className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="font-display">Convite para {invite.estudio_nome}</CardTitle>
            <CardDescription>
              Você foi convidado para se juntar ao estúdio como{" "}
              <Badge variant="secondary" className="ml-1">
                {invite.role === "super_admin" ? "Super Admin" : "Membro"}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {existingUser ? "Faça login" : "Crie sua conta"} para aceitar o convite
            </p>
            <Button className="w-full" onClick={existingUser ? handleLoginRedirect : handleSignupRedirect}>
              {existingUser ? "Fazer Login" : "Criar Conta"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback (shouldn't reach here normally)
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
};

export default AcceptInvite;
