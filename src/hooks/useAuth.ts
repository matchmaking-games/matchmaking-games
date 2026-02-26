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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
          try {
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
              } else {
                setUser(null);
              }
            } else {
              setUser(null);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          } finally {
            setIsLoading(false);
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
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
