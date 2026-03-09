export interface ProfessionalSkill {
  id: string;
  nome: string;
  categoria: string;
}

export interface ProfessionalCard {
  id: string;
  nome_completo: string;
  slug: string;
  avatar_url: string | null;
  titulo_profissional: string | null;
  bio_curta: string | null;
  cidade: string | null;
  estado: string | null;
  disponivel_para_trabalho: boolean;
  tipo_trabalho_preferido: string[] | null;
  habilidades: ProfessionalSkill[];
  total_habilidades: number;
  criado_em: string;
  rank: number;
}

export interface ProfessionalFilters {
  searchText: string | null;
  disponivel: boolean | null;
  estado: string | null;
  tipoTrabalho: string[] | null;
  habilidades: string[] | null;
}

export interface ProfessionalCursor {
  criado_em: string;
  id: string;
}
