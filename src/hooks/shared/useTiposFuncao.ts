import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TipoFuncao {
  id: string;
  nome: string;
}

interface UseTiposFuncaoReturn {
  tiposFuncao: TipoFuncao[];
  loading: boolean;
  error: string | null;
}

export function useTiposFuncao(): UseTiposFuncaoReturn {
  const [tiposFuncao, setTiposFuncao] = useState<TipoFuncao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTiposFuncao = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("tipos_funcao")
          .select("id, nome")
          .eq("ativo", true)
          .order("ordem");

        if (fetchError) {
          console.error("Error fetching tipos_funcao:", fetchError);
          setError("Erro ao carregar tipos de função.");
          return;
        }

        setTiposFuncao(data || []);
      } catch (err) {
        console.error("Error fetching tipos_funcao:", err);
        setError("Erro ao carregar tipos de função.");
      } finally {
        setLoading(false);
      }
    };

    fetchTiposFuncao();
  }, []);

  return { tiposFuncao, loading, error };
}
