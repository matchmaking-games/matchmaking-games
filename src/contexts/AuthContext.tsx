import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface AuthUser {
  id: string;
  nome_completo: string;
  avatar_url: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasProfile: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  hasProfile: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if ((event === "INITIAL_SESSION" || event === "SIGNED_IN") && currentSession) {
        setSession(currentSession);
        try {
          const { data } = await supabase
            .from("users")
            .select("nome_completo, avatar_url")
            .eq("id", currentSession.user.id)
            .maybeSingle();

          if (data) {
            setUser({
              id: currentSession.user.id,
              nome_completo: data.nome_completo,
              avatar_url: data.avatar_url,
            });
            setHasProfile(true);
          } else {
            setUser(null);
            setHasProfile(false);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(null);
          setHasProfile(false);
        } finally {
          setIsLoading(false);
        }
      } else if (event === "SIGNED_OUT" || !currentSession) {
        setSession(null);
        setUser(null);
        setHasProfile(false);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        isAuthenticated: !!session,
        hasProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
