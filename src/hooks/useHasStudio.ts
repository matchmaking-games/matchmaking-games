import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useHasStudio() {
  return useQuery({
    queryKey: ["has-studio"],
    queryFn: async (): Promise<boolean> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const { data, error } = await supabase
        .from("estudios")
        .select("id")
        .eq("criado_por", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking studio:", error);
        return false;
      }

      return !!data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
