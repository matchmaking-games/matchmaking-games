import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CreateEventoData {
  nome: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  modalidade: string;
  estado?: string;
  cidade?: string;
  endereco?: string;
  link_externo?: string;
}

export function useCreateEvento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEventoData) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("Usuário não autenticado");
      }

      const { data: evento, error } = await supabase
        .from("eventos")
        .insert({
          criado_por: userData.user.id,
          nome: data.nome,
          descricao: data.descricao || null,
          data_inicio: data.data_inicio,
          data_fim: data.data_fim,
          modalidade: data.modalidade,
          estado: data.estado || null,
          cidade: data.cidade || null,
          endereco: data.endereco || null,
          link_externo: data.link_externo || null,
        })
        .select()
        .single();

      if (error) throw error;
      return evento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventos", "meus"] });
      queryClient.invalidateQueries({ queryKey: ["eventos", "publicos"] });
    },
  });
}
