import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type TipoEmprego = Database["public"]["Enums"]["tipo_emprego"];
type TipoEducacao = Database["public"]["Enums"]["tipo_educacao"];
type TipoProjeto = Database["public"]["Enums"]["tipo_projeto"];
type StatusProjeto = Database["public"]["Enums"]["status_projeto"];
type NivelHabilidade = Database["public"]["Enums"]["nivel_habilidade"];
type CategoriaHabilidade = Database["public"]["Enums"]["categoria_habilidade"];

export interface PublicUserData {
  id: string;
  nome_completo: string;
  titulo_profissional: string | null;
  bio_curta: string | null;
  sobre: string | null;
  estado: string | null;
  cidade: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  disponivel_para_trabalho: boolean | null;
  website: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  twitch_url: string | null;
  telegram_url: string | null;
  artstation_url: string | null;
  behance_url: string | null;
  dribbble_url: string | null;
  itch_url: string | null;
  pinterest_url: string | null;
  steam_url: string | null;
  email: string;
  telefone: string | null;
  mostrar_email: boolean | null;
  mostrar_telefone: boolean | null;
  slug: string;
  pronomes: string | null;
}

export interface PublicProjectData {
  id: string;
  titulo: string;
  slug: string | null;
  descricao: string | null;
  imagem_capa_url: string | null;
  tipo: TipoProjeto;
  status: StatusProjeto;
  destaque: boolean | null;
  demo_url: string | null;
  video_url: string | null;
  codigo_url: string | null;
  ordem: number | null;
  projeto_habilidades: {
    id: string;
    habilidade: {
      id: string;
      nome: string;
      categoria: CategoriaHabilidade;
    } | null;
  }[];
}

export interface PublicSkillData {
  id: string;
  nivel: NivelHabilidade;
  ordem: number | null;
  anos_experiencia: number | null;
  habilidade: {
    id: string;
    nome: string;
    categoria: CategoriaHabilidade;
  } | null;
}

// Tipo para cargo individual (de cargos_experiencia)
export interface PublicCargoData {
  id: string;
  titulo_cargo: string;
  tipo_emprego: TipoEmprego;
  inicio: string;
  fim: string | null;
  atualmente_trabalhando: boolean | null;
  descricao: string | null;
  ordem: number | null;
}

export interface PublicExperienceData {
  id: string;
  titulo_cargo: string;
  empresa: string;
  tipo_emprego: TipoEmprego;
  inicio: string;
  fim: string | null;
  atualmente_trabalhando: boolean | null;
  descricao: string | null;
  estado: string | null;
  cidade: string | null;
  remoto: string | null;
  estudio_id: string | null;
  cargos: PublicCargoData[];
}

export interface PublicEducationData {
  id: string;
  titulo: string;
  instituicao: string;
  tipo: TipoEducacao;
  area: string | null;
  inicio: string | null;
  fim: string | null;
  concluido: boolean | null;
  credencial_url: string | null;
  descricao: string | null;
  ordem: number | null;
}

export interface PublicProfileData {
  user: PublicUserData | null;
  featuredProjects: PublicProjectData[];
  otherProjects: PublicProjectData[];
  skills: PublicSkillData[];
  experiences: PublicExperienceData[];
  educations: PublicEducationData[];
}

async function fetchPublicProfile(slug: string): Promise<PublicProfileData> {
  // 1. Buscar usuário pelo slug
  const { data: user, error: userError } = await supabase
    .from("users")
    .select(`
      id, nome_completo, titulo_profissional,
      bio_curta, sobre, estado, cidade, avatar_url, banner_url,
      disponivel_para_trabalho, website, linkedin_url, github_url,
      portfolio_url, twitter_url, instagram_url, facebook_url, youtube_url,
      twitch_url, telegram_url, artstation_url, behance_url, dribbble_url,
      itch_url, pinterest_url, steam_url,
      email, telefone, mostrar_email, mostrar_telefone, slug, pronomes
    `)
    .eq("slug", slug)
    .single();

  if (userError || !user) {
    return {
      user: null,
      featuredProjects: [],
      otherProjects: [],
      skills: [],
      experiences: [],
      educations: [],
    };
  }

  // 2. Buscar projetos - em paralelo
  const [projectsRes, skillsRes, experiencesRes, educationsRes] = await Promise.all([
    supabase
      .from("projetos")
      .select(`
        id, titulo, slug, descricao, imagem_capa_url, tipo, status,
        destaque, demo_url, video_url, codigo_url, ordem,
        projeto_habilidades(id, habilidade:habilidades(id, nome, categoria))
      `)
      .eq("user_id", user.id)
      .order("ordem"),

    // 3. Buscar habilidades com join
    supabase
      .from("user_habilidades")
      .select(`id, nivel, ordem, anos_experiencia, habilidade:habilidades(id, nome, categoria)`)
      .eq("user_id", user.id)
      .order("ordem"),

    // 4. Buscar experiências (mais recentes primeiro) com cargos
    supabase
      .from("experiencia")
      .select(`
        id, titulo_cargo, empresa, tipo_emprego, inicio, fim,
        atualmente_trabalhando, descricao, estado, cidade, remoto, estudio_id,
        cargos:cargos_experiencia(
          id, titulo_cargo, tipo_emprego, inicio, fim,
          atualmente_trabalhando, descricao, ordem
        )
      `)
      .eq("user_id", user.id)
      .order("inicio", { ascending: false }),

    // 5. Buscar educação
    supabase
      .from("educacao")
      .select(`
        id, titulo, instituicao, tipo, area, inicio, fim,
        concluido, credencial_url, descricao, ordem
      `)
      .eq("user_id", user.id)
      .order("ordem"),
  ]);

  // Ordenar cargos client-side (mais recente primeiro)
  const experiencesWithSortedCargos = (experiencesRes.data || []).map(exp => ({
    ...exp,
    cargos: (exp.cargos || []).sort((a: PublicCargoData, b: PublicCargoData) => 
      new Date(b.inicio).getTime() - new Date(a.inicio).getTime()
    )
  }));

  const allProjects = (projectsRes.data || []) as PublicProjectData[];
  const featuredProjects = allProjects.filter(p => p.destaque === true);
  const otherProjects = allProjects.filter(p => p.destaque !== true);

  return {
    user: user as PublicUserData,
    featuredProjects,
    otherProjects,
    skills: (skillsRes.data || []) as PublicSkillData[],
    experiences: experiencesWithSortedCargos as PublicExperienceData[],
    educations: (educationsRes.data || []) as PublicEducationData[],
  };
}

export function usePublicProfile(slug: string | undefined) {
  return useQuery({
    queryKey: ["public-profile", slug],
    queryFn: () => fetchPublicProfile(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
