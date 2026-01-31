import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StudioMembership {
  estudio: {
    id: string;
    nome: string;
    slug: string;
    logo_url: string | null;
  };
  role: "super_admin" | "member";
  ativo: boolean;
}

export function useStudioMembership() {
  return useQuery({
    queryKey: ["studio-membership"],
    queryFn: async (): Promise<StudioMembership | null> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from("estudio_membros")
        .select(`
          role,
          ativo,
          estudios!estudio_id (
            id,
            nome,
            slug,
            logo_url
          )
        `)
        .eq("user_id", session.user.id)
        .eq("ativo", true)
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      return {
        estudio: data.estudios as StudioMembership["estudio"],
        role: data.role as StudioMembership["role"],
        ativo: data.ativo ?? true,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}
