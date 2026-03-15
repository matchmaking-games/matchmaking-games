import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardProfile {
  avatar_url: string | null;
  titulo_profissional: string | null;
  bio_curta: string | null;
  cidade: string | null;
  slug: string;
  nome_completo: string;
}

interface UseDashboardProfileReturn {
  user: DashboardProfile | null;
  skillsCount: number;
  isLoading: boolean;
  error: string | null;
}

export function useDashboardProfile(): UseDashboardProfileReturn {
  const [user, setUser] = useState<DashboardProfile | null>(null);
  const [skillsCount, setSkillsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Não autenticado");

      const [profileRes, skillsRes] = await Promise.all([
        supabase
          .from("users")
          .select("avatar_url, titulo_profissional, bio_curta, cidade, slug, nome_completo")
          .eq("id", authUser.id)
          .single(),
        supabase
          .from("user_habilidades")
          .select("id", { count: "exact", head: true })
          .eq("user_id", authUser.id),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (skillsRes.error) throw skillsRes.error;

      setUser(profileRes.data);
      setSkillsCount(skillsRes.count ?? 0);
    } catch (err) {
      console.error("Error fetching dashboard profile:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar perfil");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { user, skillsCount, isLoading, error };
}
