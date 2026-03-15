import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type NivelVaga = Database["public"]["Enums"]["nivel_vaga"];
type TipoEmprego = Database["public"]["Enums"]["tipo_emprego"];
type TipoTrabalho = Database["public"]["Enums"]["modalidade_trabalho"];
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
  estado: string | null;
  cidade: string | null;
}

export interface VagaListItem {
  id: string;
  titulo: string;
  slug: string;
  nivel: NivelVaga;
  remoto: TipoTrabalho;
  tipo_emprego: TipoEmprego;
  tipo_publicacao: TipoPublicacaoVaga | null;
  estado: string | null;
  cidade: string | null;
  criada_em: string | null;
  estudio: VagaEstudioData | null;
  vaga_habilidades: VagaHabilidadeData[];
}

export interface JobCursor {
  tipo_publicacao: string | null;
  criada_em: string;
  id: string;
}

export interface JobFiltersParams {
  nivel?: string | null;
  tipoContrato?: string | null;
  modeloTrabalho?: string | null;
  tipoFuncao?: string | null;
  estado?: string | null;
  cidade?: string | null;
  habilidades?: string[];
  searchText?: string | null;
  pageSize?: number;
  cursor?: JobCursor | null;
}

export interface JobsQueryResult {
  jobs: VagaListItem[];
  hasNextPage: boolean;
  nextCursor: JobCursor | null;
}

async function fetchJobs(filters: JobFiltersParams): Promise<JobsQueryResult> {
  const now = new Date().toISOString();
  const pageSize = filters.pageSize || 20;
  const cursor = filters.cursor;

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
      return { jobs: [], hasNextPage: false, nextCursor: null };
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
      tipo_emprego,
      tipo_publicacao,
      estado,
      estado,
      cidade,
      criada_em,
      estudio:estudios(nome, slug, logo_url, estado, cidade),
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
    query = query.eq("tipo_emprego", filters.tipoContrato as TipoEmprego);
  }

  if (filters.modeloTrabalho) {
    query = query.eq("remoto", filters.modeloTrabalho as TipoTrabalho);
  }

  // Location filter: estado and cidade
  if (filters.cidade && filters.estado) {
    query = query.eq("cidade", filters.cidade).eq("estado", filters.estado);
  } else if (filters.estado) {
    query = query.eq("estado", filters.estado);
  }

  if (vagaIdsWithSkills) {
    query = query.in("id", vagaIdsWithSkills);
  }

  // Filtro por tipo de função via tabela de relacionamento
  if (filters.tipoFuncao) {
    const { data: vagaTipos, error: tiposError } = await supabase
      .from("vaga_tipos_funcao")
      .select("vaga_id")
      .eq("tipo_funcao_id", filters.tipoFuncao);

    if (tiposError) {
      console.error("Error fetching vaga_tipos_funcao:", tiposError);
      throw new Error("Erro ao filtrar por tipo de função.");
    }

    const vagaIdsWithTipo = [...new Set(vagaTipos?.map((vt) => vt.vaga_id) || [])];

    if (vagaIdsWithTipo.length === 0) {
      return { jobs: [], hasNextPage: false, nextCursor: null };
    }

    query = query.in("id", vagaIdsWithTipo);
  }

  // Aplicar cursor para paginação
  if (cursor) {
    const tipoCursor = cursor.tipo_publicacao || 'gratuita';
    const cursorFilter = [
      `tipo_publicacao.lt.${tipoCursor}`,
      `and(tipo_publicacao.eq.${tipoCursor},criada_em.lt.${cursor.criada_em})`,
      `and(tipo_publicacao.eq.${tipoCursor},criada_em.eq.${cursor.criada_em},id.lt.${cursor.id})`
    ].join(',');
    
    query = query.or(cursorFilter);
  }

  // PERFORMANCE: Busca por texto usando .ilike() faz sequential scan.
  // Para MVP (<500 vagas) e aceitavel (~50-100ms com debounce de 500ms).
  if (filters.searchText) {
    const searchTerm = `%${filters.searchText}%`;
    query = query.or(`titulo.ilike.${searchTerm},descricao.ilike.${searchTerm}`);
  }

  // Ordenação e limite (buscar pageSize + 1 para detectar próxima página)
  query = query
    .order("tipo_publicacao", { ascending: false })
    .order("criada_em", { ascending: false })
    .order("id", { ascending: false })
    .limit(pageSize + 1);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching jobs:", error);
    throw new Error("Não foi possível carregar as vagas.");
  }

  const allJobs = (data || []) as VagaListItem[];
  
  // Detectar se há próxima página
  const hasNextPage = allJobs.length > pageSize;
  
  // Retornar apenas pageSize vagas (descartar a extra)
  const jobs = hasNextPage ? allJobs.slice(0, pageSize) : allJobs;
  
  // Construir cursor da última vaga para próxima página
  const lastJob = jobs[jobs.length - 1];
  const nextCursor: JobCursor | null = lastJob ? {
    tipo_publicacao: lastJob.tipo_publicacao,
    criada_em: lastJob.criada_em!,
    id: lastJob.id,
  } : null;

  return {
    jobs,
    hasNextPage,
    nextCursor,
  };
}

export function useJobs(filters: JobFiltersParams = {}) {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => fetchJobs(filters),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}
