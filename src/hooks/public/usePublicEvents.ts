import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicEvento {
  id: string;
  criado_por: string;
  nome: string;
  descricao: string | null;
  data_inicio: string;
  data_fim: string;
  modalidade: string;
  estado: string | null;
  cidade: string | null;
  endereco: string | null;
  link_externo: string | null;
  created_at: string;
}

export interface PublicEventFilters {
  modalidade?: string;
  estado?: string;
  mostrarEncerrados?: boolean;
}

export function usePublicEvents(filtros: PublicEventFilters = {}) {
  return useQuery({
    queryKey: ["eventos", "public", filtros],
    queryFn: async (): Promise<PublicEvento[]> => {
      let query = supabase
        .from("eventos")
        .select("*")
        .order("data_inicio", { ascending: true });

      if (!filtros.mostrarEncerrados) {
        query = query.gte("data_fim", new Date().toISOString());
      }

      if (filtros.modalidade && filtros.modalidade !== "todos") {
        query = query.eq("modalidade", filtros.modalidade);
      }

      if (filtros.estado) {
        query = query.eq("estado", filtros.estado);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PublicEvento[];
    },
    staleTime: 1000 * 60 * 2,
  });
}
