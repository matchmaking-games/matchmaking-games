import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type NivelVaga = Database["public"]["Enums"]["nivel_vaga"];
type TipoContrato = Database["public"]["Enums"]["tipo_contrato"];
type TipoTrabalho = Database["public"]["Enums"]["tipo_trabalho"];
type TipoPublicacaoVaga = Database["public"]["Enums"]["tipo_publicacao_vaga"];
type CategoriaHabilidade = Database["public"]["Enums"]["categoria_habilidade"];

export interface VagaHabilidadeData {
  id: string;
  obrigatoria: boolean | null;
  habilidade: {
    id: string;
    nome: string;
    categoria: CategoriaHabilidade;
  } | null;
}

export interface VagaEstudioData {
  nome: string;
  slug: string;
  logo_url: string | null;
  localizacao: string | null;
}

export interface VagaListItem {
  id: string;
  titulo: string;
  slug: string;
  nivel: NivelVaga;
  remoto: TipoTrabalho;
  tipo_contrato: TipoContrato;
  tipo_publicacao: TipoPublicacaoVaga | null;
  tipo_funcao: string[];
  localizacao: string | null;
  criada_em: string | null;
  estudio: VagaEstudioData | null;
  vaga_habilidades: VagaHabilidadeData[];
}

async function fetchJobs(): Promise<VagaListItem[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("vagas")
    .select(`
      id,
      titulo,
      slug,
      nivel,
      remoto,
      tipo_contrato,
      tipo_publicacao,
      tipo_funcao,
      localizacao,
      criada_em,
      estudio:estudios(nome, slug, logo_url, localizacao),
      vaga_habilidades(
        id,
        obrigatoria,
        habilidade:habilidades(id, nome, categoria)
      )
    `)
    .eq("ativa", true)
    .gt("expira_em", now)
    .order("tipo_publicacao", { ascending: false })
    .order("criada_em", { ascending: false });

  if (error) {
    console.error("Error fetching jobs:", error);
    throw new Error("Não foi possível carregar as vagas.");
  }

  return (data || []) as VagaListItem[];
}

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}
