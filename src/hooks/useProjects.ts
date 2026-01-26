import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { generateSlug } from "@/lib/formatters";

export type Project = Database["public"]["Tables"]["projetos"]["Row"];
export type ProjectInsert = Database["public"]["Tables"]["projetos"]["Insert"];
export type ProjectUpdate = Database["public"]["Tables"]["projetos"]["Update"];

// Type prepared for TASK-318 (skills linking)
export type ProjectWithSkills = Project & {
  projeto_habilidades?: Array<{
    id: string;
    habilidade_id: string;
    habilidade: {
      id: string;
      nome: string;
      categoria: string;
    };
  }>;
};

interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createProject: (
    data: Omit<ProjectInsert, "user_id" | "ordem">
  ) => Promise<Project>;
  updateProject: (id: string, data: ProjectUpdate) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  toggleDestaque: (id: string, currentValue: boolean) => Promise<void>;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    getUser();
  }, []);

  const fetchProjects = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("projetos")
        .select("*") // Basic fields only for now
        // TODO TASK-318: Add skills relationship
        // .select(`
        //   *,
        //   projeto_habilidades (
        //     id,
        //     habilidade_id,
        //     habilidade:habilidades (
        //       id,
        //       nome,
        //       categoria
        //     )
        //   )
        // `)
        .eq("user_id", userId)
        .order("destaque", { ascending: false })
        .order("ordem", { ascending: true })
        .order("criado_em", { ascending: false });

      if (fetchError) throw fetchError;
      setProjects(data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Erro ao carregar projetos.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchProjects();
    }
  }, [userId, fetchProjects]);

  const createProject = async (
    data: Omit<ProjectInsert, "user_id" | "ordem">
  ): Promise<Project> => {
    if (!userId) throw new Error("Usuário não autenticado");

    // Fetch max order to calculate new order
    const { data: maxOrdemData } = await supabase
      .from("projetos")
      .select("ordem")
      .eq("user_id", userId)
      .order("ordem", { ascending: false })
      .limit(1)
      .maybeSingle();

    const novaOrdem = (maxOrdemData?.ordem ?? -1) + 1;

    // Generate slug from title if not provided
    const slug = data.slug || generateSlug(data.titulo);

    const { data: newProject, error: insertError } = await supabase
      .from("projetos")
      .insert({
        ...data,
        slug,
        user_id: userId,
        ordem: novaOrdem,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating project:", insertError);
      throw new Error("Erro ao criar projeto. Tente novamente.");
    }

    await fetchProjects();
    return newProject;
  };

  const updateProject = async (
    id: string,
    data: ProjectUpdate
  ): Promise<Project> => {
    if (!userId) throw new Error("Usuário não autenticado");

    const { data: updatedProject, error: updateError } = await supabase
      .from("projetos")
      .update(data)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating project:", updateError);
      throw new Error("Erro ao atualizar projeto. Tente novamente.");
    }

    await fetchProjects();
    return updatedProject;
  };

  const deleteProject = async (id: string): Promise<void> => {
    if (!userId) throw new Error("Usuário não autenticado");

    const { error: deleteError } = await supabase
      .from("projetos")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Error deleting project:", deleteError);
      throw new Error("Erro ao excluir projeto. Tente novamente.");
    }

    await fetchProjects();
  };

  const toggleDestaque = async (
    id: string,
    currentValue: boolean
  ): Promise<void> => {
    if (!userId) throw new Error("Usuário não autenticado");

    const { error: updateError } = await supabase
      .from("projetos")
      .update({ destaque: !currentValue })
      .eq("id", id)
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error toggling destaque:", updateError);
      throw new Error("Erro ao atualizar destaque. Tente novamente.");
    }

    await fetchProjects();
  };

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    toggleDestaque,
  };
}
