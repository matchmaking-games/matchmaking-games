import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback } from "react";
import type { ProjectFilters } from "@/types/project-search";

export function useProjectFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: ProjectFilters = useMemo(() => ({
    searchText: searchParams.get("q"),
    engine: searchParams.get("engine"),
    plataformas: searchParams.get("plataformas")?.split(",").filter(Boolean) || [],
    genero: searchParams.get("genero")?.split(",").filter(Boolean) || [],
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

  const setPlataformas = useCallback((items: string[]) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (items.length === 0) {
        next.delete("plataformas");
      } else {
        next.set("plataformas", items.join(","));
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setGenero = useCallback((items: string[]) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (items.length === 0) {
        next.delete("genero");
      } else {
        next.set("genero", items.join(","));
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
    if (filters.engine) count++;
    count += filters.plataformas.length;
    count += filters.genero.length;
    return count;
  }, [filters]);

  return {
    filters,
    setFilter,
    setPlataformas,
    setGenero,
    clearAllFilters,
    activeFilterCount,
    hasActiveFilters: activeFilterCount > 0,
  };
}
