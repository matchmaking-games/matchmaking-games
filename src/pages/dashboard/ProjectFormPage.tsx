import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Star } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { generateSlug } from "@/lib/formatters";
import { supabase } from "@/integrations/supabase/client";
import { ProjectImageUpload } from "@/components/projects/ProjectImageUpload";
import { ProjectSkillsSelect } from "@/components/projects/ProjectSkillsSelect";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { useProjects, type ProjectWithSkills } from "@/hooks/useProjects";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { ENGINE_LABELS, PLATAFORMA_LABELS, GENERO_LABELS } from "@/constants/project-labels";

// Fix 8: added "pausado" to status enum
const projectSchema = z.object({
  titulo: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  slug: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  tipo: z.enum(["profissional", "pessoal", "game_jam", "open_source", "jogo"]),
  papel: z.string().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
  descricao: z.string().max(300, "Máximo 300 caracteres").optional().or(z.literal("")),
  status: z.enum(["em_andamento", "concluido", "pausado"]),
  demo_url: z.union([z.literal(""), z.string().url("URL inválida")]).optional(),
  codigo_url: z.union([z.literal(""), z.string().url("URL inválida")]).optional(),
  destaque: z.boolean().default(false),
  imagem_capa_url: z.string().url().nullable().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export default function ProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { projects, loading, createProject, updateProject, saveProjectSkills } = useProjects();

  const isEditing = Boolean(id);
  const editingProject = useMemo<ProjectWithSkills | null>(() => {
    if (!id) return null;
    return projects.find((p) => p.id === id) ?? null;
  }, [id, projects]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousGeneratedSlug, setPreviousGeneratedSlug] = useState("");
  const [userSlug, setUserSlug] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const tempProjectIdRef = useRef<string | null>(null);
  const [richContent, setRichContent] = useState<string | null>(null);
  // Fix 6: track rich content dirty state
  const [richContentDirty, setRichContentDirty] = useState(false);

  // Fetch user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase.from("users").select("slug").eq("id", user.id).single();
        if (data) setUserSlug(data.slug);
      }
    };
    fetchUserInfo();
  }, []);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      titulo: "",
      slug: "",
      tipo: "profissional",
      papel: "",
      descricao: "",
      status: "em_andamento",
      demo_url: "",
      codigo_url: "",
      destaque: false,
      imagem_capa_url: null,
    },
  });

  // Populate form when editing project loads
  useEffect(() => {
    if (editingProject) {
      form.reset({
        titulo: editingProject.titulo,
        slug: editingProject.slug ?? "",
        tipo: editingProject.tipo,
        papel: editingProject.papel ?? "",
        descricao: editingProject.descricao ?? "",
        status: editingProject.status,
        demo_url: editingProject.demo_url ?? "",
        codigo_url: editingProject.codigo_url ?? "",
        destaque: editingProject.destaque ?? false,
        imagem_capa_url: editingProject.imagem_capa_url ?? null,
      });
      setPreviousGeneratedSlug(editingProject.slug ?? "");
      const skillIds = editingProject.projeto_habilidades?.map((ph) => ph.habilidade_id) || [];
      setSelectedSkillIds(skillIds);
      setRichContent(editingProject.descricao_rich ? JSON.stringify(editingProject.descricao_rich) : null);
      setRichContentDirty(false);
    }
  }, [editingProject, form]);

  // Debounced slug generation
  const debouncedGenerateSlug = useMemo(
    () =>
      debounce((titulo: string) => {
        const currentSlug = form.getValues("slug");
        if (!currentSlug || currentSlug === previousGeneratedSlug) {
          const newSlug = generateSlug(titulo);
          form.setValue("slug", newSlug);
          setPreviousGeneratedSlug(newSlug);
        }
      }, 300),
    [previousGeneratedSlug, form],
  );

  const handleTituloChange = useCallback(
    (value: string, onChange: (value: string) => void) => {
      onChange(value);
      debouncedGenerateSlug(value);
    },
    [debouncedGenerateSlug],
  );

  const handleImageUploaded = useCallback(
    (url: string | null, usedProjectId: string) => {
      form.setValue("imagem_capa_url", url);
      if (!editingProject) {
        tempProjectIdRef.current = usedProjectId;
      }
    },
    [editingProject, form],
  );

  // Fix 6: unsaved changes warning
  const handleNavigateBack = useCallback(() => {
    const isDirty = form.formState.isDirty || richContentDirty;
    if (isDirty) {
      const confirmed = window.confirm(
        "Você tem alterações não salvas. Se sair agora, elas serão perdidas. Deseja continuar?",
      );
      if (!confirmed) return;
    }
    navigate("/dashboard/profile/projects");
  }, [form.formState.isDirty, richContentDirty, navigate]);

  const onSubmit = async (values: ProjectFormValues) => {
    // Fix 4: validate rich content is not empty
    if (!richContent || richContent === JSON.stringify([{ type: "paragraph", content: [] }])) {
      toast({
        title: "Descrição obrigatória",
        description: "Escreva a descrição do projeto antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const projectData = {
        titulo: values.titulo,
        slug: values.slug,
        tipo: values.tipo,
        papel: values.papel || null,
        descricao: values.descricao || null,
        descricao_rich: richContent ? (JSON.parse(richContent) as import("@/integrations/supabase/types").Json) : null,
        status: values.status,
        demo_url: values.demo_url || null,
        codigo_url: values.codigo_url || null,
        destaque: values.destaque,
        imagem_capa_url: values.imagem_capa_url || null,
      };

      let project: ProjectWithSkills;

      if (editingProject) {
        project = (await updateProject(editingProject.id, projectData)) as ProjectWithSkills;
      } else {
        const createData = tempProjectIdRef.current ? { ...projectData, id: tempProjectIdRef.current } : projectData;
        project = (await createProject(createData)) as ProjectWithSkills;
      }

      if (saveProjectSkills) {
        await saveProjectSkills(project.id, selectedSkillIds);
      }

      toast({ title: editingProject ? "Projeto atualizado com sucesso!" : "Projeto criado com sucesso!" });
      // Fix 6: reset dirty states before navigating
      setRichContentDirty(false);
      form.reset(values);
      navigate("/dashboard/profile/projects");
    } catch {
      toast({
        title: editingProject ? "Erro ao atualizar projeto" : "Erro ao criar projeto",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const descricaoValue = form.watch("descricao") || "";
  const slugValue = form.watch("slug");
  const destaqueValue = form.watch("destaque");
  const imagemCapaUrl = form.watch("imagem_capa_url");

  // Show not found if editing but project not found after loading
  if (isEditing && !loading && !editingProject) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {/* Fix 6: use handleNavigateBack */}
          <Button variant="ghost" onClick={handleNavigateBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para projetos
          </Button>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Projeto não encontrado.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Fix 6: use handleNavigateBack */}
        <Button variant="ghost" onClick={handleNavigateBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para projetos
        </Button>

        <Form {...form}>
          {/* Fix 1: Card wraps both form and editor separately */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl">{isEditing ? "Editar Projeto" : "Novo Projeto"}</CardTitle>
            </CardHeader>

            {/* Form fields inside <form> */}
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Título <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Space Shooter Indie"
                          maxLength={100}
                          {...field}
                          onChange={(e) => handleTituloChange(e.target.value, field.onChange)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Slug — Fix 5: corrected URL preview */}
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Slug <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="space-shooter-indie" maxLength={100} {...field} />
                      </FormControl>
                      {slugValue && userSlug && (
                        <p className="text-xs text-muted-foreground break-all">
                          matchmaking.games/p/{userSlug}/project/{slugValue}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cover Image Upload */}
                {userId && (
                  <ProjectImageUpload
                    userId={userId}
                    projectId={editingProject?.id || null}
                    currentImageUrl={imagemCapaUrl ?? null}
                    onImageUploaded={handleImageUploaded}
                    disabled={isSubmitting}
                  />
                )}

                {/* Type and Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tipo <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="profissional">Profissional</SelectItem>
                            <SelectItem value="pessoal">Pessoal</SelectItem>
                            <SelectItem value="game_jam">Game Jam</SelectItem>
                            <SelectItem value="open_source">Open Source</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="papel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu papel</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Lead Programmer" maxLength={100} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição breve</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Jogo de nave arcade com mecânicas roguelike..."
                          className="resize-none"
                          rows={3}
                          maxLength={300}
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between">
                        <FormMessage />
                        <span className="text-xs text-muted-foreground">
                          {descricaoValue.length}/300 caracteres. Aparece nos cards de projeto.
                        </span>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Status — Fix 8: added "Pausado" option */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Status <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col sm:flex-row gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="em_andamento" id="em_andamento" />
                            <Label htmlFor="em_andamento" className="font-normal">
                              Em desenvolvimento
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="concluido" id="concluido" />
                            <Label htmlFor="concluido" className="font-normal">
                              Concluído
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pausado" id="pausado" />
                            <Label htmlFor="pausado" className="font-normal">
                              Pausado
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Links */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">Links</h4>

                  <FormField
                    control={form.control}
                    name="demo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Demo / Jogo</FormLabel>
                        <FormControl>
                          <Input placeholder="https://itch.io/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="codigo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Skills — Fix 7: maxSkills 20 */}
                <ProjectSkillsSelect
                  selectedSkillIds={selectedSkillIds}
                  onSkillsChange={setSelectedSkillIds}
                  disabled={isSubmitting}
                />

                {/* Highlight */}
                <FormField
                  control={form.control}
                  name="destaque"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center gap-2">
                          <Star
                            className={`h-4 w-4 ${
                              destaqueValue ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            }`}
                          />
                          Destacar no topo do portfólio
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Projetos destacados aparecem primeiro na sua página pública
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </form>

            {/* Fix 1+2+3: Rich Text Editor OUTSIDE <form>, at the end, no border */}
            <CardContent className="space-y-2">
              <Label>
                Descrição do Projeto <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Descreva o projeto com detalhes. Suporta texto formatado, listas, imagens e vídeos do YouTube.
              </p>
              <div className="min-h-[300px]">
                <RichTextEditor
                  initialContent={richContent ?? undefined}
                  onChange={(json) => {
                    setRichContent(json);
                    setRichContentDirty(true);
                  }}
                />
              </div>
            </CardContent>

            {/* Fix 1: buttons outside form, Salvar uses onClick */}
            <CardFooter className="flex flex-col sm:flex-row gap-2 justify-end border-t pt-6">
              <Button type="button" variant="ghost" onClick={handleNavigateBack} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={() => form.handleSubmit(onSubmit)()}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : isEditing ? (
                  "Salvar Alterações"
                ) : (
                  "Salvar Projeto"
                )}
              </Button>
            </CardFooter>
          </Card>
        </Form>
      </div>
    </DashboardLayout>
  );
}
