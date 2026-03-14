import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        // setTimeout obrigatório para evitar deadlock do Supabase
        // (chamadas async dentro de onAuthStateChange travam o lock interno)
        setTimeout(async () => {
          const pendingSlug = localStorage.getItem("pending_slug");
          const pendingRedirect = localStorage.getItem("pending_redirect");
          localStorage.removeItem("pending_slug");
          localStorage.removeItem("pending_redirect");

          const { data: profile } = await supabase
            .from("users")
            .select("id")
            .eq("id", session.user.id)
            .maybeSingle();

          if (profile) {
            navigate(pendingRedirect || "/dashboard", { replace: true });
          } else {
            const params = new URLSearchParams();
            if (pendingSlug) params.set("slug", pendingSlug);
            if (pendingRedirect) params.set("redirect", pendingRedirect);
            const qs = params.toString();
            navigate(qs ? `/onboarding?${qs}` : "/onboarding", { replace: true });
          }
        }, 0);
      } else if (event === "SIGNED_OUT") {
        navigate("/login", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
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
