import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Types from Supabase schema
export type Education = Database["public"]["Tables"]["educacao"]["Row"];
export type EducationInsert = Database["public"]["Tables"]["educacao"]["Insert"];
export type EducationUpdate = Database["public"]["Tables"]["educacao"]["Update"];

interface UseEducationsReturn {
  educations: Education[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addEducation: (data: Omit<EducationInsert, "user_id" | "ordem">) => Promise<Education>;
  updateEducation: (id: string, data: EducationUpdate) => Promise<Education>;
  deleteEducation: (id: string) => Promise<void>;
}

export function useEducations(): UseEducationsReturn {
  const [educations, setEducations] = useState<Education[]>([]);
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

  const fetchEducations = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("educacao")
        .select("*")
        .eq("user_id", userId)
        .order("concluido", { ascending: false }) // Completed first
        .order("fim", { ascending: false, nullsFirst: false })
        .order("inicio", { ascending: false });

      if (fetchError) throw fetchError;

      setEducations(data || []);
    } catch (err) {
      console.error("Error fetching educations:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar educação");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchEducations();
    }
  }, [userId, fetchEducations]);

  // Add new education
  const addEducation = useCallback(async (
    data: Omit<EducationInsert, "user_id" | "ordem">
  ): Promise<Education> => {
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Get max ordem for this user
    const { data: maxOrdemData } = await supabase
      .from("educacao")
      .select("ordem")
      .eq("user_id", userId)
      .order("ordem", { ascending: false })
      .limit(1)
      .single();

    const newOrdem = (maxOrdemData?.ordem ?? -1) + 1;

    const { data: newEducation, error: insertError } = await supabase
      .from("educacao")
      .insert({
        ...data,
        user_id: userId,
        ordem: newOrdem,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error adding education:", insertError);
      throw new Error("Erro ao adicionar educação");
    }

    return newEducation;
  }, [userId]);

  // Update existing education
  const updateEducation = useCallback(async (
    id: string,
    data: EducationUpdate
  ): Promise<Education> => {
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const { data: updatedEducation, error: updateError } = await supabase
      .from("educacao")
      .update(data)
      .eq("id", id)
      .eq("user_id", userId) // Ensure user owns this education
      .select()
      .single();

    if (updateError) {
      console.error("Error updating education:", updateError);
      throw new Error("Erro ao atualizar educação");
    }

    return updatedEducation;
  }, [userId]);

  // Delete education
  const deleteEducation = useCallback(async (id: string): Promise<void> => {
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const { error: deleteError } = await supabase
      .from("educacao")
      .delete()
      .eq("id", id)
      .eq("user_id", userId); // Ensure user owns this education

    if (deleteError) {
      console.error("Error deleting education:", deleteError);
      throw new Error("Erro ao remover educação");
    }
  }, [userId]);

  return {
    educations,
    loading,
    error,
    refetch: fetchEducations,
    addEducation,
    updateEducation,
    deleteEducation,
  };
}
