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
import { useIBGELocations } from "@/hooks/useIBGELocations";
import { useExperiences, type Experience } from "@/hooks/useExperiences";
import { MonthYearPicker } from "./MonthYearPicker";

// Zod validation schema with conditional location validation
const experienceSchema = z.object({
  titulo_cargo: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(100, "Máximo 100 caracteres"),
  empresa: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(100, "Máximo 100 caracteres"),
  tipo_emprego: z.enum(["clt", "pj", "freelance", "estagio"], {
    required_error: "Selecione o tipo de contrato",
  }),
  estado: z.string().optional(),
  cidade: z.string().optional(),
  cidade_ibge_id: z.number().optional(),
  remoto: z.boolean().default(false),
  inicio: z.string().regex(/^\d{4}-\d{2}$/, "Selecione a data de início"),
  atualmente_trabalhando: z.boolean().default(false),
  fim: z.string().optional(),
  descricao: z.string().max(2000, "Máximo 2000 caracteres").optional(),
}).refine((data) => {
  // If remote work is disabled, location fields are required
  if (!data.remoto) {
    return !!data.estado && data.estado.length === 2;
  }
  return true;
}, {
  message: "Selecione o estado",
  path: ["estado"],
}).refine((data) => {
  // If remote work is disabled, city is required
  if (!data.remoto) {
    return !!data.cidade && data.cidade.length >= 2;
  }
  return true;
}, {
  message: "Selecione a cidade",
  path: ["cidade_ibge_id"],
}).refine((data) => {
  // If not currently working, end date is required
  if (!data.atualmente_trabalhando && !data.fim) {
    return false;
  }
  return true;
}, {
  message: "Data de término é obrigatória",
  path: ["fim"],
}).refine((data) => {
  // End date must be >= start date
  if (data.fim && data.inicio > data.fim) {
    return false;
  }
  return true;
}, {
  message: "Data de término deve ser igual ou posterior ao início",
  path: ["fim"],
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

const tipoEmpregoOptions = [
  { value: "clt", label: "CLT" },
  { value: "pj", label: "PJ" },
  { value: "freelance", label: "Freelancer" },
  { value: "estagio", label: "Estágio" },
];

interface ExperienceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingExperience: Experience | null;
  onSuccess: () => void;
}

export function ExperienceModal({
  open,
  onOpenChange,
  editingExperience,
  onSuccess,
}: ExperienceModalProps) {
  const { toast } = useToast();
  const { addExperience, updateExperience } = useExperiences();
  const {
    estados,
    loadingEstados,
    municipios,
    loadingMunicipios,
    fetchMunicipios,
    clearMunicipios,
  } = useIBGELocations();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!editingExperience;

  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      titulo_cargo: "",
      empresa: "",
      tipo_emprego: "clt",
      estado: "",
      cidade: "",
      cidade_ibge_id: 0,
      remoto: false,
      inicio: "",
      atualmente_trabalhando: false,
      fim: "",
      descricao: "",
    },
  });

  const atualmenteTrabalhando = form.watch("atualmente_trabalhando");
  const remoto = form.watch("remoto");
  const descricao = form.watch("descricao") || "";
  const selectedEstado = form.watch("estado");

  // Reset form when modal opens/closes or when editing experience changes
  useEffect(() => {
    if (open) {
      if (editingExperience) {
        // Populate form with existing data
        form.reset({
          titulo_cargo: editingExperience.titulo_cargo,
          empresa: editingExperience.empresa,
          tipo_emprego: editingExperience.tipo_emprego as ExperienceFormData["tipo_emprego"],
          estado: editingExperience.estado || "",
          cidade: editingExperience.cidade || "",
          cidade_ibge_id: editingExperience.cidade_ibge_id || 0,
          remoto: editingExperience.remoto || false,
          inicio: editingExperience.inicio?.substring(0, 7) || "",
          atualmente_trabalhando: editingExperience.atualmente_trabalhando || false,
          fim: editingExperience.fim?.substring(0, 7) || "",
          descricao: editingExperience.descricao || "",
        });

        // Load municipalities if state is set and not remote
        if (editingExperience.estado && !editingExperience.remoto) {
          fetchMunicipios(editingExperience.estado);
        }
      } else {
        // Reset to defaults for new experience
        form.reset({
          titulo_cargo: "",
          empresa: "",
          tipo_emprego: "clt",
          estado: "",
          cidade: "",
          cidade_ibge_id: 0,
          remoto: false,
          inicio: "",
          atualmente_trabalhando: false,
          fim: "",
          descricao: "",
        });
        clearMunicipios();
      }
    }
  }, [open, editingExperience, form, fetchMunicipios, clearMunicipios]);

  // Clear end date when "currently working" is checked
  useEffect(() => {
    if (atualmenteTrabalhando) {
      form.setValue("fim", "");
    }
  }, [atualmenteTrabalhando, form]);

  // Clear location fields when remote is checked
  useEffect(() => {
    if (remoto) {
      form.setValue("estado", "");
      form.setValue("cidade", "");
      form.setValue("cidade_ibge_id", 0);
      clearMunicipios();
    }
  }, [remoto, form, clearMunicipios]);

  // Handle state change - fetch municipalities
  const handleEstadoChange = (sigla: string) => {
    form.setValue("estado", sigla);
    form.setValue("cidade", "");
    form.setValue("cidade_ibge_id", 0);
    fetchMunicipios(sigla);
  };

  // Handle city change - store both name and ID
  const handleCidadeChange = (cidadeId: string) => {
    const municipio = municipios.find((m) => m.id.toString() === cidadeId);
    if (municipio) {
      form.setValue("cidade", municipio.nome);
      form.setValue("cidade_ibge_id", municipio.id);
    }
  };

  const onSubmit = async (data: ExperienceFormData) => {
    try {
      setIsSubmitting(true);

      // Build location string based on remote status
      const localizacao = data.remoto
        ? "Remoto"
        : `${data.cidade}, ${data.estado}`;

      // Convert dates to YYYY-MM-DD format
      const inicioDate = `${data.inicio}-01`;
      const fimDate = data.fim ? `${data.fim}-01` : null;

      const experienceData = {
        titulo_cargo: data.titulo_cargo,
        empresa: data.empresa,
        tipo_emprego: data.tipo_emprego,
        localizacao,
        cidade: data.remoto ? null : data.cidade || null,
        estado: data.remoto ? null : data.estado || null,
        cidade_ibge_id: data.remoto ? null : data.cidade_ibge_id || null,
        remoto: data.remoto,
        inicio: inicioDate,
        fim: fimDate,
        atualmente_trabalhando: data.atualmente_trabalhando,
        descricao: data.descricao || null,
      };

      if (isEditing) {
        await updateExperience(editingExperience.id, experienceData);
        toast({
          title: "Experiência atualizada",
          description: "Suas alterações foram salvas com sucesso.",
        });
      } else {
        await addExperience(experienceData);
        toast({
          title: "Experiência adicionada",
          description: "Nova experiência profissional adicionada com sucesso.",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving experience:", error);
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar a experiência.",
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
            {isEditing ? "Editar Experiência" : "Adicionar Experiência"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Job Title */}
            <FormField
              control={form.control}
              name="titulo_cargo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Título do cargo <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Senior Game Developer"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company */}
            <FormField
              control={form.control}
              name="empresa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Estúdio <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Ubisoft" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Employment Type */}
            <FormField
              control={form.control}
              name="tipo_emprego"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tipo de contrato <span className="text-destructive">*</span>
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
                      {tipoEmpregoOptions.map((option) => (
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

            {/* State and City - only show when not remote */}
            {!remoto && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Estado <span className="text-destructive">*</span>
                      </FormLabel>
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
                  name="cidade_ibge_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Cidade <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={handleCidadeChange}
                        value={field.value && field.value > 0 ? field.value.toString() : ""}
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
                            <SelectItem
                              key={municipio.id}
                              value={municipio.id.toString()}
                            >
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

            {/* Remote Work - AFTER location fields */}
            <FormField
              control={form.control}
              name="remoto"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Trabalho remoto
                  </FormLabel>
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
                    <FormLabel>
                      Data de início <span className="text-destructive">*</span>
                    </FormLabel>
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

              {!atualmenteTrabalhando && (
                <FormField
                  control={form.control}
                  name="fim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Data de término <span className="text-destructive">*</span>
                      </FormLabel>
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
              )}
            </div>

            {/* Currently Working */}
            <FormField
              control={form.control}
              name="atualmente_trabalhando"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Atualmente trabalho aqui
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
                  <FormLabel>Descrição das atividades</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva suas responsabilidades, projetos e conquistas nesta posição..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground text-right">
                    {descricao.length} / 2000 caracteres
                  </div>
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
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : isEditing ? (
                  "Atualizar"
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
