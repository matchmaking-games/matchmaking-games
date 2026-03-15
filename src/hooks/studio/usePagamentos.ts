import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Pagamento {
  id: string;
  amount: number;
  currency: string | null;
  status: string | null;
  criado_em: string | null;
  stripe_session_id: string;
  invoice_url: string | null;
  invoice_pdf_url: string | null;
  vaga: { titulo: string } | null;
}

export function usePagamentos(estudioId: string | null) {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPagamentos = useCallback(async () => {
    if (!estudioId) {
      setPagamentos([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("pagamentos")
        .select("*, vaga:vagas!vaga_id(titulo)")
        .eq("estudio_id", estudioId)
        .order("criado_em", { ascending: false });

      if (fetchError) throw fetchError;

      setPagamentos(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar pagamentos:", err);
      setError(err.message || "Erro ao carregar faturas.");
    } finally {
      setIsLoading(false);
    }
  }, [estudioId]);

  useEffect(() => {
    fetchPagamentos();
  }, [fetchPagamentos]);

  return { pagamentos, isLoading, error, refetch: fetchPagamentos };
}
