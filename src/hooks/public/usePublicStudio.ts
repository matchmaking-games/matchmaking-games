import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VagaListItem } from "@/hooks/search/useJobs";
import { Tables } from "@/integrations/supabase/types";

type Studio = Tables<"estudios">;

interface PublicStudioData {
  studio: Studio | null;
  vagas: VagaListItem[];
}

async function fetchPublicStudio(slug: string): Promise<PublicStudioData> {
  const { data: studio, error: studioError } = await supabase
    .from("estudios")
    .select("id, nome, slug, logo_url, sobre, cidade, estado, tamanho, website, fundado_em, especialidades, linkedin_url, github_url, twitter_url, instagram_url, facebook_url, youtube_url, twitch_url, telegram_url, artstation_url, behance_url, dribbble_url, itch_url, pinterest_url")
    .eq("slug", slug)
    .maybeSingle();

  if (studioError) throw studioError;
  if (!studio) return { studio: null, vagas: [] };

  const now = new Date().toISOString();

  const { data: vagas, error: vagasError } = await supabase
    .from("vagas")
    .select(`
      id, titulo, slug, nivel, remoto, tipo_emprego, tipo_publicacao, estado, cidade, criada_em,
      estudio:estudios(nome, slug, logo_url, estado, cidade),
      vaga_habilidades(id, obrigatoria, habilidade:habilidades(id, nome, categoria))
    `)
    .eq("estudio_id", studio.id)
    .eq("ativa", true)
    .gt("expira_em", now)
    .order("tipo_publicacao", { ascending: false })
    .order("criada_em", { ascending: false });

  if (vagasError) throw vagasError;

  return {
    studio: studio as Studio,
    vagas: (vagas || []) as VagaListItem[],
  };
}

export function usePublicStudio(slug: string | undefined) {
  return useQuery({
    queryKey: ["public-studio", slug],
    queryFn: () => fetchPublicStudio(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}
