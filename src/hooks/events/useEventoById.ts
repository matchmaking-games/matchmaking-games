import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Evento } from "@/hooks/events/useEventos";

export function useEventoById(id: string | undefined) {
  return useQuery({
    queryKey: ["eventos", "detail", id],
    enabled: !!id,
    queryFn: async (): Promise<Evento> => {
      const { data, error } = await supabase
        .from("eventos")
        .select("*")
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data as Evento;
    },
    staleTime: 1000 * 60 * 2,
  });
}
