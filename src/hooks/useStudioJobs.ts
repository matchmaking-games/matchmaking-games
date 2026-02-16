import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type NivelVaga = Database["public"]["Enums"]["nivel_vaga"];
type TipoContrato = Database["public"]["Enums"]["tipo_contrato"];
type TipoPublicacaoVaga = Database["public"]["Enums"]["tipo_publicacao_vaga"];

export interface StudioVaga {
  id: string;
  titulo: string;
  slug: string;
  nivel: NivelVaga;
  tipo_contrato: TipoContrato;
  ativa: boolean | null;
  tipo_publicacao: TipoPublicacaoVaga | null;
  criada_em: string | null;
  atualizada_em: string | null;
  expira_em: string | null;
  estudio_id: string;
  status: string | null;
}

interface UseStudioJobsReturn {
  vagas: StudioVaga[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  toggleAtiva: (id: string, currentValue: boolean) => Promise<void>;
  deleteVaga: (id: string) => Promise<void>;
}

export function useStudioJobs(estudioId: string | null): UseStudioJobsReturn {
  const [vagas, setVagas] = useState<StudioVaga[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVagas = useCallback(async () => {
    if (!estudioId) {
      setVagas([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("vagas")
        .select("id, titulo, slug, nivel, tipo_contrato, ativa, tipo_publicacao, criada_em, atualizada_em, expira_em, estudio_id, status")
        .eq("estudio_id", estudioId)
        .order("atualizada_em", { ascending: false });

      if (fetchError) throw fetchError;

      setVagas(data || []);
    } catch (err) {
      console.error("Error fetching vagas:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar vagas");
    } finally {
      setIsLoading(false);
    }
  }, [estudioId]);

  useEffect(() => {
    fetchVagas();
  }, [fetchVagas]);

  const toggleAtiva = useCallback(async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("vagas")
      .update({ ativa: !currentValue })
      .eq("id", id);

    if (error) throw error;
  }, []);

  const deleteVaga = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("vagas")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }, []);

  return {
    vagas,
    isLoading,
    error,
    refetch: fetchVagas,
    toggleAtiva,
    deleteVaga,
  };
}
