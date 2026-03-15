import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { StudioCard, StudioFilters, StudioCursor } from "@/types/studio";

export interface StudiosQueryParams extends Partial<StudioFilters> {
  pageSize?: number;
  cursor?: StudioCursor | null;
}

export interface StudiosQueryResult {
  studios: StudioCard[];
  hasNextPage: boolean;
  nextCursor: StudioCursor | null;
}

async function fetchStudios(params: StudiosQueryParams): Promise<StudiosQueryResult> {
  const pageSize = params.pageSize ?? 20;

  const rpcParams: Record<string, unknown> = {
    p_limit: pageSize + 1,
  };

  if (params.searchText) {
    rpcParams.p_search = params.searchText;
  }

  if (params.estado) {
    rpcParams.p_estado = params.estado;
  }

  if (params.tamanho) {
    rpcParams.p_tamanho = params.tamanho;
  }

  if (params.especialidades && params.especialidades.length > 0) {
    rpcParams.p_especialidades = params.especialidades;
  }

  if (params.cursor) {
    rpcParams.p_cursor_criado_em = params.cursor.criado_em;
    rpcParams.p_cursor_id = params.cursor.id;
  }

  const { data, error } = await supabase.rpc("search_studios", rpcParams);

  if (error) {
    console.error("Error fetching studios:", error);
    throw new Error("Não foi possível carregar os estúdios.");
  }

  const allResults = (data || []) as unknown as StudioCard[];

  const hasNextPage = allResults.length > pageSize;
  const studios = hasNextPage ? allResults.slice(0, pageSize) : allResults;

  const lastItem = studios[studios.length - 1];
  const nextCursor: StudioCursor | null = lastItem
    ? { criado_em: lastItem.criado_em, id: lastItem.id }
    : null;

  return { studios, hasNextPage, nextCursor };
}

export function useStudios(params: StudiosQueryParams = {}) {
  const { searchText, estado, tamanho, especialidades, cursor } = params;

  return useQuery({
    queryKey: ["studios", { searchText, estado, tamanho, especialidades, cursor }],
    queryFn: () => fetchStudios(params),
    staleTime: 30_000,
    retry: 2,
  });
}
