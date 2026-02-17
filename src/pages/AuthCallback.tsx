import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth callback error:", error);
        navigate("/login");
        return;
      }
      
      if (!session) {
        console.error("Auth callback: No session found");
        navigate("/login");
        return;
      }
      
      // Recuperar dados do localStorage
      const pendingSlug = localStorage.getItem("pending_slug");
      const pendingRedirect = localStorage.getItem("pending_redirect");
      localStorage.removeItem("pending_slug");
      localStorage.removeItem("pending_redirect");
      
      // Verificar se perfil já existe
      const { data: profile } = await supabase
        .from("users")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();
      
      if (profile) {
        // Perfil existe: ir para redirect ou dashboard
        navigate(pendingRedirect || "/dashboard");
      } else {
        // Sem perfil: ir para onboarding
        const params = new URLSearchParams();
        if (pendingSlug) params.set("slug", pendingSlug);
        if (pendingRedirect) params.set("redirect", pendingRedirect);
        const qs = params.toString();
        navigate(qs ? `/onboarding?${qs}` : "/onboarding");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Processando...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
