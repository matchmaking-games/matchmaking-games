import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RecentJob {
  id: string;
  titulo: string;
  slug: string;
  nivel: string;
  cidade: string | null;
  estado: string | null;
  estudio: {
    nome: string;
    slug: string;
    logo_url: string | null;
  };
}

interface UseRecentJobsReturn {
  jobs: RecentJob[];
  isLoading: boolean;
  error: string | null;
}

export function useRecentJobs(): UseRecentJobsReturn {
  const [jobs, setJobs] = useState<RecentJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const now = new Date().toISOString();

      const { data, error: fetchError } = await supabase
        .from("vagas")
        .select("id, titulo, slug, nivel, cidade, estado, estudio:estudios!estudio_id(nome, slug, logo_url)")
        .eq("status", "publicada")
        .eq("ativa", true)
        .gt("expira_em", now)
        .order("criada_em", { ascending: false })
        .limit(5);

      if (fetchError) throw fetchError;

      const mapped: RecentJob[] = (data ?? []).map((v: any) => ({
        id: v.id,
        titulo: v.titulo,
        slug: v.slug,
        nivel: v.nivel,
        cidade: v.cidade,
        estado: v.estado,
        estudio: {
          nome: v.estudio?.nome ?? "",
          slug: v.estudio?.slug ?? "",
          logo_url: v.estudio?.logo_url ?? null,
        },
      }));

      setJobs(mapped);
    } catch (err) {
      console.error("Error fetching recent jobs:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar vagas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { jobs, isLoading, error };
}
