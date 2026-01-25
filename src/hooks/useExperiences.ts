import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Type from Supabase schema
export type Experience = Database["public"]["Tables"]["experiencia"]["Row"];

interface UseExperiencesReturn {
  experiences: Experience[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
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

  return {
    experiences,
    loading,
    error,
    refetch: fetchExperiences,
  };
}
