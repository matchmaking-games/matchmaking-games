import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate, useSearchParams, useBlocker } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Sparkles, X, ChevronDown } from "lucide-react";
import { StudioDashboardLayout } from "@/components/studio/StudioDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Form schema with Zod
const vagaFormSchema = z
  .object({
    titulo: z.string().min(5, "Mínimo 5 caracteres").max(100, "Máximo 100 caracteres"),
    tipo_funcao: z.array(z.string()).min(1, "Selecione pelo menos um tipo de função"),
    nivel: z.enum(["iniciante", "junior", "pleno", "senior", "lead"]),
    tipo_contrato: z.enum(["clt", "pj", "freelance", "estagio"]),
    remoto: z.enum(["presencial", "hibrido", "remoto"]),
    estado: z.string().optional(),
    cidade: z.string().optional(),
    contato_candidatura: z.string().min(1, "Campo obrigatório").max(500, "Máximo 500 caracteres"),
    salario_min: z.number().positive().nullable().optional(),
    salario_max: z.number().positive().nullable().optional(),
    mostrar_salario: z.boolean().default(false),
    descricao: z.string().min(100, "Mínimo 100 caracteres").max(10000, "Máximo 10.000 caracteres"),
    tipo_publicacao: z.enum(["gratuita", "destaque"]).default("gratuita"),
    habilidades_obrigatorias: z.array(z.string()).min(1, "Selecione pelo menos uma habilidade obrigatória"),
    habilidades_desejaveis: z.array(z.string()).default([]),
  })
  .refine(
    (data) => {
      if (data.salario_min && data.salario_max) {
        return data.salario_max >= data.salario_min;
      }
      return true;
    },
    {
      message: "Salário máximo deve ser maior ou igual ao mínimo",
      path: ["salario_max"],
    },
  );

type VagaFormSchemaType = z.infer<typeof vagaFormSchema>;

// Function type options
const tipoFuncaoOptions = [
  { value: "Programação", label: "Programação" },
  { value: "Arte 2D", label: "Arte 2D" },
  { value: "Arte 3D", label: "Arte 3D" },
  { value: "Game Design", label: "Game Design" },
  { value: "Level Design", label: "Level Design" },
  { value: "Narrative Design", label: "Narrative Design" },
  { value: "UI/UX", label: "UI/UX" },
  { value: "Audio", label: "Audio" },
  { value: "QA", label: "QA" },
  { value: "Producer", label: "Producer" },
  { value: "Marketing", label: "Marketing" },
  { value: "Community Manager", label: "Community Manager" },
  { value: "Technical Artist", label: "Technical Artist" },
  { value: "VFX", label: "VFX" },
  { value: "Animation", label: "Animation" },
];

export default function JobForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const { isLoading, isSaving, error, isAuthorized, existingJob, existingSkills, createJob, updateJob, saveDraft } =
    useJobForm(id);

  const { estados, loadingEstados, municipios, loadingMunicipios, fetchMunicipios, clearMunicipios } =
    useIBGELocations();

  const [habilidadesObrigatorias, setHabilidadesObrigatorias] = useState<string[]>([]);
  const [habilidadesDesejaveis, setHabilidadesDesejaveis] = useState<string[]>([]);
  
  // State for tracking which button is saving
  const [savingAction, setSavingAction] = useState<"draft" | "publish" | null>(null);
  
  // State for unsaved changes protection
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formSaved, setFormSaved] = useState(false);

  // Detect payment cancelled return from Stripe
  useEffect(() => {
    const payment = searchParams.get('payment');
    
    if (payment === 'cancelled') {
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
      tipo_contrato: "clt",
      remoto: "remoto",
      estado: "",
      cidade: "",
      contato_candidatura: "",
      salario_min: null,
      salario_max: null,
      mostrar_salario: false,
      descricao: "",
      tipo_publicacao: "gratuita",
      habilidades_obrigatorias: [],
      habilidades_desejaveis: [],
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

  // Block internal navigation with react-router
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && 
      !formSaved && 
      currentLocation.pathname !== nextLocation.pathname
  );

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
        tipo_funcao: existingJob.tipo_funcao || [],
        nivel: existingJob.nivel,
        tipo_contrato: existingJob.tipo_contrato,
        remoto: existingJob.remoto,
        estado: existingJob.estado || "",
        cidade: existingJob.cidade || "",
        contato_candidatura: existingJob.contato_candidatura || "",
        salario_min: existingJob.salario_min,
        salario_max: existingJob.salario_max,
        mostrar_salario: existingJob.mostrar_salario || false,
        descricao: existingJob.descricao,
        tipo_publicacao: existingJob.tipo_publicacao || "gratuita",
        habilidades_obrigatorias: [],
        habilidades_desejaveis: [],
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
  const transformFormData = (data: VagaFormSchemaType): VagaFormData => {
    return {
      titulo: data.titulo,
      tipo_funcao: data.tipo_funcao,
      nivel: data.nivel,
      tipo_contrato: data.tipo_contrato,
      remoto: data.remoto,
      estado: data.estado || null,
      cidade: data.cidade || null,
      contato_candidatura: data.contato_candidatura || null,
      salario_min: data.salario_min || null,
      salario_max: data.salario_max || null,
      mostrar_salario: data.mostrar_salario,
      descricao: data.descricao,
      tipo_publicacao: data.tipo_publicacao,
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
    setSavingAction("draft");
    try {
      await form.handleSubmit(handleSaveDraft)();
    } finally {
      setSavingAction(null);
    }
  };

  // Handler for Publish button click
  const handlePublishClick = async () => {
    // Validate required skills before form submission
    if (habilidadesObrigatorias.length === 0) {
      form.trigger(); // Trigger all validations to show errors
      toast({
        title: "Erro de validação",
        description: "Selecione pelo menos uma habilidade obrigatória.",
        variant: "destructive",
      });
      return;
    }
    
    setSavingAction("publish");
    try {
      await form.handleSubmit(onSubmit)();
    } finally {
      setSavingAction(null);
    }
  };

  // Redirect if not authorized
  if (!isLoading && !isAuthorized) {
    return <Navigate to="/studio/jobs" replace />;
  }

  // Loading state
  if (isLoading) {
    return (
      <StudioDashboardLayout>
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
      </StudioDashboardLayout>
    );
  }

  return (
    <StudioDashboardLayout>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/studio/jobs")}>
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
                          {tipoFuncaoValue.map((funcao) => (
                            <Badge
                              key={funcao}
                              variant="secondary"
                              className="bg-secondary/10 text-secondary-foreground"
                            >
                              {funcao}
                              <button
                                type="button"
                                className="ml-1 rounded-full outline-none hover:bg-secondary/20"
                                onClick={() => handleTipoFuncaoRemove(funcao)}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
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
                          >
                            <span className="text-muted-foreground">Adicionar função...</span>
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar função..." />
                            <CommandList>
                              <CommandEmpty>Nenhuma função encontrada.</CommandEmpty>
                              <CommandGroup>
                                {tipoFuncaoOptions
                                  .filter((option) => !tipoFuncaoValue.includes(option.value))
                                  .map((option) => (
                                    <CommandItem
                                      key={option.value}
                                      value={option.value}
                                      onSelect={() => handleTipoFuncaoSelect(option.value)}
                                    >
                                      {option.label}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      
                      <p className="text-xs text-muted-foreground">
                        Selecione uma ou mais funções para esta vaga
                      </p>
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

                {/* Contract Type - Full width Select dropdown */}
                <FormField
                  control={form.control}
                  name="tipo_contrato"
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
                          <SelectItem value="freelance">Freelance</SelectItem>
                          <SelectItem value="estagio">Estágio</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                        <FormLabel>Salário mínimo (R$)</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="salario_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salário máximo (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 15000"
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

                <div className="space-y-2">
                  <JobSkillsSelector
                    label={<>Habilidades obrigatórias <span className="text-destructive">*</span></>}
                    helperText="Habilidades que o candidato deve ter para a vaga."
                    selectedSkillIds={habilidadesObrigatorias}
                    onSkillsChange={setHabilidadesObrigatorias}
                    excludeSkillIds={habilidadesDesejaveis}
                  />
                  {habilidadesObrigatorias.length === 0 && form.formState.isSubmitted && (
                    <p className="text-sm font-medium text-destructive">
                      Selecione pelo menos uma habilidade obrigatória
                    </p>
                  )}
                </div>

                <JobSkillsSelector
                  label="Habilidades desejáveis (diferenciais)"
                  helperText="Habilidades que são um diferencial, mas não obrigatórias."
                  selectedSkillIds={habilidadesDesejaveis}
                  onSkillsChange={setHabilidadesDesejaveis}
                  excludeSkillIds={habilidadesObrigatorias}
                />
              </div>

              {/* SECTION: PUBLICATION TYPE */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tipo de Publicação</h3>
                <Separator />

                {existingJob?.status === 'publicada' ? (
                  // Read-only mode for published jobs
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <p className="text-sm font-medium mb-2">Tipo de Publicação</p>
                    <Badge variant={existingJob.tipo_publicacao === 'destaque' ? 'default' : 'secondary'}>
                      {existingJob.tipo_publicacao === 'destaque' 
                        ? 'Destaque (R$ 97)' 
                        : 'Gratuita'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Não é possível alterar o tipo após publicação
                    </p>
                  </div>
                ) : (
                  // Editable radio buttons
                  <FormField
                    control={form.control}
                    name="tipo_publicacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-3">
                            {/* Card Gratuita */}
                            <div 
                              className={cn(
                                "flex items-start space-x-3 p-3 rounded-md border transition-colors cursor-pointer",
                                field.value === "gratuita" 
                                  ? "border-primary bg-primary/5" 
                                  : "border-border hover:bg-muted/50"
                              )}
                              onClick={() => field.onChange("gratuita")}
                            >
                              <RadioGroupItem value="gratuita" id="pub-gratuita" className="mt-1" />
                              <Label htmlFor="pub-gratuita" className="flex-1 cursor-pointer">
                                <span className="font-medium">Gratuita</span>
                                <p className="text-sm text-muted-foreground">Visibilidade padrão na listagem de vagas</p>
                              </Label>
                            </div>
                            
                            {/* Card Destaque */}
                            <div 
                              className={cn(
                                "flex items-start space-x-3 p-3 rounded-md border transition-colors cursor-pointer",
                                field.value === "destaque" 
                                  ? "border-primary bg-primary/5" 
                                  : "border-border hover:bg-muted/50"
                              )}
                              onClick={() => field.onChange("destaque")}
                            >
                              <RadioGroupItem value="destaque" id="pub-destaque" className="mt-1" />
                              <Label htmlFor="pub-destaque" className="flex-1 cursor-pointer">
                                <span className="font-medium flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-primary" />
                                  Destaque (R$ 97)
                                </span>
                                <p className="text-sm text-muted-foreground">
                                  Topo da lista por 30 dias + badge de destaque
                                </p>
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => navigate("/studio/jobs")}>
                  Cancelar
                </Button>

                {/* Save Draft button - only for new jobs or drafts */}
                {(!isEditing || existingJob?.status === 'rascunho') && (
                  <Button 
                    type="button" 
                    variant="ghost"
                    disabled={isSaving}
                    onClick={handleSaveDraftClick}
                  >
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
                
                <Button 
                  type="button" 
                  disabled={isSaving}
                  onClick={handlePublishClick}
                >
                  {savingAction === "publish" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {form.getValues("tipo_publicacao") === "destaque" && !isEditing
                        ? "Processando..." 
                        : "Salvando..."}
                    </>
                  ) : isEditing && existingJob?.status === 'publicada' ? (
                    "Salvar Alterações"
                  ) : form.getValues("tipo_publicacao") === "destaque" ? (
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
      <AlertDialog open={blocker.state === "blocked"}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Deseja realmente sair sem salvar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>
              Continuar editando
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => blocker.proceed?.()}>
              Descartar e sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StudioDashboardLayout>
  );
}
