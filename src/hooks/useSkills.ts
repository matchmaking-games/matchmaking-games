import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type NivelHabilidade = Database["public"]["Enums"]["nivel_habilidade"];

type CategoriaHabilidade = Database["public"]["Enums"]["categoria_habilidade"];

export interface UserSkill {
  id: string;
  nivel: NivelHabilidade;
  ordem: number | null;
  habilidade: {
    id: string;
    nome: string;
    categoria: CategoriaHabilidade;
  };
}

interface UseSkillsReturn {
  skills: UserSkill[];
  loading: boolean;
  error: string | null;
  addSkill: (habilidadeId: string, nivel: NivelHabilidade) => Promise<void>;
  updateSkill: (id: string, nivel: NivelHabilidade) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useSkills(): UseSkillsReturn {
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getUser();
  }, []);

  const fetchSkills = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("user_habilidades")
        .select("id, nivel, ordem, habilidade:habilidades(id, nome, categoria)")
        .eq("user_id", userId)
        .order("ordem", { ascending: true });

      if (fetchError) throw fetchError;

      // Transform data to match UserSkill interface
      const transformedData: UserSkill[] = (data || []).map((item) => ({
        id: item.id,
        nivel: item.nivel,
        ordem: item.ordem,
        habilidade: item.habilidade as UserSkill["habilidade"],
      }));

      setSkills(transformedData);
    } catch (err) {
      console.error("Error fetching skills:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar habilidades");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchSkills();
    }
  }, [userId, fetchSkills]);

  const addSkill = async (habilidadeId: string, nivel: NivelHabilidade) => {
    if (!userId) throw new Error("Usuário não autenticado");

    // Get max ordem
    const { data: maxData } = await supabase
      .from("user_habilidades")
      .select("ordem")
      .eq("user_id", userId)
      .order("ordem", { ascending: false })
      .limit(1);

    const nextOrdem = (maxData?.[0]?.ordem ?? -1) + 1;

    const { error: insertError } = await supabase.from("user_habilidades").insert({
      user_id: userId,
      habilidade_id: habilidadeId,
      nivel: nivel,
      ordem: nextOrdem,
      anos_experiencia: null,
    });

    if (insertError) throw insertError;

    await fetchSkills();
  };

  const updateSkill = async (id: string, nivel: NivelHabilidade) => {
    const { error: updateError } = await supabase
      .from("user_habilidades")
      .update({ nivel })
      .eq("id", id);

    if (updateError) throw updateError;

    await fetchSkills();
  };

  const deleteSkill = async (id: string) => {
    const { error: deleteError } = await supabase
      .from("user_habilidades")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    await fetchSkills();
  };

  return {
    skills,
    loading,
    error,
    addSkill,
    updateSkill,
    deleteSkill,
    refetch: fetchSkills,
  };
}
