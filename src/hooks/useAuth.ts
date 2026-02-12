import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AuthUser {
  id: string;
  nome_completo: string;
  avatar_url: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data } = await supabase
            .from("users")
            .select("nome_completo, avatar_url")
            .eq("id", session.user.id)
            .maybeSingle();
          
          if (data) {
            setUser({
              id: session.user.id,
              nome_completo: data.nome_completo,
              avatar_url: data.avatar_url,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching auth session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (event === "SIGNED_IN" && session) {
            const { data } = await supabase
              .from("users")
              .select("nome_completo, avatar_url")
              .eq("id", session.user.id)
              .maybeSingle();
            
            if (data) {
              setUser({
                id: session.user.id,
                nome_completo: data.nome_completo,
                avatar_url: data.avatar_url,
              });
            }
          } else if (event === "SIGNED_OUT") {
            setUser(null);
          }
        } catch (error) {
          console.error("Error in auth state change:", error);
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
  };
}
