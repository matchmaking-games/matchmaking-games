import { useState, useEffect } from "react";
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

export function useStudioMembership(): UseStudioMembershipReturn {
  const [studios, setStudios] = useState<StudioMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setStudios([]);
          setIsLoading(false);
          return;
        }

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

        if (error || !data || data.length === 0) {
          setStudios([]);
          setIsLoading(false);
          return;
        }

        const memberships: StudioMembership[] = data.map((item) => ({
          id: item.id,
          estudio: item.estudios as StudioMembership["estudio"],
          role: item.role as StudioMembership["role"],
          ativo: item.ativo ?? true,
        }));

        setStudios(memberships);
      } catch {
        setStudios([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberships();
  }, []);

  return { studios, isLoading };
}
