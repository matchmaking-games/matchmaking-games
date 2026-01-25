import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Habilidade {
  id: string;
  nome: string;
  categoria: "engine" | "linguagem" | "ferramenta" | "soft_skill";
}

interface UseAvailableSkillsReturn {
  availableSkills: Habilidade[];
  loading: boolean;
  error: string | null;
}

export function useAvailableSkills(): UseAvailableSkillsReturn {
  const [availableSkills, setAvailableSkills] = useState<Habilidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("habilidades")
          .select("id, nome, categoria")
          .order("categoria")
          .order("nome");

        if (fetchError) throw fetchError;

        setAvailableSkills(data || []);
      } catch (err) {
        console.error("Error fetching available skills:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar habilidades");
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  return { availableSkills, loading, error };
}
