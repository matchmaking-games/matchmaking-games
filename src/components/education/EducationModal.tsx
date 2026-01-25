import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEducations, type Education } from "@/hooks/useEducations";
import { MonthYearPicker } from "@/components/experience/MonthYearPicker";

// Zod validation schema
const educationSchema = z.object({
  instituicao: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(200, "Máximo 200 caracteres"),
  tipo: z.enum(["graduacao", "pos", "tecnico", "curso", "certificacao"], {
    required_error: "Selecione o tipo de educação",
  }),
  titulo: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(200, "Máximo 200 caracteres"),
  area: z.string().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
  inicio: z.string().optional().or(z.literal("")),
  fim: z.string().optional().or(z.literal("")),
  concluido: z.boolean().default(false),
  descricao: z.string().max(1000, "Máximo 1000 caracteres").optional().or(z.literal("")),
  credencial_url: z
    .string()
    .url("URL inválida")
    .optional()
    .or(z.literal("")),
}).refine((data) => {
  // End date must be >= start date if both are set
  if (data.fim && data.inicio && data.inicio > data.fim) {
    return false;
  }
  return true;
}, {
  message: "Data de conclusão deve ser igual ou posterior ao início",
  path: ["fim"],
});

type EducationFormData = z.infer<typeof educationSchema>;

const tipoEducacaoOptions = [
  { value: "graduacao", label: "Graduação" },
  { value: "pos", label: "Pós-graduação" },
  { value: "tecnico", label: "Técnico" },
  { value: "curso", label: "Curso" },
  { value: "certificacao", label: "Certificação" },
];

interface EducationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEducation: Education | null;
  onSuccess: () => void;
}

export function EducationModal({
  open,
  onOpenChange,
  editingEducation,
  onSuccess,
}: EducationModalProps) {
  const { toast } = useToast();
  const { addEducation, updateEducation } = useEducations();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!editingEducation;

  const form = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      instituicao: "",
      tipo: "graduacao",
      titulo: "",
      area: "",
      inicio: "",
      fim: "",
      concluido: false,
      descricao: "",
      credencial_url: "",
    },
  });

  const descricao = form.watch("descricao") || "";
  const concluido = form.watch("concluido");

  // Clear end date when "concluido" is unchecked
  useEffect(() => {
    if (!concluido) {
      form.setValue("fim", "");
    }
  }, [concluido, form]);

  // Reset form when modal opens/closes or when editing education changes
  useEffect(() => {
    if (open) {
      if (editingEducation) {
        // Populate form with existing data
        form.reset({
          instituicao: editingEducation.instituicao,
          tipo: editingEducation.tipo as EducationFormData["tipo"],
          titulo: editingEducation.titulo,
          area: editingEducation.area || "",
          inicio: editingEducation.inicio?.substring(0, 7) || "",
          fim: editingEducation.fim?.substring(0, 7) || "",
          concluido: editingEducation.concluido || false,
          descricao: editingEducation.descricao || "",
          credencial_url: editingEducation.credencial_url || "",
        });
      } else {
        // Reset to defaults for new education
        form.reset({
          instituicao: "",
          tipo: "graduacao",
          titulo: "",
          area: "",
          inicio: "",
          fim: "",
          concluido: false,
          descricao: "",
          credencial_url: "",
        });
      }
    }
  }, [open, editingEducation, form]);

  const onSubmit = async (data: EducationFormData) => {
    try {
      setIsSubmitting(true);

      // Convert dates to YYYY-MM-DD format (first day of month)
      const inicioDate = data.inicio ? `${data.inicio}-01` : null;
      const fimDate = data.fim ? `${data.fim}-01` : null;

      const educationData = {
        instituicao: data.instituicao,
        tipo: data.tipo,
        titulo: data.titulo,
        area: data.area || null,
        inicio: inicioDate,
        fim: fimDate,
        concluido: data.concluido,
        descricao: data.descricao || null,
        credencial_url: data.credencial_url || null,
      };

      if (isEditing) {
        await updateEducation(editingEducation.id, educationData);
        toast({
          title: "Educação atualizada",
          description: "Suas alterações foram salvas com sucesso.",
        });
      } else {
        await addEducation(educationData);
        toast({
          title: "Educação adicionada",
          description: "Nova formação acadêmica adicionada com sucesso.",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving education:", error);
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar a educação.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current month in YYYY-MM format for max date validation
  const currentMonth = new Date().toISOString().substring(0, 7);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-w-[95vw] sm:w-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? "Editar Educação" : "Adicionar Educação"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Institution */}
            <FormField
              control={form.control}
              name="instituicao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Instituição de ensino <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Universidade de São Paulo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Education Type */}
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
                      {tipoEducacaoOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Título ou nome do curso <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Ciência da Computação"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Area of Study */}
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área de estudo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Desenvolvimento de Jogos"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="inicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de início</FormLabel>
                    <FormControl>
                      <MonthYearPicker
                        value={field.value}
                        onChange={field.onChange}
                        maxDate={currentMonth}
                        placeholder="Selecione a data"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {concluido ? (
                <FormField
                  control={form.control}
                  name="fim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de conclusão</FormLabel>
                      <FormControl>
                        <MonthYearPicker
                          value={field.value}
                          onChange={field.onChange}
                          maxDate={currentMonth}
                          placeholder="Selecione a data"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="hidden sm:block" aria-hidden="true" />
              )}
            </div>

            {/* Completed Checkbox */}
            <FormField
              control={form.control}
              name="concluido"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Curso concluído
                  </FormLabel>
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva as principais matérias, projetos ou conquistas..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground text-right">
                    {descricao.length} / 1000 caracteres
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Credential URL */}
            <FormField
              control={form.control}
              name="credencial_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link da credencial ou certificado</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
