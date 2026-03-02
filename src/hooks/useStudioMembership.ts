import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StudioMembership {
  id: string;
  estudio: {
    id: string;
    nome: string;
    slug: string;
    logo_url: string | null;
  };
  role: "super_admin" | "member";
  ativo: boolean;
}

interface UseStudioMembershipReturn {
  studios: StudioMembership[];
  isLoading: boolean;
}

async function fetchMemberships(): Promise<StudioMembership[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from("estudio_membros")
    .select(`
      id,
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
    .order("adicionado_em", { ascending: false });

  if (error || !data || data.length === 0) return [];

  return data.map((item) => ({
    id: item.id,
    estudio: item.estudios as StudioMembership["estudio"],
    role: item.role as StudioMembership["role"],
    ativo: item.ativo ?? true,
  }));
}

export function useStudioMembership(): UseStudioMembershipReturn {
  const { data, isLoading } = useQuery({
    queryKey: ["studio-memberships"],
    queryFn: fetchMemberships,
    staleTime: 300000,
  });

  return {
    studios: data ?? [],
    isLoading,
  };
}
