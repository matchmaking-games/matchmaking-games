import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback } from "react";
import type { StudioFilters } from "@/types/studio";

export function useStudioFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: StudioFilters = useMemo(() => ({
    searchText: searchParams.get("q"),
    estado: searchParams.get("estado"),
    tamanho: searchParams.get("tamanho"),
    especialidades: searchParams.get("especialidades")?.split(",").filter(Boolean) || [],
  }), [searchParams]);

  const setFilter = useCallback((key: string, value: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setEspecialidades = useCallback((items: string[]) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (items.length === 0) {
        next.delete("especialidades");
      } else {
        next.set("especialidades", items.join(","));
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setEstado = useCallback((uf: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (uf === null || uf === "") {
        next.delete("estado");
      } else {
        next.set("estado", uf);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const clearAllFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchText) count++;
    if (filters.estado) count++;
    if (filters.tamanho) count++;
    count += filters.especialidades.length;
    return count;
  }, [filters]);

  return {
    filters,
    setFilter,
    setEspecialidades,
    setEstado,
    clearAllFilters,
    activeFilterCount,
    hasActiveFilters: activeFilterCount > 0,
  };
}
