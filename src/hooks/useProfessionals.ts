import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ProfessionalCard, ProfessionalFilters, ProfessionalCursor } from "@/types/professional";

export interface ProfessionalsQueryParams extends Partial<ProfessionalFilters> {
  pageSize?: number;
  cursor?: ProfessionalCursor | null;
}

export interface ProfessionalsQueryResult {
  professionals: ProfessionalCard[];
  hasNextPage: boolean;
  nextCursor: ProfessionalCursor | null;
}

async function fetchProfessionals(params: ProfessionalsQueryParams): Promise<ProfessionalsQueryResult> {
  const pageSize = params.pageSize ?? 20;
  const cursor = params.cursor ?? null;

  // Build RPC params — omit null/empty values
  const rpcParams: Record<string, unknown> = {
    p_limit: pageSize + 1,
  };

  if (params.searchText) {
    rpcParams.p_search = params.searchText;
  }

  if (params.disponivel !== null && params.disponivel !== undefined) {
    rpcParams.p_disponivel = params.disponivel;
  }

  if (params.estado) {
    rpcParams.p_estado = params.estado;
  }

  if (params.tipoTrabalho && params.tipoTrabalho.length > 0) {
    rpcParams.p_tipo_trabalho = params.tipoTrabalho;
  }

  if (params.habilidades && params.habilidades.length > 0) {
    rpcParams.p_habilidades = params.habilidades;
  }

  if (cursor) {
    rpcParams.p_cursor_criado_em = cursor.criado_em;
    rpcParams.p_cursor_id = cursor.id;
  }

  const { data, error } = await supabase.rpc("search_professionals", rpcParams);

  if (error) {
    console.error("Error fetching professionals:", error);
    throw new Error("Não foi possível carregar os profissionais.");
  }

  const allResults = (data || []) as ProfessionalCard[];

  const hasNextPage = allResults.length > pageSize;
  const professionals = hasNextPage ? allResults.slice(0, pageSize) : allResults;

  const lastItem = professionals[professionals.length - 1];
  const nextCursor: ProfessionalCursor | null = lastItem
    ? { criado_em: lastItem.criado_em, id: lastItem.id }
    : null;

  return { professionals, hasNextPage, nextCursor };
}

export function useProfessionals(params: ProfessionalsQueryParams = {}) {
  const { searchText, disponivel, estado, tipoTrabalho, habilidades, cursor } = params;

  return useQuery({
    queryKey: ["professionals", { searchText, disponivel, estado, tipoTrabalho, habilidades, cursor }],
    queryFn: () => fetchProfessionals(params),
    staleTime: 30_000,
    retry: 2,
  });
}
