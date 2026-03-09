export interface StudioCard {
  id: string;
  nome: string;
  slug: string;
  logo_url: string | null;
  sobre: string | null;
  cidade: string | null;
  estado: string | null;
  tamanho: string | null;
  especialidades: string[];
  website: string | null;
  criado_em: string;
  rank: number;
}

export interface StudioFilters {
  searchText: string | null;
  estado: string | null;
  tamanho: string | null;
  especialidades: string[];
}

export interface StudioCursor {
  criado_em: string;
  id: string;
}
