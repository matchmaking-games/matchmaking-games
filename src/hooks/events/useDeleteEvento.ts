import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDeleteEvento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("eventos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventos", "meus"] });
      queryClient.invalidateQueries({ queryKey: ["eventos", "publicos"] });
      toast.success("Evento excluído com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir evento. Tente novamente.");
    },
  });
}
