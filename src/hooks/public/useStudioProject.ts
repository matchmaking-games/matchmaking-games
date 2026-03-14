import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function fetchStudioProject(projectSlug: string) {
  const { data, error } = await supabase
    .from("projetos")
    .select("*, estudio:estudios(id, nome, slug, logo_url)")
    .eq("slug", projectSlug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export function useStudioProject(projectSlug: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["studio-project", projectSlug],
    queryFn: () => fetchStudioProject(projectSlug!),
    enabled: !!projectSlug,
    staleTime: 30000,
  });

  return { project: data ?? null, isLoading, error };
}
