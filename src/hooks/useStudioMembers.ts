import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["user_role"];

export interface StudioMember {
  id: string;
  role: UserRole;
  adicionado_em: string | null;
  user_id: string;
  user: {
    id: string;
    nome_completo: string;
    email: string;
    avatar_url: string | null;
    slug: string | null;
  };
}

interface UseStudioMembersReturn {
  members: StudioMember[];
  isLoading: boolean;
  error: string | null;
  currentUserId: string | null;
  superAdminCount: number;
  refetch: () => Promise<void>;
  updateMemberRole: (memberId: string, newRole: UserRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
}

export function useStudioMembers(estudioId: string | null): UseStudioMembersReturn {
  const [members, setMembers] = useState<StudioMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!estudioId) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }

      const { data, error: fetchError } = await supabase
        .from("estudio_membros")
        .select(`
          id, role, adicionado_em, user_id,
          user:users!user_id (
            id, nome_completo, email, avatar_url, slug
          )
        `)
        .eq("estudio_id", estudioId)
        .eq("ativo", true)
        .order("adicionado_em", { ascending: false });

      if (fetchError) throw fetchError;

      setMembers((data as unknown as StudioMember[]) || []);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar membros");
    } finally {
      setIsLoading(false);
    }
  }, [estudioId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const superAdminCount = useMemo(
    () => members.filter((m) => m.role === "super_admin").length,
    [members]
  );

  const updateMemberRole = useCallback(
    async (memberId: string, newRole: UserRole) => {
      const member = members.find((m) => m.id === memberId);
      if (!member) throw new Error("Membro não encontrado.");

      if (
        member.role === "super_admin" &&
        newRole !== "super_admin" &&
        superAdminCount <= 1
      ) {
        throw new Error("O estúdio precisa ter pelo menos um Super Admin.");
      }

      const { error } = await supabase
        .from("estudio_membros")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;

      await fetchMembers();
    },
    [members, superAdminCount, fetchMembers]
  );

  const removeMember = useCallback(
    async (memberId: string) => {
      const member = members.find((m) => m.id === memberId);
      if (!member) throw new Error("Membro não encontrado.");

      if (member.role === "super_admin" && superAdminCount <= 1) {
        throw new Error("O estúdio precisa ter pelo menos um Super Admin.");
      }

      const { error } = await supabase
        .from("estudio_membros")
        .update({ ativo: false })
        .eq("id", memberId);

      if (error) throw error;

      await fetchMembers();
    },
    [members, superAdminCount, fetchMembers]
  );

  return {
    members,
    isLoading,
    error,
    currentUserId,
    superAdminCount,
    refetch: fetchMembers,
    updateMemberRole,
    removeMember,
  };
}
