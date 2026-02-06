import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback } from "react";

export interface JobFilters {
  nivel: string | null;
  tipoContrato: string | null;
  modeloTrabalho: string | null;
  estado: string | null;
  cidade: string | null;
  habilidades: string[];
  searchText: string | null;
}

export function useJobFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: JobFilters = useMemo(() => ({
    nivel: searchParams.get("nivel"),
    tipoContrato: searchParams.get("contrato"),
    modeloTrabalho: searchParams.get("modelo"),
    estado: searchParams.get("estado"),
    cidade: searchParams.get("cidade"),
    habilidades: searchParams.get("skills")?.split(",").filter(Boolean) || [],
    searchText: searchParams.get("q"),
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
        next.delete("cidade"); // Clear cidade when estado is cleared
      } else {
        next.set("estado", uf);
        next.delete("cidade"); // Clear cidade when estado changes
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setCidade = useCallback((nome: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nome === null || nome === "") {
        next.delete("cidade");
      } else {
        next.set("cidade", nome);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const clearAllFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.nivel) count++;
    if (filters.tipoContrato) count++;
    if (filters.modeloTrabalho) count++;
    if (filters.estado) count++;
    if (filters.cidade) count++;
    if (filters.habilidades.length > 0) count++;
    if (filters.searchText) count++;
    return count;
  }, [filters]);

  return {
    filters,
    setFilter,
    setHabilidades,
    setEstado,
    setCidade,
    clearAllFilters,
    activeFilterCount,
    hasActiveFilters: activeFilterCount > 0,
  };
}
