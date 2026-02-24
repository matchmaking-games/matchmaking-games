import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { ProjectImageUpload } from "./ProjectImageUpload";
import { ProjectSkillsSelect } from "./ProjectSkillsSelect";
import type { ProjectWithSkills, ProjectInsert, ProjectUpdate } from "@/hooks/useProjects";

// Schema with corrected URL validation (accepts empty string OR valid URL)
const projectSchema = z.object({
  titulo: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  slug: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  tipo: z.enum(["profissional", "pessoal", "game_jam", "open_source"]),
  papel: z.string().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
  descricao: z.string().max(1000, "Máximo 1000 caracteres").optional().or(z.literal("")),
  status: z.enum(["em_andamento", "concluido", "pausado"]),
  demo_url: z.union([z.literal(""), z.string().url("URL inválida")]).optional(),
  video_url: z.union([z.literal(""), z.string().url("URL inválida")]).optional(),
  codigo_url: z.union([z.literal(""), z.string().url("URL inválida")]).optional(),
  destaque: z.boolean().default(false),
  imagem_capa_url: z.string().url().nullable().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProject: ProjectWithSkills | null;
  onSuccess: () => void;
  createProject: (data: Omit<ProjectInsert, "user_id" | "ordem"> & { id?: string }) => Promise<ProjectWithSkills>;
  updateProject: (id: string, data: ProjectUpdate) => Promise<ProjectWithSkills>;
  saveProjectSkills?: (projectId: string, skillIds: string[]) => Promise<void>;
}

// Simple debounce function
function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function ProjectForm({
  open,
  onOpenChange,
  editingProject,
  onSuccess,
  createProject,
  updateProject,
  saveProjectSkills,
}: ProjectFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousGeneratedSlug, setPreviousGeneratedSlug] = useState("");
  const [userSlug, setUserSlug] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // State for skills and temp project ID
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const tempProjectIdRef = useRef<string | null>(null);

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
      video_url: "",
      codigo_url: "",
      destaque: false,
      imagem_capa_url: null,
    },
  });

  // Reset form when opening/closing or changing project
  useEffect(() => {
    if (open) {
      if (editingProject) {
        form.reset({
          titulo: editingProject.titulo,
          slug: editingProject.slug ?? "",
          tipo: editingProject.tipo,
          papel: editingProject.papel ?? "",
          descricao: editingProject.descricao ?? "",
          status: editingProject.status,
          demo_url: editingProject.demo_url ?? "",
          video_url: editingProject.video_url ?? "",
          codigo_url: editingProject.codigo_url ?? "",
          destaque: editingProject.destaque ?? false,
          imagem_capa_url: editingProject.imagem_capa_url ?? null,
        });
        setPreviousGeneratedSlug(editingProject.slug ?? "");
        // Load existing skills
        const skillIds = editingProject.projeto_habilidades?.map((ph) => ph.habilidade_id) || [];
        setSelectedSkillIds(skillIds);
      } else {
        form.reset({
          titulo: "",
          slug: "",
          tipo: "profissional",
          papel: "",
          descricao: "",
          status: "em_andamento",
          demo_url: "",
          video_url: "",
          codigo_url: "",
          destaque: false,
          imagem_capa_url: null,
        });
        setPreviousGeneratedSlug("");
        setSelectedSkillIds([]);
      }
      // Reset temp project ID when modal opens
      tempProjectIdRef.current = null;
    }
  }, [open, editingProject, form]);

  // Debounced slug generation
  const debouncedGenerateSlug = useMemo(
    () =>
      debounce((titulo: string) => {
        const currentSlug = form.getValues("slug");

        // Only generate if empty or equals previous generated
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
      // Store the project ID used for upload (for new projects)
      if (!editingProject) {
        tempProjectIdRef.current = usedProjectId;
      }
    },
    [editingProject, form],
  );

  const onSubmit = async (values: ProjectFormValues) => {
    setIsSubmitting(true);

    try {
      let project: ProjectWithSkills;

      const projectData = {
        titulo: values.titulo,
        slug: values.slug,
        tipo: values.tipo,
        papel: values.papel || null,
        descricao: values.descricao || null,
        status: values.status,
        demo_url: values.demo_url || null,
        video_url: values.video_url || null,
        codigo_url: values.codigo_url || null,
        destaque: values.destaque,
        imagem_capa_url: values.imagem_capa_url || null,
      };

      if (editingProject) {
        project = await updateProject(editingProject.id, projectData);
      } else {
        // Use temp project ID if image was uploaded
        const createData = tempProjectIdRef.current ? { ...projectData, id: tempProjectIdRef.current } : projectData;
        project = await createProject(createData);
      }

      // Save skills if function is available
      if (saveProjectSkills) {
        await saveProjectSkills(project.id, selectedSkillIds);
      }

      toast({ title: editingProject ? "Projeto atualizado com sucesso!" : "Projeto criado com sucesso!" });
      onSuccess();
    } catch (error) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-[750px] p-0 flex flex-col h-[90dvh] sm:h-[85vh] overflow-hidden">
        <DialogHeader className="p-6 pb-4 shrink-0">
          <DialogTitle>{editingProject ? "Editar Projeto" : "Novo Projeto"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <ScrollArea type="always" className="flex-1 min-h-0">
              <div className="space-y-4 px-6 pb-6 pr-8">
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

                {/* Slug */}
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
                        <p className="text-xs text-muted-foreground">
                          matchmaking.games/p/{userSlug}#{slugValue}
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

                {/* Type and Role in 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Type */}
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

                  {/* Role */}
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
                          rows={4}
                          maxLength={1000}
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between">
                        <FormMessage />
                        <span className="text-xs text-muted-foreground">{descricaoValue.length}/1000 caracteres</span>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Status */}
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
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Links section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">Links</h4>

                  {/* Demo URL */}
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

                  {/* Video URL */}
                  <FormField
                    control={form.control}
                    name="video_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vídeo</FormLabel>
                        <FormControl>
                          <Input placeholder="https://youtube.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Code URL */}
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

                {/* Skills Selection */}
                <ProjectSkillsSelect
                  selectedSkillIds={selectedSkillIds}
                  onSkillsChange={setSelectedSkillIds}
                  disabled={isSubmitting}
                />

                {/* Highlight checkbox */}
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
              </div>
            </ScrollArea>

            <DialogFooter className="flex-col sm:flex-row gap-2 border-t p-6 pt-4 shrink-0">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : editingProject ? (
                  "Salvar Alterações"
                ) : (
                  "Salvar Projeto"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
