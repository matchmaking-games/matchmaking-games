import { useEffect, useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { generateSlug } from "@/lib/formatters";
import { supabase } from "@/integrations/supabase/client";
import type { Project, ProjectInsert, ProjectUpdate } from "@/hooks/useProjects";

// Schema with corrected URL validation (accepts empty string OR valid URL)
const projectSchema = z.object({
  titulo: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(100, "Máximo 100 caracteres"),
  slug: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(100, "Máximo 100 caracteres"),
  tipo: z.enum(["profissional", "pessoal", "game_jam", "open_source"]),
  papel: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  descricao_curta: z
    .string()
    .max(200, "Máximo 200 caracteres")
    .optional()
    .or(z.literal("")),
  status: z.enum(["publicado", "em_desenvolvimento", "arquivado"]),
  demo_url: z.union([z.literal(""), z.string().url("URL inválida")]).optional(),
  video_url: z
    .union([z.literal(""), z.string().url("URL inválida")])
    .optional(),
  codigo_url: z
    .union([z.literal(""), z.string().url("URL inválida")])
    .optional(),
  destaque: z.boolean().default(false),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProject: Project | null;
  onSuccess: () => void;
  createProject: (
    data: Omit<ProjectInsert, "user_id" | "ordem">
  ) => Promise<Project>;
  updateProject: (id: string, data: ProjectUpdate) => Promise<Project>;
}

// Simple debounce function
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
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
}: ProjectFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousGeneratedSlug, setPreviousGeneratedSlug] = useState("");
  const [userSlug, setUserSlug] = useState<string | null>(null);

  // Fetch user slug for preview
  useEffect(() => {
    const fetchUserSlug = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("slug")
          .eq("id", user.id)
          .single();
        if (data) setUserSlug(data.slug);
      }
    };
    fetchUserSlug();
  }, []);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      titulo: "",
      slug: "",
      tipo: "profissional",
      papel: "",
      descricao_curta: "",
      status: "em_desenvolvimento",
      demo_url: "",
      video_url: "",
      codigo_url: "",
      destaque: false,
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
          descricao_curta: editingProject.descricao_curta ?? "",
          status: editingProject.status,
          demo_url: editingProject.demo_url ?? "",
          video_url: editingProject.video_url ?? "",
          codigo_url: editingProject.codigo_url ?? "",
          destaque: editingProject.destaque ?? false,
        });
        setPreviousGeneratedSlug(editingProject.slug ?? "");
      } else {
        form.reset({
          titulo: "",
          slug: "",
          tipo: "profissional",
          papel: "",
          descricao_curta: "",
          status: "em_desenvolvimento",
          demo_url: "",
          video_url: "",
          codigo_url: "",
          destaque: false,
        });
        setPreviousGeneratedSlug("");
      }
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
    [previousGeneratedSlug, form]
  );

  const handleTituloChange = useCallback(
    (value: string, onChange: (value: string) => void) => {
      onChange(value);
      debouncedGenerateSlug(value);
    },
    [debouncedGenerateSlug]
  );

  const onSubmit = async (values: ProjectFormValues) => {
    setIsSubmitting(true);

    try {
      if (editingProject) {
        await updateProject(editingProject.id, {
          titulo: values.titulo,
          slug: values.slug,
          tipo: values.tipo,
          papel: values.papel || null,
          descricao_curta: values.descricao_curta || null,
          status: values.status,
          demo_url: values.demo_url || null,
          video_url: values.video_url || null,
          codigo_url: values.codigo_url || null,
          destaque: values.destaque,
        });
        toast({ title: "Projeto atualizado com sucesso!" });
      } else {
        await createProject({
          titulo: values.titulo,
          slug: values.slug,
          tipo: values.tipo,
          papel: values.papel || null,
          descricao_curta: values.descricao_curta || null,
          status: values.status,
          demo_url: values.demo_url || null,
          video_url: values.video_url || null,
          codigo_url: values.codigo_url || null,
          destaque: values.destaque,
        });
        toast({ title: "Projeto criado com sucesso!" });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: editingProject
          ? "Erro ao atualizar projeto"
          : "Erro ao criar projeto",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const descricaoCurtaValue = form.watch("descricao_curta") || "";
  const slugValue = form.watch("slug");
  const destaqueValue = form.watch("destaque");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] w-[95vw] max-w-[95vw] sm:w-auto">
        <DialogHeader>
          <DialogTitle>
            {editingProject ? "Editar Projeto" : "Novo Projeto"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      onChange={(e) =>
                        handleTituloChange(e.target.value, field.onChange)
                      }
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
                    <Input
                      placeholder="space-shooter-indie"
                      maxLength={100}
                      {...field}
                    />
                  </FormControl>
                  {slugValue && userSlug && (
                    <p className="text-xs text-muted-foreground">
                      matchmaking.games/profile/{userSlug}#{slugValue}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="profissional">
                          Profissional
                        </SelectItem>
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
                      <Input
                        placeholder="Ex: Lead Programmer"
                        maxLength={100}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Short Description */}
            <FormField
              control={form.control}
              name="descricao_curta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição curta</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Jogo de nave arcade com mecânicas roguelike..."
                      className="resize-none"
                      rows={3}
                      maxLength={200}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between">
                    <FormMessage />
                    <span className="text-xs text-muted-foreground">
                      {descricaoCurtaValue.length}/200 caracteres
                    </span>
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
                        <RadioGroupItem value="publicado" id="publicado" />
                        <Label htmlFor="publicado" className="font-normal">
                          Publicado
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="em_desenvolvimento"
                          id="em_desenvolvimento"
                        />
                        <Label
                          htmlFor="em_desenvolvimento"
                          className="font-normal"
                        >
                          Em desenvolvimento
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="arquivado" id="arquivado" />
                        <Label htmlFor="arquivado" className="font-normal">
                          Arquivado
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

            {/* TODO TASK-318: Add skills selection field here */}
            {/* The field will allow selecting multiple skills from habilidades table */}
            {/* and save to projeto_habilidades table */}

            {/* Highlight checkbox */}
            <FormField
              control={form.control}
              name="destaque"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="flex items-center gap-2">
                      <Star
                        className={`h-4 w-4 ${
                          destaqueValue
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                      Destacar no topo do portfólio
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Projetos destacados aparecem primeiro na sua página
                      pública
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
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
