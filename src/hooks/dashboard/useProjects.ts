import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { generateSlug } from "@/lib/formatters";

export type Project = Database["public"]["Tables"]["projetos"]["Row"];
export type ProjectInsert = Database["public"]["Tables"]["projetos"]["Insert"];
export type ProjectUpdate = Database["public"]["Tables"]["projetos"]["Update"];

// Type with skills relationship (TASK-318)
export type ProjectWithSkills = Project & {
  projeto_habilidades?: Array<{
    id: string;
    habilidade_id: string;
    habilidade: {
      id: string;
      nome: string;
      categoria: Database["public"]["Enums"]["categoria_habilidade"];
    };
  }>;
};

interface UseProjectsReturn {
  projects: ProjectWithSkills[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createProject: (
    data: Omit<ProjectInsert, "user_id" | "ordem"> & { id?: string }
  ) => Promise<Project>;
  updateProject: (id: string, data: ProjectUpdate) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  toggleDestaque: (id: string, currentValue: boolean) => Promise<void>;
  saveProjectSkills: (projectId: string, skillIds: string[]) => Promise<void>;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<ProjectWithSkills[]>([]);
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
        .select(`
          *,
          projeto_habilidades (
            id,
            habilidade_id,
            habilidade:habilidades (
              id,
              nome,
              categoria
            )
          )
        `)
        .eq("user_id", userId)
        .order("destaque", { ascending: false })
        .order("ordem", { ascending: true })
        .order("criado_em", { ascending: false });

      if (fetchError) throw fetchError;
      setProjects((data as ProjectWithSkills[]) || []);
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
    data: Omit<ProjectInsert, "user_id" | "ordem"> & { id?: string }
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

    // Extract id if provided (from temp UUID for image upload)
    const { id: providedId, ...restData } = data;

    const insertData = {
      ...restData,
      slug,
      user_id: userId,
      ordem: novaOrdem,
      ...(providedId ? { id: providedId } : {}),
    };

    const { data: newProject, error: insertError } = await supabase
      .from("projetos")
      .insert(insertData)
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

    // 1. Delete skill relationships first
    await supabase
      .from("projeto_habilidades")
      .delete()
      .eq("projeto_id", id);

    // 2. Delete all images in project folder
    const { data: files } = await supabase.storage
      .from("project-images")
      .list(`${userId}/${id}`);

    if (files && files.length > 0) {
      const filePaths = files.map((f) => `${userId}/${id}/${f.name}`);
      await supabase.storage.from("project-images").remove(filePaths);
    }

    // 3. Delete project
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

  const saveProjectSkills = async (
    projectId: string,
    skillIds: string[]
  ): Promise<void> => {
    if (!userId) throw new Error("Usuário não autenticado");

    // 1. Delete old relationships
    await supabase
      .from("projeto_habilidades")
      .delete()
      .eq("projeto_id", projectId);

    // 2. Insert new relationships
    if (skillIds.length > 0) {
      const relacionamentos = skillIds.map((habilidadeId) => ({
        projeto_id: projectId,
        habilidade_id: habilidadeId,
      }));

      const { error } = await supabase
        .from("projeto_habilidades")
        .insert(relacionamentos);

      if (error) {
        console.error("Error saving project skills:", error);
        throw new Error("Erro ao salvar habilidades do projeto.");
      }
    }
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
    saveProjectSkills,
  };
}
