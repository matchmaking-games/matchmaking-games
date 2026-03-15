import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback } from "react";
import type { ProfessionalFilters } from "@/types/professional";

export function useProfessionalFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: ProfessionalFilters = useMemo(() => ({
    searchText: searchParams.get("q"),
    disponivel: searchParams.get("disponivel") === "true" ? true : null,
    estado: searchParams.get("estado"),
    tipoTrabalho: searchParams.get("trabalho")?.split(",").filter(Boolean) || null,
    habilidades: searchParams.get("skills")?.split(",").filter(Boolean) || null,
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

  const setHabilidades = useCallback((ids: string[]) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (ids.length === 0) {
        next.delete("skills");
      } else {
        next.set("skills", ids.join(","));
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
    if (filters.disponivel !== null) count++;
    if (filters.estado) count++;
    if (filters.tipoTrabalho && filters.tipoTrabalho.length > 0) count++;
    if (filters.habilidades && filters.habilidades.length > 0) count++;
    return count;
  }, [filters]);

  return {
    filters,
    setFilter,
    setHabilidades,
    setEstado,
    clearAllFilters,
    activeFilterCount,
    hasActiveFilters: activeFilterCount > 0,
  };
}
