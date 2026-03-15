import { useState, useEffect, useCallback } from "react";

// IBGE API types
export interface EstadoIBGE {
  id: number;
  sigla: string;
  nome: string;
}

export interface MunicipioIBGE {
  id: number;
  nome: string;
}

interface UseIBGELocationsReturn {
  estados: EstadoIBGE[];
  loadingEstados: boolean;
  municipios: MunicipioIBGE[];
  loadingMunicipios: boolean;
  fetchMunicipios: (uf: string) => Promise<void>;
  clearMunicipios: () => void;
  error: string | null;
}

const IBGE_API_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";

export function useIBGELocations(): UseIBGELocationsReturn {
  const [estados, setEstados] = useState<EstadoIBGE[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(true);
  const [municipios, setMunicipios] = useState<MunicipioIBGE[]>([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch states on mount (cached)
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        setLoadingEstados(true);
        setError(null);

        const response = await fetch(`${IBGE_API_BASE}/estados?orderBy=nome`);
        
        if (!response.ok) {
          throw new Error("Erro ao carregar estados");
        }

        const data: EstadoIBGE[] = await response.json();
        
        // Sort by sigla (AC, AL, AM...)
        const sorted = data.sort((a, b) => a.sigla.localeCompare(b.sigla));
        setEstados(sorted);
      } catch (err) {
        console.error("Error fetching estados:", err);
        setError("Não foi possível carregar os estados. Tente novamente.");
      } finally {
        setLoadingEstados(false);
      }
    };

    fetchEstados();
  }, []);

  // Fetch municipalities by state
  const fetchMunicipios = useCallback(async (uf: string) => {
    if (!uf) {
      setMunicipios([]);
      return;
    }

    try {
      setLoadingMunicipios(true);
      setError(null);

      const response = await fetch(
        `${IBGE_API_BASE}/estados/${uf}/municipios?orderBy=nome`
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar municípios");
      }

      const data: MunicipioIBGE[] = await response.json();
      
      // Sort by name alphabetically
      const sorted = data.sort((a, b) => a.nome.localeCompare(b.nome));
      setMunicipios(sorted);
    } catch (err) {
      console.error("Error fetching municipios:", err);
      setError("Não foi possível carregar as cidades. Tente novamente.");
      setMunicipios([]);
    } finally {
      setLoadingMunicipios(false);
    }
  }, []);

  const clearMunicipios = useCallback(() => {
    setMunicipios([]);
  }, []);

  return {
    estados,
    loadingEstados,
    municipios,
    loadingMunicipios,
    fetchMunicipios,
    clearMunicipios,
    error,
  };
}
