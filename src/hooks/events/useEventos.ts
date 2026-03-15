import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/dashboard/useCurrentUser";

export interface Evento {
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

export function useEventos() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: ["eventos", "meus"],
    enabled: !!user?.id,
    queryFn: async (): Promise<Evento[]> => {
      const { data, error } = await supabase
        .from("eventos")
        .select("*")
        .eq("criado_por", user!.id)
        .order("data_inicio", { ascending: true });

      if (error) throw error;
      return data as Evento[];
    },
    staleTime: 1000 * 60 * 2,
  });
}
