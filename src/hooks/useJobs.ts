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

export interface JobFiltersParams {
  nivel?: string | null;
  tipoContrato?: string | null;
  modeloTrabalho?: string | null;
  localizacao?: string | null;
  habilidades?: string[];
  searchText?: string | null;
}

async function fetchJobs(filters: JobFiltersParams): Promise<VagaListItem[]> {
  const now = new Date().toISOString();

  // Usar optional chaining para evitar edge case de array vazio
  // filters.habilidades?.length retorna undefined se null/undefined, 0 se [], N se tem IDs
  let vagaIdsWithSkills: string[] | null = null;

  if (filters.habilidades?.length) {
    const { data: vagaHabilidades, error: skillsError } = await supabase
      .from("vaga_habilidades")
      .select("vaga_id")
      .in("habilidade_id", filters.habilidades);

    if (skillsError) {
      console.error("Error fetching vaga_habilidades:", skillsError);
      throw new Error("Erro ao filtrar por habilidades.");
    }

    vagaIdsWithSkills = [...new Set(vagaHabilidades?.map((vh) => vh.vaga_id) || [])];

    if (vagaIdsWithSkills.length === 0) {
      return [];
    }
  }

  let query = supabase
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
    .gt("expira_em", now);

  if (filters.nivel) {
    query = query.eq("nivel", filters.nivel as NivelVaga);
  }

  if (filters.tipoContrato) {
    query = query.eq("tipo_contrato", filters.tipoContrato as TipoContrato);
  }

  if (filters.modeloTrabalho) {
    query = query.eq("remoto", filters.modeloTrabalho as TipoTrabalho);
  }

  if (filters.localizacao) {
    query = query.ilike("localizacao", `%${filters.localizacao}%`);
  }

  if (vagaIdsWithSkills) {
    query = query.in("id", vagaIdsWithSkills);
  }

  // PERFORMANCE: Busca por texto usando .ilike() faz sequential scan.
  // Para MVP (<500 vagas) e aceitavel (~50-100ms com debounce de 500ms).
  //
  // Se queries ficarem lentas (>500ms) no futuro:
  // 1. Adicionar indice GIN full-text search
  // 2. Ou limitar busca apenas ao campo 'titulo'
  // 3. Ou considerar Algolia quando passar de 5000 vagas
  if (filters.searchText) {
    const searchTerm = `%${filters.searchText}%`;
    query = query.or(`titulo.ilike.${searchTerm},descricao.ilike.${searchTerm}`);
  }

  query = query
    .order("tipo_publicacao", { ascending: false })
    .order("criada_em", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching jobs:", error);
    throw new Error("Não foi possível carregar as vagas.");
  }

  return (data || []) as VagaListItem[];
}

export function useJobs(filters: JobFiltersParams = {}) {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => fetchJobs(filters),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}
