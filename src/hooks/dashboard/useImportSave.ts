import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ReviewedData, ReviewExperience } from "@/components/dashboard/ImportReviewDrawer";

export function useImportSave() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveImportData = async (data: ReviewedData): Promise<void> => {
    setIsSaving(true);
    setSaveError(null);

    try {
      // Step 1 — Verify authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("Usuário não autenticado");
      }

      // Step 1.5 — Validate required fields
      for (const exp of data.experiences) {
        if (!exp.empresa || !exp.titulo_cargo || !exp.modalidade) {
          throw new Error("Preencha todos os campos obrigatórios antes de confirmar a importação.");
        }
        if ((exp.modalidade === "presencial" || exp.modalidade === "hibrido") && (!exp.estado || !exp.cidade)) {
          throw new Error("Preencha todos os campos obrigatórios antes de confirmar a importação.");
        }
      }

      // Step 2 — Delete existing cargos_experiencia (children first)
      // Get all experience IDs for this user first
      const { data: existingExps } = await supabase
        .from("experiencia")
        .select("id")
        .eq("user_id", user.id);

      if (existingExps && existingExps.length > 0) {
        const expIds = existingExps.map(e => e.id);
        for (const expId of expIds) {
          await supabase
            .from("cargos_experiencia")
            .delete()
            .eq("experiencia_id", expId);
        }
      }

      // Step 3 — Delete existing experiences
      const { error: deleteExpError } = await supabase
        .from("experiencia")
        .delete()
        .eq("user_id", user.id);
      if (deleteExpError) throw deleteExpError;

      // Step 4 — Delete existing education
      const { error: deleteEduError } = await supabase
        .from("educacao")
        .delete()
        .eq("user_id", user.id);
      if (deleteEduError) throw deleteEduError;

      // Step 5 — Group experiences by company name
      const companyGroups = new Map<string, ReviewExperience[]>();
      for (const exp of data.experiences) {
        const key = exp.empresa.trim().toLowerCase();
        const group = companyGroups.get(key) || [];
        group.push(exp);
        companyGroups.set(key, group);
      }

      // Step 6 — Insert experiences (grouped by company)
      let empresaIndex = 0;
      for (const [, group] of companyGroups) {
        if (group.length === 1) {
          // Single role — insert only into experiencia
          const exp = group[0];
          const { error: insertExpError } = await supabase
            .from("experiencia")
            .insert({
              user_id: user.id,
              empresa: exp.empresa,
              titulo_cargo: exp.titulo_cargo,
              tipo_emprego: exp.tipo_emprego,
              remoto: exp.modalidade,
              cidade: exp.modalidade === "remoto" ? null : (exp.cidade || null),
              estado: exp.modalidade === "remoto" ? null : (exp.estado || null),
              inicio: exp.inicio,
              fim: exp.fim || null,
              atualmente_trabalhando: !exp.fim,
              descricao: exp.descricao || "",
              ordem: empresaIndex,
            });
          if (insertExpError) throw insertExpError;
        } else {
          // Multiple roles — sort by inicio descending to find most recent
          const sorted = [...group].sort((a, b) => {
            const aDate = a.inicio || "0000-00";
            const bDate = b.inicio || "0000-00";
            return bDate.localeCompare(aDate);
          });

          const mostRecent = sorted[0];
          const allInicios = sorted.map(c => c.inicio).filter(Boolean);
          const allFims = sorted.map(c => c.fim);
          const hasActiveCargo = allFims.some(f => !f);

          const menorInicio = allInicios.length > 0
            ? allInicios.reduce((min, d) => d < min ? d : min)
            : null;

          const fimsValidos = allFims.filter(Boolean) as string[];
          const maiorFim = hasActiveCargo
            ? null
            : (fimsValidos.length > 0 ? fimsValidos.reduce((max, d) => d > max ? d : max) : null);

          // Insert parent experiencia
          const { data: parentData, error: insertParentError } = await supabase
            .from("experiencia")
            .insert({
              user_id: user.id,
              empresa: mostRecent.empresa,
              titulo_cargo: mostRecent.titulo_cargo,
              tipo_emprego: mostRecent.tipo_emprego,
              remoto: mostRecent.modalidade,
              cidade: mostRecent.modalidade === "remoto" ? null : (mostRecent.cidade || null),
              estado: mostRecent.modalidade === "remoto" ? null : (mostRecent.estado || null),
              inicio: menorInicio,
              fim: maiorFim,
              atualmente_trabalhando: hasActiveCargo,
              descricao: mostRecent.descricao || "",
              ordem: empresaIndex,
            })
            .select("id")
            .single();

          if (insertParentError) throw insertParentError;
          const parentId = parentData.id;

          // Insert children in cargos_experiencia
          const mappedCargos = sorted.map((cargo, index) => ({
            experiencia_id: parentId,
            titulo_cargo: cargo.titulo_cargo,
            tipo_emprego: cargo.tipo_emprego,
            inicio: cargo.inicio ? `${cargo.inicio}-01` : null,
            fim: cargo.fim ? `${cargo.fim}-01` : null,
            atualmente_trabalhando: !cargo.fim,
            descricao: cargo.descricao || "",
            habilidades_usadas: null,
            ordem: index,
          }));

          const { error: insertCargosError } = await supabase
            .from("cargos_experiencia")
            .insert(mappedCargos);
          if (insertCargosError) throw insertCargosError;
        }
        empresaIndex++;
      }

      // Step 7 — Insert new education
      if (data.education.length > 0) {
        const mappedEducation = data.education.map((edu, index) => ({
          user_id: user.id,
          instituicao: edu.instituicao,
          tipo: edu.tipo,
          titulo: edu.titulo,
          area: null,
          inicio: edu.inicio || null,
          fim: edu.fim || null,
          concluido: !!edu.fim,
          ordem: index,
        }));

        const { error: insertEduError } = await supabase
          .from("educacao")
          .insert(mappedEducation);
        if (insertEduError) throw insertEduError;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar dados";
      setSaveError(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveImportData, isSaving, saveError };
}
