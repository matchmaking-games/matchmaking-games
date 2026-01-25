import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Types from Supabase schema
export type Experience = Database["public"]["Tables"]["experiencia"]["Row"];
export type ExperienceInsert = Database["public"]["Tables"]["experiencia"]["Insert"];
export type ExperienceUpdate = Database["public"]["Tables"]["experiencia"]["Update"];

interface UseExperiencesReturn {
  experiences: Experience[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addExperience: (data: Omit<ExperienceInsert, "user_id" | "ordem">) => Promise<Experience>;
  updateExperience: (id: string, data: ExperienceUpdate) => Promise<Experience>;
  deleteExperience: (id: string) => Promise<void>;
}

export function useExperiences(): UseExperiencesReturn {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const fetchExperiences = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("experiencia")
        .select("*")
        .eq("user_id", userId)
        .order("inicio", { ascending: false }); // Most recent first

      if (fetchError) throw fetchError;

      setExperiences(data || []);
    } catch (err) {
      console.error("Error fetching experiences:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar experiências");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchExperiences();
    }
  }, [userId, fetchExperiences]);

  // Add new experience
  const addExperience = useCallback(async (
    data: Omit<ExperienceInsert, "user_id" | "ordem">
  ): Promise<Experience> => {
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Get max ordem for this user
    const { data: maxOrdemData } = await supabase
      .from("experiencia")
      .select("ordem")
      .eq("user_id", userId)
      .order("ordem", { ascending: false })
      .limit(1)
      .single();

    const newOrdem = (maxOrdemData?.ordem ?? -1) + 1;

    const { data: newExperience, error: insertError } = await supabase
      .from("experiencia")
      .insert({
        ...data,
        user_id: userId,
        ordem: newOrdem,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error adding experience:", insertError);
      throw new Error("Erro ao adicionar experiência");
    }

    return newExperience;
  }, [userId]);

  // Update existing experience
  const updateExperience = useCallback(async (
    id: string,
    data: ExperienceUpdate
  ): Promise<Experience> => {
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const { data: updatedExperience, error: updateError } = await supabase
      .from("experiencia")
      .update(data)
      .eq("id", id)
      .eq("user_id", userId) // Ensure user owns this experience
      .select()
      .single();

    if (updateError) {
      console.error("Error updating experience:", updateError);
      throw new Error("Erro ao atualizar experiência");
    }

    return updatedExperience;
  }, [userId]);

  // Delete experience
  const deleteExperience = useCallback(async (id: string): Promise<void> => {
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const { error: deleteError } = await supabase
      .from("experiencia")
      .delete()
      .eq("id", id)
      .eq("user_id", userId); // Ensure user owns this experience

    if (deleteError) {
      console.error("Error deleting experience:", deleteError);
      throw new Error("Erro ao remover experiência");
    }
  }, [userId]);

  return {
    experiences,
    loading,
    error,
    refetch: fetchExperiences,
    addExperience,
    updateExperience,
    deleteExperience,
  };
}
