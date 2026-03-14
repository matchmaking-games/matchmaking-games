import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { parseDateSafe } from "@/lib/formatters";

// Types from Supabase schema
export type Experience = Database["public"]["Tables"]["experiencia"]["Row"];
export type ExperienceInsert = Database["public"]["Tables"]["experiencia"]["Insert"];
export type ExperienceUpdate = Database["public"]["Tables"]["experiencia"]["Update"];

// Tipo para cargo individual (de cargos_experiencia)
export interface CargoExperiencia {
  id: string;
  experiencia_id: string;
  titulo_cargo: string;
  tipo_emprego: Database["public"]["Enums"]["tipo_emprego"];
  inicio: string;
  fim: string | null;
  atualmente_trabalhando: boolean | null;
  descricao: string | null;
  habilidades_usadas: string[] | null;
  ordem: number | null;
}

// Experience expandida com cargos
export interface ExperienceWithCargos extends Experience {
  cargos: CargoExperiencia[];
}

// Insert para cargo
export interface CargoInsert {
  titulo_cargo: string;
  tipo_emprego: Database["public"]["Enums"]["tipo_emprego"];
  inicio: string;
  fim: string | null;
  atualmente_trabalhando: boolean | null;
  descricao: string | null;
  habilidades_usadas: string[] | null;
}

interface UseExperiencesReturn {
  experiences: ExperienceWithCargos[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addExperience: (data: Omit<ExperienceInsert, "user_id" | "ordem">) => Promise<Experience>;
  updateExperience: (id: string, data: ExperienceUpdate) => Promise<Experience>;
  deleteExperience: (id: string) => Promise<void>;
  addCargo: (experienceId: string, cargoData: CargoInsert) => Promise<void>;
}

// Auxiliar: verificar se dois periodos se sobrepoem
function checkPeriodsOverlap(
  start1: Date,
  end1: Date | null,
  start2: Date,
  end2: Date | null
): boolean {
  // Tratar "atualmente trabalhando" como fim em 2099
  const effectiveEnd1 = end1 || new Date(2099, 11, 31);
  const effectiveEnd2 = end2 || new Date(2099, 11, 31);
  
  // Periodos sobrepoem se: inicio1 <= fim2 E inicio2 <= fim1
  return start1 <= effectiveEnd2 && start2 <= effectiveEnd1;
}

// Auxiliar: formatar mes/ano para mensagens
function formatMonth(date: Date): string {
  return format(date, "MMM yyyy", { locale: ptBR });
}

// Funcao principal de validacao
function validateDatesOverlap(
  newCargo: { inicio: string; fim: string | null; atualmente: boolean | null },
  existingCargos: Array<{ inicio: string; fim: string | null; atualmente: boolean | null }>
): string | null {
  const newStart = new Date(newCargo.inicio);
  const newEnd = newCargo.atualmente ? null : (newCargo.fim ? new Date(newCargo.fim) : null);

  for (const existing of existingCargos) {
    const existingStart = new Date(existing.inicio);
    const existingEnd = existing.atualmente ? null : (existing.fim ? new Date(existing.fim) : null);

    // Caso especial: dois cargos "atualmente trabalhando"
    if (newCargo.atualmente && existing.atualmente) {
      return "Você já possui um cargo ativo (Atualmente trabalhando) nesta empresa. " +
             "Defina uma data de término para o cargo atual antes de adicionar um novo cargo ativo.";
    }

    // Verificar sobreposicao de periodos
    const hasOverlap = checkPeriodsOverlap(newStart, newEnd, existingStart, existingEnd);
    
    if (hasOverlap) {
      const existingPeriod = existing.atualmente 
        ? `desde ${formatMonth(existingStart)}`
        : `de ${formatMonth(existingStart)} até ${formatMonth(existingEnd!)}`;
      
      return `Este cargo conflita com um período existente (${existingPeriod}). ` +
             `As datas não podem se sobrepor. O novo cargo começa em ${formatMonth(newStart)}.`;
    }
  }

  return null; // Sem conflito
}

export function useExperiences(): UseExperiencesReturn {
  const [experiences, setExperiences] = useState<ExperienceWithCargos[]>([]);
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
        .select(`
          *,
          cargos:cargos_experiencia(
            id,
            experiencia_id,
            titulo_cargo,
            tipo_emprego,
            inicio,
            fim,
            atualmente_trabalhando,
            descricao,
            habilidades_usadas,
            ordem
          )
        `)
        .eq("user_id", userId)
        .order("ordem");

      if (fetchError) throw fetchError;

      // Ordenacao client-side: cargos por data (mais recente primeiro)
      const experiencesWithSortedCargos = (data || []).map(exp => ({
        ...exp,
        cargos: (exp.cargos || []).sort((a: CargoExperiencia, b: CargoExperiencia) => 
          new Date(b.inicio).getTime() - new Date(a.inicio).getTime()
        )
      })) as ExperienceWithCargos[];

      setExperiences(experiencesWithSortedCargos);
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

  // Add cargo to existing experience
  const addCargo = useCallback(async (
    experienceId: string,
    cargoData: CargoInsert
  ): Promise<void> => {
    if (!userId) throw new Error("Usuário não autenticado");

    // 1. Buscar experiencia atual com cargos existentes
    const { data: experience, error: fetchError } = await supabase
      .from("experiencia")
      .select(`
        *,
        cargos:cargos_experiencia(
          id, titulo_cargo, tipo_emprego, inicio, fim, atualmente_trabalhando
        )
      `)
      .eq("id", experienceId)
      .single();

    if (fetchError || !experience) {
      throw new Error("Experiência não encontrada");
    }

    const existingCargos = experience.cargos || [];
    const isFirstAdditionalCargo = existingCargos.length === 0;

    // 2. Preparar lista de cargos para validacao
    const cargosParaValidar = isFirstAdditionalCargo
      ? [{ 
          inicio: experience.inicio, 
          fim: experience.fim, 
          atualmente: experience.atualmente_trabalhando 
        }]
      : existingCargos.map((c: CargoExperiencia) => ({ 
          inicio: c.inicio, 
          fim: c.fim, 
          atualmente: c.atualmente_trabalhando 
        }));

    // 3. Validar overlap de datas
    const overlapError = validateDatesOverlap(
      { 
        inicio: cargoData.inicio, 
        fim: cargoData.fim, 
        atualmente: cargoData.atualmente_trabalhando 
      },
      cargosParaValidar
    );

    if (overlapError) {
      throw new Error(overlapError);
    }

    // 4. Se for o PRIMEIRO cargo adicional, migrar cargo original
    if (isFirstAdditionalCargo) {
      // PASSO A: Criar registro do cargo ORIGINAL em cargos_experiencia
      const { error: errorOriginal } = await supabase
        .from("cargos_experiencia")
        .insert({
          experiencia_id: experienceId,
          titulo_cargo: experience.titulo_cargo,
          tipo_emprego: experience.tipo_emprego,
          inicio: experience.inicio,
          fim: experience.fim,
          atualmente_trabalhando: experience.atualmente_trabalhando,
          descricao: experience.descricao,
          habilidades_usadas: experience.habilidades_usadas,
          ordem: 0
        });

      if (errorOriginal) {
        console.error("Erro ao migrar cargo original:", errorOriginal);
        throw new Error("Não foi possível adicionar o cargo. Tente novamente.");
      }

      // PASSO B: Criar registro do cargo NOVO em cargos_experiencia
      const { error: errorNovo } = await supabase
        .from("cargos_experiencia")
        .insert({
          experiencia_id: experienceId,
          titulo_cargo: cargoData.titulo_cargo,
          tipo_emprego: cargoData.tipo_emprego,
          inicio: cargoData.inicio,
          fim: cargoData.fim,
          atualmente_trabalhando: cargoData.atualmente_trabalhando,
          descricao: cargoData.descricao,
          habilidades_usadas: cargoData.habilidades_usadas,
          ordem: 1
        });

      if (errorNovo) {
        console.error("Erro ao criar novo cargo:", errorNovo);
        throw new Error("Não foi possível adicionar o cargo. Tente novamente.");
      }

      // NOTA IMPORTANTE: NAO limpar os campos de cargo em experiencia.
      // Manter dados duplicados para garantir compatibilidade com codigo existente.
      // A renderizacao usa: se cargos.length > 0, mostra timeline; senao, mostra experience.titulo_cargo
    } else {
      // 5. Se for o SEGUNDO+ cargo, apenas criar em cargos_experiencia
      const { error } = await supabase
        .from("cargos_experiencia")
        .insert({
          experiencia_id: experienceId,
          titulo_cargo: cargoData.titulo_cargo,
          tipo_emprego: cargoData.tipo_emprego,
          inicio: cargoData.inicio,
          fim: cargoData.fim,
          atualmente_trabalhando: cargoData.atualmente_trabalhando,
          descricao: cargoData.descricao,
          habilidades_usadas: cargoData.habilidades_usadas,
          ordem: existingCargos.length // Proxima posicao na ordem
        });

      if (error) {
        console.error("Erro ao criar cargo:", error);
        throw new Error("Não foi possível adicionar o cargo. Tente novamente.");
      }
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
    addCargo,
  };
}
