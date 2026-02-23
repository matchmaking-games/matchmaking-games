import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StudioDashboardStats {
  ativas: number;
  rascunhos: number;
  expiradas: number;
  destaque: number;
}

interface UseStudioDashboardStatsReturn {
  stats: StudioDashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

export function useStudioDashboardStats(estudioId: string | null): UseStudioDashboardStatsReturn {
  const [stats, setStats] = useState<StudioDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!estudioId) {
      setStats(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const now = new Date().toISOString();

      const [ativasRes, rascunhosRes, expiradasRes, destaqueRes] = await Promise.all([
        supabase
          .from("vagas")
          .select("id", { count: "exact", head: true })
          .eq("estudio_id", estudioId)
          .eq("status", "publicada")
          .eq("ativa", true)
          .gt("expira_em", now),
        supabase
          .from("vagas")
          .select("id", { count: "exact", head: true })
          .eq("estudio_id", estudioId)
          .eq("status", "rascunho"),
        supabase
          .from("vagas")
          .select("id", { count: "exact", head: true })
          .eq("estudio_id", estudioId)
          .eq("status", "expirada"),
        supabase
          .from("vagas")
          .select("id", { count: "exact", head: true })
          .eq("estudio_id", estudioId)
          .eq("status", "publicada")
          .eq("tipo_publicacao", "destaque")
          .eq("ativa", true)
          .gt("expira_em", now),
      ]);

      if (ativasRes.error) throw ativasRes.error;
      if (rascunhosRes.error) throw rascunhosRes.error;
      if (expiradasRes.error) throw expiradasRes.error;
      if (destaqueRes.error) throw destaqueRes.error;

      setStats({
        ativas: ativasRes.count ?? 0,
        rascunhos: rascunhosRes.count ?? 0,
        expiradas: expiradasRes.count ?? 0,
        destaque: destaqueRes.count ?? 0,
      });
    } catch (err) {
      console.error("Error fetching studio dashboard stats:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar estatísticas");
    } finally {
      setIsLoading(false);
    }
  }, [estudioId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error };
}
