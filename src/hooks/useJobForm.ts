import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateSlug } from "@/lib/formatters";
import { addDays } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type NivelVaga = Database["public"]["Enums"]["nivel_vaga"];
type TipoContrato = Database["public"]["Enums"]["tipo_contrato"];
type TipoTrabalho = Database["public"]["Enums"]["tipo_trabalho"];
type TipoPublicacaoVaga = Database["public"]["Enums"]["tipo_publicacao_vaga"];

export interface VagaCompleta {
  id: string;
  titulo: string;
  slug: string;
  descricao: string;
  tipo_funcao: string[];
  nivel: NivelVaga;
  tipo_contrato: TipoContrato;
  remoto: TipoTrabalho;
  estado: string | null;
  cidade: string | null;
  salario_min: number | null;
  salario_max: number | null;
  mostrar_salario: boolean | null;
  tipo_publicacao: TipoPublicacaoVaga | null;
  contato_candidatura: string | null;
  ativa: boolean | null;
  estudio_id: string;
  status: string | null;
}

export interface VagaFormData {
  titulo: string;
  tipo_funcao: string[];
  nivel: NivelVaga;
  tipo_contrato: TipoContrato;
  remoto: TipoTrabalho;
  estado: string | null;
  cidade: string | null;
  contato_candidatura: string | null;
  salario_min: number | null;
  salario_max: number | null;
  mostrar_salario: boolean;
  descricao: string;
  tipo_publicacao: TipoPublicacaoVaga;
  habilidades_obrigatorias: string[];
  habilidades_desejaveis: string[];
}

interface UseJobFormReturn {
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  isAuthorized: boolean;
  estudioId: string | null;
  existingJob: VagaCompleta | null;
  existingSkills: {
    obrigatorias: string[];
    desejaveis: string[];
  };
  createJob: (data: VagaFormData) => Promise<void>;
  updateJob: (id: string, data: VagaFormData) => Promise<void>;
  saveDraft: (data: VagaFormData) => Promise<void>;
}

interface UseJobFormReturnComplete extends UseJobFormReturn {
  updateDraft: (id: string, data: VagaFormData) => Promise<void>;
}

export function useJobForm(jobId?: string): UseJobFormReturnComplete {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [estudioId, setEstudioId] = useState<string | null>(null);
  const [existingJob, setExistingJob] = useState<VagaCompleta | null>(null);
  const [existingSkills, setExistingSkills] = useState<{
    obrigatorias: string[];
    desejaveis: string[];
  }>({ obrigatorias: [], desejaveis: [] });

  // Effect 1: Check membership and authorization
  useEffect(() => {
    const checkMembership = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsAuthorized(false);
          setError("Você precisa estar logado.");
          return;
        }

        const { data: membership, error: membershipError } = await supabase
          .from("estudio_membros")
          .select("role, estudio_id")
          .eq("user_id", session.user.id)
          .eq("ativo", true)
          .maybeSingle();

        if (membershipError) {
          console.error("Error checking membership:", membershipError);
          setError("Erro ao verificar permissões.");
          setIsAuthorized(false);
          return;
        }

        if (!membership) {
          setIsAuthorized(false);
          setError("Você não está associado a nenhum estúdio.");
          return;
        }

        if (membership.role !== "super_admin") {
          setIsAuthorized(false);
          setError("Apenas administradores podem gerenciar vagas.");
          return;
        }

        setIsAuthorized(true);
        setEstudioId(membership.estudio_id);
      } catch (err) {
        console.error("Error checking membership:", err);
        setError("Erro ao verificar permissões.");
        setIsAuthorized(false);
      }
    };

    checkMembership();
  }, []);

  // Effect 2: Fetch existing job data if editing
  useEffect(() => {
    const fetchJobData = async () => {
      if (!isAuthorized || !estudioId || !jobId) {
        if (!jobId) setIsLoading(false);
        return;
      }

      try {
        // Fetch job
        const { data: vaga, error: vagaError } = await supabase
          .from("vagas")
          .select("*")
          .eq("id", jobId)
          .single();

        if (vagaError || !vaga) {
          console.error("Error fetching job:", vagaError);
          setError("Vaga não encontrada.");
          setIsLoading(false);
          return;
        }

        // Verify job belongs to user's studio
        if (vaga.estudio_id !== estudioId) {
          setError("Você não tem permissão para editar esta vaga.");
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        setExistingJob(vaga as VagaCompleta);

        // Fetch mandatory skills
        const { data: obrigatorias } = await supabase
          .from("vaga_habilidades")
          .select("habilidade_id")
          .eq("vaga_id", jobId)
          .eq("obrigatoria", true);

        // Fetch desired skills
        const { data: desejaveis } = await supabase
          .from("vaga_habilidades")
          .select("habilidade_id")
          .eq("vaga_id", jobId)
          .eq("obrigatoria", false);

        setExistingSkills({
          obrigatorias: obrigatorias?.map((h) => h.habilidade_id) || [],
          desejaveis: desejaveis?.map((h) => h.habilidade_id) || [],
        });
      } catch (err) {
        console.error("Error fetching job data:", err);
        setError("Erro ao carregar dados da vaga.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthorized && estudioId) {
      fetchJobData();
    }
  }, [isAuthorized, estudioId, jobId]);

  // Generate unique slug silently
  const generateUniqueSlug = async (titulo: string, excludeId?: string): Promise<string> => {
    const baseSlug = generateSlug(titulo);
    let slug = baseSlug;
    let counter = 2;

    while (true) {
      let query = supabase
        .from("vagas")
        .select("id")
        .eq("slug", slug);

      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      const { data } = await query.maybeSingle();

      if (!data) break; // Slug available

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  };

  // Insert skills for a job
  const insertSkills = async (vagaId: string, obrigatorias: string[], desejaveis: string[]) => {
    const skillsToInsert = [
      ...obrigatorias.map((habilidade_id) => ({
        vaga_id: vagaId,
        habilidade_id,
        obrigatoria: true,
      })),
      ...desejaveis.map((habilidade_id) => ({
        vaga_id: vagaId,
        habilidade_id,
        obrigatoria: false,
      })),
    ];

    if (skillsToInsert.length > 0) {
      const { error: skillsError } = await supabase
        .from("vaga_habilidades")
        .insert(skillsToInsert);

      if (skillsError) {
        console.error("Error inserting skills:", skillsError);
        throw new Error("Erro ao salvar habilidades.");
      }
    }
  };

  // Save as draft
  const saveDraft = useCallback(async (data: VagaFormData) => {
    if (!estudioId) {
      toast({
        title: "Erro",
        description: "Estúdio não encontrado.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      // Generate unique slug
      const slug = await generateUniqueSlug(data.titulo);

      // Insert job as draft - expires_at is always null for drafts
      const { data: vaga, error: insertError } = await supabase
        .from("vagas")
        .insert({
          titulo: data.titulo,
          slug,
          descricao: data.descricao,
          tipo_funcao: data.tipo_funcao,
          nivel: data.nivel,
          tipo_contrato: data.tipo_contrato,
          remoto: data.remoto,
          estado: data.estado,
          cidade: data.cidade,
          salario_min: data.salario_min,
          salario_max: data.salario_max,
          mostrar_salario: data.mostrar_salario,
          tipo_publicacao: data.tipo_publicacao,
          contato_candidatura: data.contato_candidatura,
          status: 'rascunho',
          ativa: false,
          expira_em: null,
          criada_por: session.user.id,
          estudio_id: estudioId,
        })
        .select("id")
        .single();

      if (insertError || !vaga) {
        console.error("Error creating draft:", insertError);
        throw new Error("Erro ao salvar rascunho.");
      }

      // Insert skills
      await insertSkills(
        vaga.id,
        data.habilidades_obrigatorias,
        data.habilidades_desejaveis
      );

      toast({
        title: "Rascunho salvo!",
        description: "Você pode continuar editando depois.",
      });

      navigate("/studio/jobs");
    } catch (err) {
      console.error("Error saving draft:", err);
      toast({
        title: "Erro ao salvar rascunho",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [estudioId, navigate, toast]);

  // Update existing draft
  const updateDraft = useCallback(async (id: string, data: VagaFormData) => {
    if (!estudioId) {
      toast({
        title: "Erro",
        description: "Estúdio não encontrado.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      // Regenerate slug if title changed
      let slug = existingJob?.slug || "";
      if (existingJob && data.titulo !== existingJob.titulo) {
        slug = await generateUniqueSlug(data.titulo, id);
      }

      // UPDATE the existing job (keep current status)
      const { error: updateError } = await supabase
        .from("vagas")
        .update({
          titulo: data.titulo,
          slug,
          descricao: data.descricao,
          tipo_funcao: data.tipo_funcao,
          nivel: data.nivel,
          tipo_contrato: data.tipo_contrato,
          remoto: data.remoto,
          estado: data.estado,
          cidade: data.cidade,
          salario_min: data.salario_min,
          salario_max: data.salario_max,
          mostrar_salario: data.mostrar_salario,
          tipo_publicacao: data.tipo_publicacao,
          contato_candidatura: data.contato_candidatura,
          // Keep current status - don't force anything
        })
        .eq("id", id);

      if (updateError) {
        console.error("Error updating draft:", updateError);
        throw new Error("Erro ao atualizar rascunho.");
      }

      // Delete old skills and insert new ones
      await supabase.from("vaga_habilidades").delete().eq("vaga_id", id);
      await insertSkills(id, data.habilidades_obrigatorias, data.habilidades_desejaveis);

      toast({
        title: "Rascunho atualizado!",
        description: "Alterações salvas com sucesso.",
      });

      navigate("/studio/jobs");
    } catch (err) {
      console.error("Error updating draft:", err);
      toast({
        title: "Erro ao atualizar rascunho",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [estudioId, existingJob, navigate, toast]);

  // Create new job
  const createJob = useCallback(async (data: VagaFormData) => {
    if (!estudioId) {
      toast({
        title: "Erro",
        description: "Estúdio não encontrado.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      // Generate unique slug
      const slug = await generateUniqueSlug(data.titulo);
      const expiraEm = addDays(new Date(), 30).toISOString();

      if (data.tipo_publicacao === 'gratuita') {
        // Free job: publish directly
        const { data: vaga, error: insertError } = await supabase
          .from("vagas")
          .insert({
            titulo: data.titulo,
            slug,
            descricao: data.descricao,
            tipo_funcao: data.tipo_funcao,
            nivel: data.nivel,
            tipo_contrato: data.tipo_contrato,
            remoto: data.remoto,
            estado: data.estado,
            cidade: data.cidade,
            salario_min: data.salario_min,
            salario_max: data.salario_max,
            mostrar_salario: data.mostrar_salario,
            tipo_publicacao: 'gratuita',
            contato_candidatura: data.contato_candidatura,
            status: 'publicada',
            ativa: true,
            expira_em: expiraEm,
            criada_por: session.user.id,
            estudio_id: estudioId,
          })
          .select("id")
          .single();

        if (insertError || !vaga) {
          console.error("Error creating job:", insertError);
          throw new Error("Erro ao criar vaga.");
        }

        // Insert skills
        await insertSkills(
          vaga.id,
          data.habilidades_obrigatorias,
          data.habilidades_desejaveis
        );

        toast({
          title: "Vaga publicada!",
          description: `A vaga "${data.titulo}" foi criada com sucesso.`,
        });

        navigate("/studio/jobs");

      } else if (data.tipo_publicacao === 'destaque') {
        // Featured job: save as awaiting payment, then redirect to Stripe
        const { data: vaga, error: insertError } = await supabase
          .from("vagas")
          .insert({
            titulo: data.titulo,
            slug,
            descricao: data.descricao,
            tipo_funcao: data.tipo_funcao,
            nivel: data.nivel,
            tipo_contrato: data.tipo_contrato,
            remoto: data.remoto,
            estado: data.estado,
            cidade: data.cidade,
            salario_min: data.salario_min,
            salario_max: data.salario_max,
            mostrar_salario: data.mostrar_salario,
            tipo_publicacao: 'destaque',
            contato_candidatura: data.contato_candidatura,
            status: 'aguardando_pagamento',
            ativa: false,
            expira_em: null,
            criada_por: session.user.id,
            estudio_id: estudioId,
          })
          .select("id")
          .single();

        if (insertError || !vaga) {
          console.error("Error creating job:", insertError);
          throw new Error("Erro ao criar vaga.");
        }

        // Insert skills
        await insertSkills(
          vaga.id,
          data.habilidades_obrigatorias,
          data.habilidades_desejaveis
        );

        // Call Edge Function to create Stripe checkout session
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
          'create-checkout-session',
          { body: { vaga_id: vaga.id } }
        );

        if (checkoutError || !checkoutData?.url) {
          console.error("Error creating checkout session:", checkoutError);
          toast({
            title: "Erro ao processar pagamento",
            description: "Tente novamente ou entre em contato com o suporte.",
            variant: "destructive",
          });
          return;
        }

        // Redirect to Stripe Checkout
        window.location.href = checkoutData.url;
      }
    } catch (err) {
      console.error("Error creating job:", err);
      toast({
        title: "Erro ao criar vaga",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [estudioId, navigate, toast]);

  // Update existing job
  const updateJob = useCallback(async (id: string, data: VagaFormData) => {
    if (!estudioId) {
      toast({
        title: "Erro",
        description: "Estúdio não encontrado.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      // Check if title changed, regenerate slug if needed
      let slug = existingJob?.slug || "";
      if (existingJob && data.titulo !== existingJob.titulo) {
        slug = await generateUniqueSlug(data.titulo, id);
      }

      // Update job (NOT including expira_em - keep original value)
      // Also don't update status or ativa for published jobs
      const { error: updateError } = await supabase
        .from("vagas")
        .update({
          titulo: data.titulo,
          slug,
          descricao: data.descricao,
          tipo_funcao: data.tipo_funcao,
          nivel: data.nivel,
          tipo_contrato: data.tipo_contrato,
          remoto: data.remoto,
          estado: data.estado,
          cidade: data.cidade,
          salario_min: data.salario_min,
          salario_max: data.salario_max,
          // Don't update tipo_publicacao for published jobs
          tipo_publicacao: existingJob?.status === 'publicada' 
            ? existingJob.tipo_publicacao 
            : data.tipo_publicacao,
          contato_candidatura: data.contato_candidatura,
        })
        .eq("id", id);

      if (updateError) {
        console.error("Error updating job:", updateError);
        throw new Error("Erro ao atualizar vaga.");
      }

      // Delete old skills
      const { error: deleteError } = await supabase
        .from("vaga_habilidades")
        .delete()
        .eq("vaga_id", id);

      if (deleteError) {
        console.error("Error deleting old skills:", deleteError);
        throw new Error("Erro ao atualizar habilidades.");
      }

      // Insert new skills
      await insertSkills(
        id,
        data.habilidades_obrigatorias,
        data.habilidades_desejaveis
      );

      toast({
        title: "Vaga atualizada!",
        description: `A vaga "${data.titulo}" foi atualizada com sucesso.`,
      });

      navigate("/studio/jobs");
    } catch (err) {
      console.error("Error updating job:", err);
      toast({
        title: "Erro ao atualizar vaga",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [estudioId, existingJob, navigate, toast]);

  return {
    isLoading,
    isSaving,
    error,
    isAuthorized,
    estudioId,
    existingJob,
    existingSkills,
    createJob,
    updateJob,
    saveDraft,
    updateDraft,
  };
}
