import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const IMPORT_LIMIT = 3;

export function useImportLimit() {
  const [userId, setUserId] = useState<string | null>(null);
  const [remainingImports, setRemainingImports] = useState(IMPORT_LIMIT);
  const [isLoading, setIsLoading] = useState(true);

  // Passo 1: obtém o usuário da sessão
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id ?? null);
      if (!session) setIsLoading(false); // sem usuário, não há nada a carregar
    };
    getUser();
  }, []);

  // Passo 2: consulta o limite quando userId estiver disponível
  useEffect(() => {
    if (!userId) return;

    const fetchImportCount = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc("count_recent_imports", {
          p_user_id: userId,
        });

        if (error) throw error;

        const count = typeof data === "number" ? data : 0;
        setRemainingImports(Math.max(0, IMPORT_LIMIT - count));
      } catch (err) {
        console.error("useImportLimit: erro ao buscar contagem de importações:", err);
        // Falha silenciosa — não bloqueia o usuário
        setRemainingImports(IMPORT_LIMIT);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImportCount();
  }, [userId]);

  return {
    remainingImports,
    canImport: remainingImports > 0,
    isLoading,
  };
}
