import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Base types from Supabase schema
type ExperienciaRow = Database["public"]["Tables"]["experiencia"]["Row"];
type CargoExperienciaRow = Database["public"]["Tables"]["cargos_experiencia"]["Row"];

// Type for individual cargo (position)
export interface Cargo {
  id: string;
  titulo_cargo: string;
  tipo_emprego: Database["public"]["Enums"]["tipo_emprego"];
  inicio: string;
  fim: string | null;
  atualmente_trabalhando: boolean | null;
  descricao: string | null;
  habilidades_usadas: string[] | null;
  ordem: number | null;
}

// Combined type for UI - merges experiencia + cargos_experiencia
export interface Experience extends ExperienciaRow {
  // Cargo primário (mais recente) - para compatibilidade
  cargo_id: string | null;
  titulo_cargo: string;
  tipo_emprego: Database["public"]["Enums"]["tipo_emprego"];
  inicio: string;
  fim: string | null;
  atualmente_trabalhando: boolean | null;
  descricao: string | null;
  habilidades_usadas: string[] | null;
  // NOVO: Todos os cargos da experiência
  cargos: Cargo[];
}

// Insert type for creating new experience with cargo
export interface ExperienceInsertData {
  empresa: string;
  localizacao?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cidade_ibge_id?: number | null;
  remoto?: boolean;
  estudio_id?: string | null;
  // Cargo fields
  titulo_cargo: string;
  tipo_emprego: Database["public"]["Enums"]["tipo_emprego"];
  inicio: string;
  fim?: string | null;
  atualmente_trabalhando?: boolean;
  descricao?: string | null;
}

// Update type
export interface ExperienceUpdateData {
  empresa?: string;
  localizacao?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cidade_ibge_id?: number | null;
  remoto?: boolean;
  estudio_id?: string | null;
  // Cargo fields
  titulo_cargo?: string;
  tipo_emprego?: Database["public"]["Enums"]["tipo_emprego"];
  inicio?: string;
  fim?: string | null;
  atualmente_trabalhando?: boolean;
  descricao?: string | null;
}

// Insert type for adding cargo to existing experience
export interface CargoInsertData {
  experiencia_id: string;
  titulo_cargo: string;
  tipo_emprego: Database["public"]["Enums"]["tipo_emprego"];
  inicio: string;
  fim?: string | null;
  atualmente_trabalhando?: boolean;
  descricao?: string | null;
}

// Helper function to check if dates overlap
function datesOverlap(
  start1: string,
  end1: string | null,
  start2: string,
  end2: string | null | undefined
): boolean {
  const s1 = new Date(start1);
  const e1 = end1 ? new Date(end1) : new Date();
  const s2 = new Date(start2);
  const e2 = end2 ? new Date(end2) : new Date();

  return s1 <= e2 && s2 <= e1;
}

interface UseExperiencesReturn {
  experiences: Experience[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addExperience: (data: ExperienceInsertData) => Promise<Experience>;
  updateExperience: (id: string, data: ExperienceUpdateData) => Promise<Experience>;
  deleteExperience: (id: string) => Promise<void>;
  addCargo: (data: CargoInsertData) => Promise<Cargo>;
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

      // Fetch experiencia with cargos_experiencia join
      const { data, error: fetchError } = await supabase
        .from("experiencia")
        .select(`
          *,
          cargos_experiencia (
            id, titulo_cargo, tipo_emprego, inicio, fim, 
            atualmente_trabalhando, descricao, habilidades_usadas, ordem
          )
        `)
        .eq("user_id", userId)
        .order("ordem", { ascending: true });

      if (fetchError) throw fetchError;

      // Transform data to flatten the structure
      const transformedData: Experience[] = (data || []).map((exp) => {
        const rawCargos = exp.cargos_experiencia || [];
        // Sort by inicio descending to get the most recent cargo first
        const sortedCargos: Cargo[] = rawCargos
          .map((c) => ({
            id: c.id,
            titulo_cargo: c.titulo_cargo,
            tipo_emprego: c.tipo_emprego,
            inicio: c.inicio,
            fim: c.fim,
            atualmente_trabalhando: c.atualmente_trabalhando,
            descricao: c.descricao,
            habilidades_usadas: c.habilidades_usadas,
            ordem: c.ordem,
          }))
          .sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime());
        
        const primaryCargo = sortedCargos[0];

        return {
          ...exp,
          cargo_id: primaryCargo?.id || null,
          titulo_cargo: primaryCargo?.titulo_cargo || "",
          tipo_emprego: primaryCargo?.tipo_emprego || "clt",
          inicio: primaryCargo?.inicio || "",
          fim: primaryCargo?.fim || null,
          atualmente_trabalhando: primaryCargo?.atualmente_trabalhando || false,
          descricao: primaryCargo?.descricao || null,
          habilidades_usadas: primaryCargo?.habilidades_usadas || null,
          cargos: sortedCargos,
        };
      });

      // Sort by most recent inicio first
      transformedData.sort((a, b) =>
        new Date(b.inicio).getTime() - new Date(a.inicio).getTime()
      );

      setExperiences(transformedData);
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

  // Add new experience with cargo
  const addExperience = useCallback(async (
    data: ExperienceInsertData
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
      .maybeSingle();

    const newOrdem = (maxOrdemData?.ordem ?? -1) + 1;

    // 1. Create experiencia (company-level)
    const { data: newExperiencia, error: insertExpError } = await supabase
      .from("experiencia")
      .insert({
        user_id: userId,
        empresa: data.empresa,
        localizacao: data.localizacao,
        cidade: data.cidade,
        estado: data.estado,
        cidade_ibge_id: data.cidade_ibge_id,
        remoto: data.remoto,
        estudio_id: data.estudio_id,
        ordem: newOrdem,
      })
      .select()
      .single();

    if (insertExpError || !newExperiencia) {
      console.error("Error adding experiencia:", insertExpError);
      throw new Error("Erro ao adicionar experiência");
    }

    // 2. Create cargos_experiencia (position-level)
    const { data: newCargo, error: insertCargoError } = await supabase
      .from("cargos_experiencia")
      .insert({
        experiencia_id: newExperiencia.id,
        titulo_cargo: data.titulo_cargo,
        tipo_emprego: data.tipo_emprego,
        inicio: data.inicio,
        fim: data.fim,
        atualmente_trabalhando: data.atualmente_trabalhando,
        descricao: data.descricao,
        ordem: 0,
      })
      .select()
      .single();

    if (insertCargoError) {
      console.error("Error adding cargo:", insertCargoError);
      // Rollback: delete the experiencia we just created
      await supabase.from("experiencia").delete().eq("id", newExperiencia.id);
      throw new Error("Erro ao adicionar cargo da experiência");
    }

    // Return combined object
    return {
      ...newExperiencia,
      cargo_id: newCargo.id,
      titulo_cargo: newCargo.titulo_cargo,
      tipo_emprego: newCargo.tipo_emprego,
      inicio: newCargo.inicio,
      fim: newCargo.fim,
      atualmente_trabalhando: newCargo.atualmente_trabalhando,
      descricao: newCargo.descricao,
      habilidades_usadas: newCargo.habilidades_usadas,
      cargos: [{
        id: newCargo.id,
        titulo_cargo: newCargo.titulo_cargo,
        tipo_emprego: newCargo.tipo_emprego,
        inicio: newCargo.inicio,
        fim: newCargo.fim,
        atualmente_trabalhando: newCargo.atualmente_trabalhando,
        descricao: newCargo.descricao,
        habilidades_usadas: newCargo.habilidades_usadas,
        ordem: newCargo.ordem,
      }],
    };
  }, [userId]);

  // Update existing experience
  const updateExperience = useCallback(async (
    id: string,
    data: ExperienceUpdateData
  ): Promise<Experience> => {
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Get the experience to find the cargo_id
    const existingExp = experiences.find(e => e.id === id);
    if (!existingExp) {
      throw new Error("Experiência não encontrada");
    }

    // 1. Update experiencia (company-level fields)
    const expUpdateData: Partial<ExperienciaRow> = {};
    if (data.empresa !== undefined) expUpdateData.empresa = data.empresa;
    if (data.localizacao !== undefined) expUpdateData.localizacao = data.localizacao;
    if (data.cidade !== undefined) expUpdateData.cidade = data.cidade;
    if (data.estado !== undefined) expUpdateData.estado = data.estado;
    if (data.cidade_ibge_id !== undefined) expUpdateData.cidade_ibge_id = data.cidade_ibge_id;
    if (data.remoto !== undefined) expUpdateData.remoto = data.remoto;
    if (data.estudio_id !== undefined) expUpdateData.estudio_id = data.estudio_id;

    if (Object.keys(expUpdateData).length > 0) {
      const { error: updateExpError } = await supabase
        .from("experiencia")
        .update(expUpdateData)
        .eq("id", id)
        .eq("user_id", userId);

      if (updateExpError) {
        console.error("Error updating experiencia:", updateExpError);
        throw new Error("Erro ao atualizar experiência");
      }
    }

    // 2. Update cargo (position-level fields)
    if (existingExp.cargo_id) {
      const cargoUpdateData: Partial<CargoExperienciaRow> = {};
      if (data.titulo_cargo !== undefined) cargoUpdateData.titulo_cargo = data.titulo_cargo;
      if (data.tipo_emprego !== undefined) cargoUpdateData.tipo_emprego = data.tipo_emprego;
      if (data.inicio !== undefined) cargoUpdateData.inicio = data.inicio;
      if (data.fim !== undefined) cargoUpdateData.fim = data.fim;
      if (data.atualmente_trabalhando !== undefined) cargoUpdateData.atualmente_trabalhando = data.atualmente_trabalhando;
      if (data.descricao !== undefined) cargoUpdateData.descricao = data.descricao;

      if (Object.keys(cargoUpdateData).length > 0) {
        const { error: updateCargoError } = await supabase
          .from("cargos_experiencia")
          .update(cargoUpdateData)
          .eq("id", existingExp.cargo_id);

        if (updateCargoError) {
          console.error("Error updating cargo:", updateCargoError);
          throw new Error("Erro ao atualizar cargo da experiência");
        }
      }
    }

    // Fetch updated data
    const { data: updatedExp, error: fetchError } = await supabase
      .from("experiencia")
      .select(`
        *,
        cargos_experiencia (
          id, titulo_cargo, tipo_emprego, inicio, fim, 
          atualmente_trabalhando, descricao, habilidades_usadas, ordem
        )
      `)
      .eq("id", id)
      .single();

    if (fetchError || !updatedExp) {
      throw new Error("Erro ao buscar experiência atualizada");
    }

    const rawCargos = updatedExp.cargos_experiencia || [];
    const sortedCargos: Cargo[] = rawCargos
      .map((c) => ({
        id: c.id,
        titulo_cargo: c.titulo_cargo,
        tipo_emprego: c.tipo_emprego,
        inicio: c.inicio,
        fim: c.fim,
        atualmente_trabalhando: c.atualmente_trabalhando,
        descricao: c.descricao,
        habilidades_usadas: c.habilidades_usadas,
        ordem: c.ordem,
      }))
      .sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime());
    
    const primaryCargo = sortedCargos[0];

    return {
      ...updatedExp,
      cargo_id: primaryCargo?.id || null,
      titulo_cargo: primaryCargo?.titulo_cargo || "",
      tipo_emprego: primaryCargo?.tipo_emprego || "clt",
      inicio: primaryCargo?.inicio || "",
      fim: primaryCargo?.fim || null,
      atualmente_trabalhando: primaryCargo?.atualmente_trabalhando || false,
      descricao: primaryCargo?.descricao || null,
      habilidades_usadas: primaryCargo?.habilidades_usadas || null,
      cargos: sortedCargos,
    };
  }, [userId, experiences]);

  // Delete experience (cascade will handle cargos)
  const deleteExperience = useCallback(async (id: string): Promise<void> => {
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const { error: deleteError } = await supabase
      .from("experiencia")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Error deleting experience:", deleteError);
      throw new Error("Erro ao remover experiência");
    }
  }, [userId]);

  // Add cargo to existing experience
  const addCargo = useCallback(
    async (data: CargoInsertData): Promise<Cargo> => {
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }

      // Find the experience
      const existingExp = experiences.find((e) => e.id === data.experiencia_id);
      if (!existingExp) {
        throw new Error("Experiência não encontrada");
      }

      // Validate date overlap with existing cargos
      for (const cargo of existingExp.cargos) {
        if (datesOverlap(cargo.inicio, cargo.fim, data.inicio, data.fim)) {
          throw new Error("Período conflita com outro cargo nesta empresa");
        }
      }

      // Calculate ordem based on existing cargos
      const ordem = existingExp.cargos.length;

      // Insert new cargo
      const { data: newCargo, error: insertError } = await supabase
        .from("cargos_experiencia")
        .insert({
          experiencia_id: data.experiencia_id,
          titulo_cargo: data.titulo_cargo,
          tipo_emprego: data.tipo_emprego,
          inicio: data.inicio,
          fim: data.fim || null,
          atualmente_trabalhando: data.atualmente_trabalhando || false,
          descricao: data.descricao || null,
          ordem,
        })
        .select()
        .single();

      if (insertError || !newCargo) {
        console.error("Error adding cargo:", insertError);
        throw new Error("Erro ao adicionar cargo");
      }

      return {
        id: newCargo.id,
        titulo_cargo: newCargo.titulo_cargo,
        tipo_emprego: newCargo.tipo_emprego,
        inicio: newCargo.inicio,
        fim: newCargo.fim,
        atualmente_trabalhando: newCargo.atualmente_trabalhando,
        descricao: newCargo.descricao,
        habilidades_usadas: newCargo.habilidades_usadas,
        ordem: newCargo.ordem,
      };
    },
    [userId, experiences]
  );

  return {
    experiences,
    loading,
    error,
    refetch: fetchExperiences,
    addExperience,
    updateExperience,
    deleteExperience,
    addCargo,
  };
}
