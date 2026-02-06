import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface JobDetailData {
  id: string;
  titulo: string;
  slug: string;
  descricao: string;
  nivel: string;
  tipo_contrato: string;
  remoto: string;
  estado: string | null;
  cidade: string | null;
  salario_min: number | null;
  salario_max: number | null;
  mostrar_salario: boolean | null;
  contato_candidatura: string | null;
  criada_em: string | null;
  estudio: {
    id: string;
    nome: string;
    slug: string;
    logo_url: string | null;
    estado: string | null;
    cidade: string | null;
    tamanho: string | null;
  } | null;
  habilidades: {
    obrigatoria: boolean | null;
    habilidade: {
      id: string;
      nome: string;
      categoria: string;
    } | null;
  }[];
}

async function fetchJobDetail(slug: string): Promise<JobDetailData | null> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("vagas")
    .select(`
      id, titulo, slug, descricao, nivel, tipo_contrato, remoto,
      estado, cidade, salario_min, salario_max, mostrar_salario,
      contato_candidatura, criada_em,
      estudio:estudios(id, nome, slug, logo_url, estado, cidade, tamanho),
      habilidades:vaga_habilidades(
        obrigatoria,
        habilidade:habilidades(id, nome, categoria)
      )
    `)
    .eq("slug", slug)
    .eq("ativa", true)
    .gt("expira_em", now)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No result found
      return null;
    }
    console.error("Error fetching job detail:", error);
    throw new Error("Erro ao carregar vaga.");
  }

  return data as JobDetailData;
}

export function useJobDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ["job-detail", slug],
    queryFn: () => fetchJobDetail(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
