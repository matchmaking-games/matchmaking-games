import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
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
import { JobSkillsSelector } from "@/components/studio/JobSkillsSelector";
import { useJobForm, type VagaFormData } from "@/hooks/useJobForm";
import { useIBGELocations } from "@/hooks/useIBGELocations";
import { cn } from "@/lib/utils";

// Form schema with Zod
const vagaFormSchema = z
  .object({
    titulo: z
      .string()
      .min(5, "Mínimo 5 caracteres")
      .max(100, "Máximo 100 caracteres"),
    tipo_funcao: z.array(z.string()).min(1, "Selecione pelo menos um tipo de função"),
    nivel: z.enum(["iniciante", "junior", "pleno", "senior", "lead"]),
    tipo_contrato: z.enum(["clt", "pj", "freelance", "estagio"]),
    remoto: z.enum(["presencial", "hibrido", "remoto"]),
    estado: z.string().optional(),
    cidade: z.string().optional(),
    contato_candidatura: z
      .string()
      .max(500, "Máximo 500 caracteres")
      .optional()
      .nullable(),
    salario_min: z.number().positive().nullable().optional(),
    salario_max: z.number().positive().nullable().optional(),
    mostrar_salario: z.boolean().default(false),
    descricao: z
      .string()
      .min(100, "Mínimo 100 caracteres")
      .max(10000, "Máximo 10.000 caracteres"),
    tipo_publicacao: z.enum(["gratuita", "destaque"]).default("gratuita"),
    habilidades_obrigatorias: z.array(z.string()).default([]),
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
    }
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
  const isEditing = !!id;

  const {
    isLoading,
    isSaving,
    error,
    isAuthorized,
    existingJob,
    existingSkills,
    createJob,
    updateJob,
  } = useJobForm(id);

  const {
    estados,
    loadingEstados,
    municipios,
    loadingMunicipios,
    fetchMunicipios,
    clearMunicipios,
  } = useIBGELocations();

  const [habilidadesObrigatorias, setHabilidadesObrigatorias] = useState<string[]>([]);
  const [habilidadesDesejaveis, setHabilidadesDesejaveis] = useState<string[]>([]);

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

  const descricao = form.watch("descricao") || "";
  const charCount = descricao.length;
  const isValidLength = charCount >= 100 && charCount <= 10000;
  const isTooShort = charCount > 0 && charCount < 100;

  const selectedEstado = form.watch("estado");
  const tipoFuncaoValue = form.watch("tipo_funcao") || [];

  // Load existing job data into form
  useEffect(() => {
    if (existingJob) {
      // Parse location into estado/cidade
      let estado = "";
      let cidade = "";
      if (existingJob.localizacao) {
        const parts = existingJob.localizacao.split(", ");
        if (parts.length === 2) {
          cidade = parts[0];
          estado = parts[1];
        }
      }

      form.reset({
        titulo: existingJob.titulo,
        tipo_funcao: existingJob.tipo_funcao || [],
        nivel: existingJob.nivel,
        tipo_contrato: existingJob.tipo_contrato,
        remoto: existingJob.remoto,
        estado,
        cidade,
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
      if (estado) {
        fetchMunicipios(estado);
      }
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

  // Handle tipo_funcao checkbox toggle
  const handleTipoFuncaoToggle = (value: string, checked: boolean) => {
    const current = tipoFuncaoValue;
    if (checked) {
      form.setValue("tipo_funcao", [...current, value]);
    } else {
      form.setValue(
        "tipo_funcao",
        current.filter((v) => v !== value)
      );
    }
  };

  // Handle form submission
  const onSubmit = async (data: VagaFormSchemaType) => {
    // Transform estado/cidade into localizacao
    const localizacao =
      data.estado && data.cidade ? `${data.cidade}, ${data.estado}` : null;

    const formData: VagaFormData = {
      titulo: data.titulo,
      tipo_funcao: data.tipo_funcao,
      nivel: data.nivel,
      tipo_contrato: data.tipo_contrato,
      remoto: data.remoto,
      localizacao,
      contato_candidatura: data.contato_candidatura || null,
      salario_min: data.salario_min || null,
      salario_max: data.salario_max || null,
      mostrar_salario: data.mostrar_salario,
      descricao: data.descricao,
      tipo_publicacao: data.tipo_publicacao,
      habilidades_obrigatorias: habilidadesObrigatorias,
      habilidades_desejaveis: habilidadesDesejaveis,
    };

    if (isEditing && id) {
      await updateJob(id, formData);
    } else {
      await createJob(formData);
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/studio/jobs")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="font-display text-2xl">
              {isEditing ? "Editar Vaga" : "Criar Nova Vaga"}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                        <Input
                          placeholder="Ex: Senior Unity Developer"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Function Type - Checkboxes */}
                <FormField
                  control={form.control}
                  name="tipo_funcao"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Tipo de função <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {tipoFuncaoOptions.map((option) => (
                          <div
                            key={option.value}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`funcao-${option.value}`}
                              checked={tipoFuncaoValue.includes(option.value)}
                              onCheckedChange={(checked) =>
                                handleTipoFuncaoToggle(option.value, !!checked)
                              }
                            />
                            <Label
                              htmlFor={`funcao-${option.value}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Level */}
                <FormField
                  control={form.control}
                  name="nivel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nível <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          {[
                            { value: "iniciante", label: "Iniciante" },
                            { value: "junior", label: "Júnior" },
                            { value: "pleno", label: "Pleno" },
                            { value: "senior", label: "Sênior" },
                            { value: "lead", label: "Lead" },
                          ].map((item) => (
                            <div
                              key={item.value}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={item.value}
                                id={`nivel-${item.value}`}
                              />
                              <Label
                                htmlFor={`nivel-${item.value}`}
                                className="font-normal cursor-pointer"
                              >
                                {item.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contract Type */}
                <FormField
                  control={form.control}
                  name="tipo_contrato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tipo de contrato <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          {[
                            { value: "clt", label: "CLT" },
                            { value: "pj", label: "PJ" },
                            { value: "freelance", label: "Freelance" },
                            { value: "estagio", label: "Estágio" },
                          ].map((item) => (
                            <div
                              key={item.value}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={item.value}
                                id={`contrato-${item.value}`}
                              />
                              <Label
                                htmlFor={`contrato-${item.value}`}
                                className="font-normal cursor-pointer"
                              >
                                {item.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Work Model */}
                <FormField
                  control={form.control}
                  name="remoto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Modelo de trabalho <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          {[
                            { value: "presencial", label: "Presencial" },
                            { value: "hibrido", label: "Híbrido" },
                            { value: "remoto", label: "Remoto" },
                          ].map((item) => (
                            <div
                              key={item.value}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={item.value}
                                id={`remoto-${item.value}`}
                              />
                              <Label
                                htmlFor={`remoto-${item.value}`}
                                className="font-normal cursor-pointer"
                              >
                                {item.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location - State/City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select
                          onValueChange={handleEstadoChange}
                          value={field.value}
                          disabled={loadingEstados}
                        >
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
                        <p className="text-xs text-muted-foreground">
                          Deixe em branco se a vaga for 100% remota
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Contact for applications */}
                <FormField
                  control={form.control}
                  name="contato_candidatura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Como candidatos devem entrar em contato?</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: vagas@estudio.com ou https://estudio.com/vagas"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Informe um email, link de formulário ou instruções de como se candidatar a esta vaga.
                      </p>
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
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
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
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
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
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Exibir faixa salarial publicamente
                      </FormLabel>
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
                          !isTooShort && !isValidLength && "text-muted-foreground"
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

                <JobSkillsSelector
                  label="Habilidades obrigatórias"
                  helperText="Habilidades que o candidato deve ter para a vaga."
                  selectedSkillIds={habilidadesObrigatorias}
                  onSkillsChange={setHabilidadesObrigatorias}
                  excludeSkillIds={habilidadesDesejaveis}
                />

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

                <FormField
                  control={form.control}
                  name="tipo_publicacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="space-y-3"
                        >
                          <div className="flex items-start space-x-3 p-3 rounded-md border border-border hover:bg-muted/50 transition-colors">
                            <RadioGroupItem
                              value="gratuita"
                              id="pub-gratuita"
                              className="mt-1"
                            />
                            <Label
                              htmlFor="pub-gratuita"
                              className="flex-1 cursor-pointer"
                            >
                              <span className="font-medium">Gratuita</span>
                              <p className="text-sm text-muted-foreground">
                                Visibilidade padrão na listagem de vagas
                              </p>
                            </Label>
                          </div>
                          <div className="flex items-start space-x-3 p-3 rounded-md border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                            <RadioGroupItem
                              value="destaque"
                              id="pub-destaque"
                              className="mt-1"
                            />
                            <Label
                              htmlFor="pub-destaque"
                              className="flex-1 cursor-pointer"
                            >
                              <span className="font-medium flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-amber-500" />
                                Destaque (R$ 199)
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
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/studio/jobs")}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : isEditing ? (
                    "Salvar Alterações"
                  ) : (
                    "Publicar Vaga"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </StudioDashboardLayout>
  );
}
