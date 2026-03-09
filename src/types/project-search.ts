export interface ProjectCard {
  id: string;
  titulo: string;
  slug: string;
  tipo: string;
  status: string;
  engine: string | null;
  plataformas: string[];
  genero: string[];
  imagem_capa_url: string | null;
  demo_url: string | null;
  codigo_url: string | null;
  steam_url: string | null;
  descricao: string | null;
  destaque: boolean;
  visualizacoes: number;
  criado_em: string;
  rank: number;
  user_id: string | null;
  user_slug: string | null;
  user_nome: string | null;
  user_avatar_url: string | null;
  estudio_id: string | null;
  estudio_slug: string | null;
  estudio_nome: string | null;
  estudio_logo_url: string | null;
}

export interface ProjectFilters {
  searchText: string | null;
  engine: string | null;
  plataformas: string[];
  genero: string[];
}

export interface ProjectCursor {
  criado_em: string;
  id: string;
}
