import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ProjectCard, ProjectFilters, ProjectCursor } from "@/types/project-search";

export interface ProjectSearchParams extends Partial<ProjectFilters> {
  pageSize?: number;
  cursor?: ProjectCursor | null;
}

export interface ProjectSearchResult {
  projects: ProjectCard[];
  hasNextPage: boolean;
  nextCursor: ProjectCursor | null;
}

async function fetchProjects(params: ProjectSearchParams): Promise<ProjectSearchResult> {
  const pageSize = params.pageSize ?? 20;

  const rpcParams: Record<string, unknown> = {
    p_limit: pageSize + 1,
  };

  if (params.searchText && params.searchText !== "") {
    rpcParams.p_search = params.searchText;
  }

  if (params.engine) {
    rpcParams.p_engine = params.engine;
  }

  if (params.plataformas && params.plataformas.length > 0) {
    rpcParams.p_plataformas = params.plataformas;
  }

  if (params.genero && params.genero.length > 0) {
    rpcParams.p_genero = params.genero;
  }

  if (params.cursor) {
    rpcParams.p_cursor_criado_em = params.cursor.criado_em;
    rpcParams.p_cursor_id = params.cursor.id;
  }

  const { data, error } = await supabase.rpc("search_projects", rpcParams);

  if (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Não foi possível carregar os projetos.");
  }

  const allResults = (data || []) as unknown as ProjectCard[];

  const hasNextPage = allResults.length > pageSize;
  const projects = hasNextPage ? allResults.slice(0, pageSize) : allResults;

  const lastItem = projects[projects.length - 1];
  const nextCursor: ProjectCursor | null = hasNextPage && lastItem
    ? { criado_em: lastItem.criado_em, id: lastItem.id }
    : null;

  return { projects, hasNextPage, nextCursor };
}

export function useProjectSearch(params: ProjectSearchParams = {}) {
  const { searchText, engine, plataformas, genero, cursor } = params;

  return useQuery({
    queryKey: ["projects-search", { searchText, engine, plataformas, genero, cursor }],
    queryFn: () => fetchProjects(params),
    staleTime: 30_000,
    retry: 2,
  });
}
