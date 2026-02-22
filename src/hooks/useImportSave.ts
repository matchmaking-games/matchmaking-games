import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ReviewedData } from "@/components/ImportReviewDrawer";

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

      // Step 2 — Delete existing experiences
      const { error: deleteExpError } = await supabase
        .from("experiencia")
        .delete()
        .eq("user_id", user.id);
      if (deleteExpError) throw deleteExpError;

      // Step 3 — Delete existing education
      const { error: deleteEduError } = await supabase
        .from("educacao")
        .delete()
        .eq("user_id", user.id);
      if (deleteEduError) throw deleteEduError;

      // Step 4 — Insert new experiences
      if (data.experiences.length > 0) {
        const mappedExperiences = data.experiences.map((exp, index) => ({
          user_id: user.id,
          empresa: exp.empresa,
          titulo_cargo: exp.titulo_cargo,
          tipo_emprego: exp.tipo_emprego,
          remoto: exp.modalidade,
          inicio: exp.inicio,
          fim: exp.fim || null,
          atualmente_trabalhando: !exp.fim,
          descricao: exp.descricao || "",
          ordem: index,
        }));

        const { error: insertExpError } = await supabase
          .from("experiencia")
          .insert(mappedExperiences);
        if (insertExpError) throw insertExpError;
      }

      // Step 5 — Insert new education
      if (data.education.length > 0) {
        const mappedEducation = data.education.map((edu, index) => ({
          user_id: user.id,
          instituicao: edu.instituicao,
          tipo: edu.tipo,
          titulo: edu.titulo,
          area: null,
          inicio: edu.inicio,
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
