import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CurrentUser {
  id: string;
  nome_completo: string;
  avatar_url: string | null;
  slug: string;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async (): Promise<CurrentUser | null> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from("users")
        .select("nome_completo, avatar_url, slug")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching current user:", error);
        return null;
      }

      return {
        id: session.user.id,
        nome_completo: data.nome_completo,
        avatar_url: data.avatar_url,
        slug: data.slug,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}
