import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpdateEventoData {
  id: string;
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

export function useUpdateEvento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateEventoData) => {
      const { error } = await supabase
        .from("eventos")
        .update({
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
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventos", "meus"] });
      queryClient.invalidateQueries({ queryKey: ["eventos", "publicos"] });
      queryClient.invalidateQueries({ queryKey: ["eventos", "detail"] });
      toast.success("Evento atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar evento. Tente novamente.");
    },
  });
}
