import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectOwner {
  id: string;
  nome_completo: string;
  titulo_profissional: string | null;
  avatar_url: string | null;
  slug: string;
}

export interface ProjectSkill {
  id: string;
  nome: string;
  categoria: string;
  icone_url: string | null;
}

export interface ProjectStudio {
  id: string;
  nome: string;
  slug: string;
  logo_url: string | null;
}

export interface ProjectDetailData {
  project: {
    id: string;
    titulo: string;
    descricao: string | null;
    tipo: string;
    status: string;
    papel: string | null;
    inicio: string | null;
    fim: string | null;
    imagem_capa_url: string | null;
    video_url: string | null;
    demo_url: string | null;
    codigo_url: string | null;
    slug: string | null;
    descricao_rich: any | null;
  };
  owner: ProjectOwner;
  skills: ProjectSkill[];
  studios: ProjectStudio[];
}

async function fetchProjectDetail(userSlug: string, projectSlug: string): Promise<ProjectDetailData | null> {
  // 1. Fetch user by slug
  const { data: user, error: userError } = await supabase
    .from("public_profiles")
    .select("id, nome_completo, titulo_profissional, avatar_url, slug")
    .eq("slug", userSlug)
    .single();

  if (userError || !user) return null;

  // 2. Fetch project by slug (fallback to id)
  let projectQuery = supabase
    .from("projetos")
    .select(
      "id, titulo, descricao, descricao_rich, tipo, status, papel, inicio, fim, imagem_capa_url, video_url, demo_url, codigo_url, slug",
    )
    .eq("user_id", user.id);

  // Try slug first, fallback to id
  const { data: projectBySlug } = await projectQuery.eq("slug", projectSlug).maybeSingle();

  let project = projectBySlug;

  if (!project) {
    const { data: projectById } = await supabase
      .from("projetos")
      .select(
        "id, titulo, descricao, descricao_rich, tipo, status, papel, inicio, fim, imagem_capa_url, video_url, demo_url, codigo_url, slug",
      )
      .eq("user_id", user.id)
      .eq("id", projectSlug)
      .maybeSingle();

    project = projectById;
  }

  if (!project) return null;

  // 3. Fetch skills
  const { data: skillLinks } = await supabase
    .from("projeto_habilidades")
    .select("habilidade_id, habilidades(id, nome, categoria, icone_url)")
    .eq("projeto_id", project.id);

  const skills: ProjectSkill[] = (skillLinks || []).map((link: any) => link.habilidades).filter(Boolean);

  // 4. Fetch studios
  const { data: studioLinks } = await supabase
    .from("projeto_estudios")
    .select("estudio_id, estudios(id, nome, slug, logo_url)")
    .eq("projeto_id", project.id);

  const studios: ProjectStudio[] = (studioLinks || []).map((link: any) => link.estudios).filter(Boolean);

  return {
    project,
    owner: user,
    skills,
    studios,
  };
}

export function useProjectDetail(userSlug?: string, projectSlug?: string) {
  return useQuery({
    queryKey: ["project-detail", userSlug, projectSlug],
    queryFn: () => fetchProjectDetail(userSlug!, projectSlug!),
    enabled: !!userSlug && !!projectSlug,
    staleTime: 5 * 60 * 1000,
  });
}
