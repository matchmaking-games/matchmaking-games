import { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      // 1. Verificar sessão ativa
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      // 2. Verificar se existe perfil na tabela users
      const { data: profile, error } = await supabase
        .from("users")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking user profile:", error);
        navigate("/login");
        return;
      }

      if (!profile) {
        // Usuário autenticado mas sem perfil -> precisa completar onboarding
        navigate("/onboarding");
        return;
      }

      // 3. Usuário autenticado E tem perfil -> autorizado
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuthAndProfile();

    // Listener para mudanças de auth (logout, expiração de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          navigate("/login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Loading state - tela de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se não está autorizado, não renderiza nada (já foi redirecionado)
  if (!isAuthorized) {
    return null;
  }

  // Renderizar conteúdo protegido
  return <>{children}</>;
};

export default ProtectedRoute;
