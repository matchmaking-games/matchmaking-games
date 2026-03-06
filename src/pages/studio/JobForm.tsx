import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Sparkles, X, ChevronDown } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { JobSkillsSelector } from "@/components/studio/JobSkillsSelector";
import { useJobForm, type VagaFormData, type VagaCompleta } from "@/hooks/useJobForm";
import { useIBGELocations } from "@/hooks/useIBGELocations";
import { useTiposFuncao } from "@/hooks/useTiposFuncao";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Form schema with Zod
const vagaFormSchema = z.object({
  titulo: z.string().min(5, "Mínimo 5 caracteres").max(100, "Máximo 100 caracteres"),
  tipo_funcao: z.array(z.string()).min(1, "Selecione pelo menos um tipo de função"),
  nivel: z.enum(["iniciante", "junior", "pleno", "senior", "lead"]),
  tipo_emprego: z.enum(["clt", "pj", "freelancer", "estagio", "tempo_integral"]),
  remoto: z.enum(["presencial", "hibrido", "remoto"]),
  estado: z.string().optional(),
  cidade: z.string().optional(),
  contato_candidatura: z.string().min(1, "Campo obrigatório").max(500, "Máximo 500 caracteres"),
  salario_min: z.number().positive().nullable().optional(),
  salario_max: z.number().positive().nullable().optional(),
  mostrar_salario: z.boolean().default(false),
  descricao: z.string().min(100, "Mínimo 100 caracteres").max(10000, "Máximo 10.000 caracteres"),
  tipo_publicacao: z.enum(["gratuita", "destaque"]).nullable(),
});

type VagaFormSchemaType = z.infer<typeof vagaFormSchema>;

// tipoFuncaoOptions removed — now fetched from Supabase via useTiposFuncao

export default function JobForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const {
    isLoading,
    isSaving,
    error,
    isAuthorized,
    existingJob,
    existingSkills,
    existingTiposFuncao,
    createJob,
    updateJob,
    saveDraft,
    updateDraft,
  } = useJobForm(id, searchParams.get("studio"));

  const { tiposFuncao, loading: loadingTiposFuncao } = useTiposFuncao();

  const { estados, loadingEstados, municipios, loadingMunicipios, fetchMunicipios, clearMunicipios } =
    useIBGELocations();

  const [habilidadesObrigatorias, setHabilidadesObrigatorias] = useState<string[]>([]);
  const [habilidadesDesejaveis, setHabilidadesDesejaveis] = useState<string[]>([]);

  // State for tracking which button is saving
  const [savingAction, setSavingAction] = useState<"draft" | "publish" | null>(null);

  // State for unsaved changes protection
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formSaved, setFormSaved] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Detect payment cancelled return from Stripe
  useEffect(() => {
    const payment = searchParams.get("payment");

    if (payment === "cancelled") {
      toast({
        title: "Pagamento cancelado",
        description: "Você pode ajustar a vaga e tentar publicar novamente.",
      });

      // Clean query param
      navigate(window.location.pathname, { replace: true });
    }
  }, [searchParams, toast, navigate]);

  const form = useForm<VagaFormSchemaType>({
    resolver: zodResolver(vagaFormSchema),
    defaultValues: {
      titulo: "",
      tipo_funcao: [],
      nivel: "pleno",
      tipo_emprego: "clt",
      remoto: "remoto",
      estado: "",
      cidade: "",
      contato_candidatura: "",
      salario_min: null,
      salario_max: null,
      mostrar_salario: false,
      descricao: "",
      tipo_publicacao: null,
    },
  });

  // Watch form changes to track unsaved changes
  useEffect(() => {
    const subscription = form.watch(() => {
      if (!formSaved) {
        setHasUnsavedChanges(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, formSaved]);

  // Also track skills changes
  useEffect(() => {
    if (!formSaved && (habilidadesObrigatorias.length > 0 || habilidadesDesejaveis.length > 0)) {
      setHasUnsavedChanges(true);
    }
  }, [habilidadesObrigatorias, habilidadesDesejaveis, formSaved]);

  // Intercept browser close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !formSaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, formSaved]);

  // Handle cancel button click with unsaved changes check
  const studioParam = searchParams.get("studio");
  const jobsUrl = studioParam
    ? `/studio/manage/jobs?studio=${studioParam}`
    : "/studio/manage/jobs";

  const handleCancelClick = () => {
    if (hasUnsavedChanges && !formSaved) {
      setShowExitDialog(true);
    } else {
      navigate(jobsUrl);
    }
  };

  const descricao = form.watch("descricao") || "";
  const charCount = descricao.length;
  const isValidLength = charCount >= 100 && charCount <= 10000;
  const isTooShort = charCount > 0 && charCount < 100;

  const selectedEstado = form.watch("estado");
  const tipoFuncaoValue = form.watch("tipo_funcao") || [];
  const selectedRemoto = form.watch("remoto");
  const [tipoFuncaoOpen, setTipoFuncaoOpen] = useState(false);

  // Load existing job data into form
  useEffect(() => {
    if (existingJob) {
      form.reset({
        titulo: existingJob.titulo,
        tipo_funcao: existingTiposFuncao || [],
        nivel: existingJob.nivel,
        tipo_emprego: existingJob.tipo_emprego,
        remoto: existingJob.remoto,
        estado: existingJob.estado || "",
        cidade: existingJob.cidade || "",
        contato_candidatura: existingJob.contato_candidatura || "",
        salario_min: existingJob.salario_min,
        salario_max: existingJob.salario_max,
        mostrar_salario: existingJob.mostrar_salario || false,
        descricao: existingJob.descricao,
        tipo_publicacao: existingJob.tipo_publicacao || null,
      });

      // Load municipalities if state exists
      if (existingJob.estado) {
        fetchMunicipios(existingJob.estado);
      }

      // Reset unsaved changes after loading existing job
      setHasUnsavedChanges(false);
    }
  }, [existingJob, form, fetchMunicipios]);

  // Load existing skills
  useEffect(() => {
    if (existingSkills.obrigatorias.length > 0 || existingSkills.desejaveis.length > 0) {
      setHabilidadesObrigatorias(existingSkills.obrigatorias);
      setHabilidadesDesejaveis(existingSkills.desejaveis);
    }
  }, [existingSkills]);

  // Handle state change
  const handleEstadoChange = (sigla: string) => {
    form.setValue("estado", sigla);
    form.setValue("cidade", "");
    fetchMunicipios(sigla);
  };

  // Handle city change
  const handleCidadeChange = (cidadeNome: string) => {
    form.setValue("cidade", cidadeNome);
  };

  // Handle tipo_funcao selection
  const handleTipoFuncaoSelect = (value: string) => {
    const current = tipoFuncaoValue;
    if (!current.includes(value)) {
      form.setValue("tipo_funcao", [...current, value]);
    }
    setTipoFuncaoOpen(false);
  };

  // Handle tipo_funcao removal
  const handleTipoFuncaoRemove = (value: string) => {
    const current = tipoFuncaoValue;
    form.setValue(
      "tipo_funcao",
      current.filter((v) => v !== value),
    );
  };

  // Handle work model change (clear location when remote)
  const handleRemotoChange = (value: string) => {
    form.setValue("remoto", value as "presencial" | "hibrido" | "remoto");
    if (value === "remoto") {
      form.setValue("estado", "");
      form.setValue("cidade", "");
      clearMunicipios();
    }
  };

  // Transform form data to VagaFormData
  const transformFormData = (data: Partial<VagaFormSchemaType>): VagaFormData => {
    return {
      titulo: data.titulo || "",
      tipo_funcao_ids: data.tipo_funcao || [],
      nivel: data.nivel || "pleno",
      tipo_emprego: data.tipo_emprego || "clt",
      remoto: data.remoto || "remoto",
      estado: data.estado || null,
      cidade: data.cidade || null,
      contato_candidatura: data.contato_candidatura || null,
      salario_min: data.salario_min || null,
      salario_max: data.salario_max || null,
      mostrar_salario: data.mostrar_salario || false,
      descricao: data.descricao || "",
      tipo_publicacao: (data.tipo_publicacao || "gratuita") as "gratuita" | "destaque",
      habilidades_obrigatorias: habilidadesObrigatorias,
      habilidades_desejaveis: habilidadesDesejaveis,
    };
  };

  // Handle form submission (publish)
  const onSubmit = async (data: VagaFormSchemaType) => {
    // Validate required skills
    if (habilidadesObrigatorias.length === 0) {
      toast({
        title: "Erro de validação",
        description: "Selecione pelo menos uma habilidade obrigatória.",
        variant: "destructive",
      });
      return;
    }

    const formData = transformFormData(data);

    setFormSaved(true);
    if (isEditing && id) {
      await updateJob(id, formData);
    } else {
      await createJob(formData);
    }
  };

  // Handle save as draft
  const handleSaveDraft = async (data: VagaFormSchemaType) => {
    const formData = transformFormData(data);
    setFormSaved(true);
    await saveDraft(formData);
  };

  // Handler for Save Draft button click
  const handleSaveDraftClick = async () => {
    // Minimal validation for draft - only title is required
    const titulo = form.getValues("titulo");
    if (!titulo || titulo.length < 3) {
      form.setError("titulo", {
        type: "manual",
        message: "Mínimo 3 caracteres para salvar rascunho",
      });
      toast({
        title: "Erro de validação",
        description: "Preencha o título da vaga para salvar o rascunho.",
        variant: "destructive",
      });
      return;
    }

    setSavingAction("draft");
    try {
      const formData = transformFormData(form.getValues());
      setFormSaved(true);

      // FIX: Use updateDraft when editing, saveDraft when creating new
      if (isEditing && id) {
        await updateDraft(id, formData);
      } else {
        await saveDraft(formData);
      }
    } catch (err) {
      console.error("Error saving draft:", err);
      toast({
        title: "Erro ao salvar rascunho",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSavingAction(null);
    }
  };

  // Handler for Publish button click
  const handlePublishClick = async () => {
    // 1. Validate required skills (managed via useState, not form)
    if (habilidadesObrigatorias.length === 0) {
      toast({
        title: "Erro de validação",
        description: "Selecione pelo menos uma habilidade obrigatória.",
        variant: "destructive",
      });
      return;
    }

    // 2. Validate tipo_publicacao (managed via form but without refine)
    const tipoPublicacao = form.getValues("tipo_publicacao");
    if (!tipoPublicacao) {
      toast({
        title: "Erro de validação",
        description: "Escolha um tipo de vaga antes de publicar.",
        variant: "destructive",
      });
      return;
    }

    // 3. Validate salary manually (max >= min)
    const salarioMin = form.getValues("salario_min");
    const salarioMax = form.getValues("salario_max");
    if (salarioMin && salarioMax && salarioMax < salarioMin) {
      toast({
        title: "Erro de validação",
        description: "Salário máximo deve ser maior ou igual ao mínimo.",
        variant: "destructive",
      });
      return;
    }

    // 4. Validate form fields directly with Zod (bypasses zodResolver timing issues)
    const parseResult = vagaFormSchema.safeParse(form.getValues());

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0];
      toast({
        title: "Erro de validação",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    // 5. All validations passed - publish
    setSavingAction("publish");
    try {
      const data = form.getValues();
      const formData = transformFormData(data);

      setFormSaved(true);
      if (isEditing && id) {
        await updateJob(id, formData);
      } else {
        await createJob(formData);
      }
    } catch (err) {
      console.error("Error publishing job:", err);
      toast({
        title: "Erro ao publicar vaga",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSavingAction(null);
    }
  };

  // Redirect if not authorized
  if (!isLoading && !isAuthorized) {
    return <Navigate to="/studio/manage/jobs" replace />;
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(jobsUrl)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="font-display text-2xl">{isEditing ? "Editar Vaga" : "Criar Nova Vaga"}</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
              {/* SECTION: BASIC INFO */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações Básicas</h3>
                <Separator />

                {/* Title */}
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Título da vaga <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Senior Unity Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Function Type - Badge selector */}
                <FormField
                  control={form.control}
                  name="tipo_funcao"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Tipo de função <span className="text-destructive">*</span>
                      </FormLabel>

                      {/* Selected badges */}
                      {tipoFuncaoValue.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {tipoFuncaoValue.map((funcaoId) => {
                            const funcao = tiposFuncao.find((t) => t.id === funcaoId);
                            return (
                              <Badge
                                key={funcaoId}
                                variant="secondary"
                                className="bg-secondary/10 text-secondary-foreground"
                              >
                                {funcao?.nome || funcaoId}
                                <button
                                  type="button"
                                  className="ml-1 rounded-full outline-none hover:bg-secondary/20"
                                  onClick={() => handleTipoFuncaoRemove(funcaoId)}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}

                      {/* Dropdown selector */}
                      <Popover open={tipoFuncaoOpen} onOpenChange={setTipoFuncaoOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={tipoFuncaoOpen}
                            className="w-full justify-between font-normal"
                            disabled={loadingTiposFuncao}
                          >
                            <span className="text-muted-foreground">
                              {loadingTiposFuncao ? "Carregando..." : "Adicionar função..."}
                            </span>
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar função..." />
                            <CommandList className="max-h-[200px] overflow-y-auto">
                              <CommandEmpty>Nenhuma função encontrada.</CommandEmpty>
                              <CommandGroup>
                                {tiposFuncao
                                  .filter((option) => !tipoFuncaoValue.includes(option.id))
                                  .map((option) => (
                                    <CommandItem
                                      key={option.id}
                                      value={option.nome}
                                      onSelect={() => handleTipoFuncaoSelect(option.id)}
                                    >
                                      {option.nome}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      <p className="text-xs text-muted-foreground">Selecione uma ou mais funções para esta vaga</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contract Type - Full width Select dropdown */}
                <FormField
                  control={form.control}
                  name="tipo_emprego"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tipo de contrato <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de contrato" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="clt">CLT</SelectItem>
                          <SelectItem value="pj">PJ</SelectItem>
                          <SelectItem value="freelancer">Freelancer</SelectItem>
                          <SelectItem value="estagio">Estágio</SelectItem>
                          <SelectItem value="tempo_integral">Tempo integral</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Grid layout for dropdowns - 2 columns on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Level - Select dropdown */}
                  <FormField
                    control={form.control}
                    name="nivel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nível <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o nível" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="iniciante">Iniciante</SelectItem>
                            <SelectItem value="junior">Júnior</SelectItem>
                            <SelectItem value="pleno">Pleno</SelectItem>
                            <SelectItem value="senior">Sênior</SelectItem>
                            <SelectItem value="lead">Lead</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Work Model - Select dropdown */}
                  <FormField
                    control={form.control}
                    name="remoto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Modelo de trabalho <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select onValueChange={handleRemotoChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o modelo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="presencial">Presencial</SelectItem>
                            <SelectItem value="hibrido">Híbrido</SelectItem>
                            <SelectItem value="remoto">Remoto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Location - State/City (hidden when remote) */}
                {selectedRemoto !== "remoto" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select onValueChange={handleEstadoChange} value={field.value} disabled={loadingEstados}>
                            <FormControl>
                              <SelectTrigger>
                                {loadingEstados ? (
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Carregando...</span>
                                  </div>
                                ) : (
                                  <SelectValue placeholder="Selecione o estado" />
                                )}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {estados.map((estado) => (
                                <SelectItem key={estado.sigla} value={estado.sigla}>
                                  {estado.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <Select
                            onValueChange={handleCidadeChange}
                            value={field.value}
                            disabled={!selectedEstado || loadingMunicipios}
                          >
                            <FormControl>
                              <SelectTrigger>
                                {loadingMunicipios ? (
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Carregando...</span>
                                  </div>
                                ) : (
                                  <SelectValue placeholder="Selecione a cidade" />
                                )}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {municipios.map((municipio) => (
                                <SelectItem key={municipio.id} value={municipio.nome}>
                                  {municipio.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Contact for applications */}
                <FormField
                  control={form.control}
                  name="contato_candidatura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Meio de contato <span className="text-destructive">*</span>
                      </FormLabel>

                      <p className="text-xs text-muted-foreground">
                        Informe um email, link de formulário ou instruções de como se candidatar a esta vaga.
                      </p>

                      <FormControl>
                        <Input
                          placeholder="Ex: vagas@estudio.com ou https://estudio.com/vagas"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* SECTION: SALARY */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Remuneração</h3>
                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="salario_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor mínimo (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 1000"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salario_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor máximo (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 8000"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="mostrar_salario"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Exibir faixa salarial publicamente</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {/* SECTION: DESCRIPTION */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Descrição</h3>
                <Separator />

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Descrição da vaga <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva as responsabilidades, requisitos e benefícios da vaga..."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <p
                        className={cn(
                          "text-xs text-right",
                          isTooShort && "text-destructive",
                          isValidLength && "text-primary",
                          !isTooShort && !isValidLength && "text-muted-foreground",
                        )}
                      >
                        {charCount} / 10.000
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* SECTION: SKILLS */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Habilidades</h3>
                <Separator />

                {/* Obrigatórias */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Habilidades obrigatórias <span className="text-destructive">*</span>
                  </label>
                  <p className="text-xs text-muted-foreground">Habilidades que o candidato deve ter para a vaga.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <JobSkillsSelector
                      label={<>Habilidades obrigatórias</>}
                      selectedSkillIds={habilidadesObrigatorias}
                      onSkillsChange={setHabilidadesObrigatorias}
                      excludeSkillIds={habilidadesDesejaveis}
                      categoria="habilidades"
                    />
                    <JobSkillsSelector
                      label={<>Softwares obrigatórios</>}
                      selectedSkillIds={habilidadesObrigatorias}
                      onSkillsChange={setHabilidadesObrigatorias}
                      excludeSkillIds={habilidadesDesejaveis}
                      categoria="softwares"
                    />
                  </div>
                  {habilidadesObrigatorias.length === 0 && form.formState.isSubmitted && (
                    <p className="text-sm font-medium text-destructive">
                      Selecione pelo menos uma habilidade obrigatória
                    </p>
                  )}
                </div>

                {/* Desejáveis */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Habilidades desejáveis (diferenciais)</label>
                  <p className="text-xs text-muted-foreground">
                    Habilidades que são um diferencial, mas não obrigatórias.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <JobSkillsSelector
                      label="Habilidades desejáveis"
                      selectedSkillIds={habilidadesDesejaveis}
                      onSkillsChange={setHabilidadesDesejaveis}
                      excludeSkillIds={habilidadesObrigatorias}
                      categoria="habilidades"
                    />
                    <JobSkillsSelector
                      label="Softwares desejáveis"
                      selectedSkillIds={habilidadesDesejaveis}
                      onSkillsChange={setHabilidadesDesejaveis}
                      excludeSkillIds={habilidadesObrigatorias}
                      categoria="softwares"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: PUBLICATION TYPE */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tipo de Publicação</h3>
                <Separator />

                {existingJob?.status === "publicada" ? (
                  // Read-only mode for published jobs
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <p className="text-sm font-medium mb-2">Tipo de Publicação</p>
                    <Badge variant={existingJob.tipo_publicacao === "destaque" ? "default" : "secondary"}>
                      {existingJob.tipo_publicacao === "destaque" ? "Destaque (R$ 97)" : "Gratuita"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">Não é possível alterar o tipo após publicação</p>
                  </div>
                ) : (
                  // Editable radio buttons
                  <FormField
                    control={form.control}
                    name="tipo_publicacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="space-y-3">
                            {/* Card Gratuita */}
                            <div
                              className={cn(
                                "flex items-start space-x-3 p-3 rounded-md border transition-colors cursor-pointer",
                                field.value === "gratuita"
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:bg-muted/50",
                              )}
                              onClick={() => field.onChange("gratuita")}
                            >
                              <div
                                className={cn(
                                  "w-4 h-4 mt-1 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                  field.value === "gratuita" ? "border-primary" : "border-muted-foreground",
                                )}
                              >
                                {field.value === "gratuita" && <div className="w-2 h-2 rounded-full bg-primary" />}
                              </div>
                              <div className="flex-1">
                                <span className="font-medium">Gratuita</span>
                                <p className="text-sm text-muted-foreground">
                                  Visibilidade padrão na listagem de vagas
                                </p>
                              </div>
                            </div>

                            {/* Card Destaque */}
                            <div
                              className={cn(
                                "flex items-start space-x-3 p-3 rounded-md border transition-colors cursor-pointer",
                                field.value === "destaque"
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:bg-muted/50",
                              )}
                              onClick={() => field.onChange("destaque")}
                            >
                              <div
                                className={cn(
                                  "w-4 h-4 mt-1 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                  field.value === "destaque" ? "border-primary" : "border-muted-foreground",
                                )}
                              >
                                {field.value === "destaque" && <div className="w-2 h-2 rounded-full bg-primary" />}
                              </div>
                              <div className="flex-1">
                                <span className="font-medium flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-primary" />
                                  Destaque (R$ 97)
                                </span>
                                <p className="text-sm text-muted-foreground">
                                  Topo da lista por 30 dias + badge de destaque
                                </p>
                              </div>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelClick}
                  className="sm:hidden w-full text-right text-sm text-muted-foreground underline"
                >
                  Cancelar
                </button>

                <Button type="button" variant="ghost" onClick={handleCancelClick} className="hidden sm:inline-flex">
                  Cancelar
                </Button>

                {/* Save Draft button - only for new jobs or drafts */}
                {(!isEditing || existingJob?.status === "rascunho") && (
                  <Button type="button" variant="ghost" disabled={isSaving} onClick={handleSaveDraftClick}>
                    {savingAction === "draft" ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Rascunho"
                    )}
                  </Button>
                )}

                <Button type="button" disabled={isSaving} onClick={handlePublishClick}>
                  {savingAction === "publish" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {form.watch("tipo_publicacao") === "destaque" && !isEditing ? "Processando..." : "Salvando..."}
                    </>
                  ) : isEditing && existingJob?.status === "publicada" ? (
                    "Salvar Alterações"
                  ) : form.watch("tipo_publicacao") === "destaque" ? (
                    "Publicar e Pagar R$ 97"
                  ) : (
                    "Publicar Vaga"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* AlertDialog for unsaved changes confirmation */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Deseja realmente sair sem salvar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowExitDialog(false)}>Continuar editando</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => navigate(jobsUrl)}>
              Descartar e sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
