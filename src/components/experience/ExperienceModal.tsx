import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIBGELocations } from "@/hooks/useIBGELocations";
import { useExperiences, type ExperienceWithCargos } from "@/hooks/useExperiences";
import { MonthYearPicker } from "./MonthYearPicker";

// Zod validation schema with conditional location validation
const experienceSchema = z
  .object({
    titulo_cargo: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
    empresa: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
    tipo_emprego: z.enum(["clt", "pj", "freelancer", "estagio", "tempo_integral"], {
      required_error: "Selecione o tipo de contrato",
    }),
    estado: z.string().optional(),
    cidade: z.string().optional(),
    cidade_ibge_id: z.number().optional(),
    remoto: z.enum(["presencial", "hibrido", "remoto"]).default("presencial"),
    inicio: z.string().regex(/^\d{4}-\d{2}$/, "Selecione a data de início"),
    atualmente_trabalhando: z.boolean().default(false),
    fim: z.string().optional(),
    descricao: z.string().max(2000, "Máximo 2000 caracteres").optional(),
  })
  .refine(
    (data) => {
      // If remote work is disabled, location fields are required
      if (data.remoto !== "remoto") {
        return !!data.estado && data.estado.length === 2;
      }
      return true;
    },
    {
      message: "Selecione o estado",
      path: ["estado"],
    },
  )
  .refine(
    (data) => {
      // If not remote, city is required
      if (data.remoto !== "remoto") {
        return !!data.cidade && data.cidade.length >= 2;
      }
      return true;
    },
    {
      message: "Selecione a cidade",
      path: ["cidade_ibge_id"],
    },
  )
  .refine(
    (data) => {
      // If not currently working, end date is required
      if (!data.atualmente_trabalhando && !data.fim) {
        return false;
      }
      return true;
    },
    {
      message: "Data de término é obrigatória",
      path: ["fim"],
    },
  )
  .refine(
    (data) => {
      // End date must be >= start date
      if (data.fim && data.inicio > data.fim) {
        return false;
      }
      return true;
    },
    {
      message: "Data de término deve ser igual ou posterior ao início",
      path: ["fim"],
    },
  );

type ExperienceFormData = z.infer<typeof experienceSchema>;

const tipoEmpregoOptions = [
  { value: "clt", label: "CLT" },
  { value: "pj", label: "PJ" },
  { value: "freelancer", label: "Freelancer" },
  { value: "estagio", label: "Estágio" },
  { value: "tempo_integral", label: "Tempo integral" },
];

const modalidadeOptions = [
  { value: "presencial", label: "Presencial" },
  { value: "hibrido", label: "Híbrido" },
  { value: "remoto", label: "Remoto" },
];

interface ExperienceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingExperience: ExperienceWithCargos | null;
  onSuccess: () => void;
  mode?: "create" | "edit" | "add-position";
  parentExperience?: ExperienceWithCargos | null;
}

export function ExperienceModal({ 
  open, 
  onOpenChange, 
  editingExperience, 
  onSuccess,
  mode = "create",
  parentExperience = null,
}: ExperienceModalProps) {
  const { toast } = useToast();
  const { addExperience, updateExperience, addCargo } = useExperiences();
  const { estados, loadingEstados, municipios, loadingMunicipios, fetchMunicipios, clearMunicipios } =
    useIBGELocations();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = mode === "edit" && !!editingExperience;
  const isAddingPosition = mode === "add-position" && !!parentExperience;

  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      titulo_cargo: "",
      empresa: "",
      tipo_emprego: "clt",
      estado: "",
      cidade: "",
      cidade_ibge_id: 0,
      remoto: "presencial",
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

  // Get modal title based on mode
  const getModalTitle = () => {
    if (isAddingPosition && parentExperience) {
      return `Adicionar Cargo - ${parentExperience.empresa}`;
    }
    if (isEditing) {
      return "Editar Experiência";
    }
    return "Adicionar Experiência";
  };

  // Reset form when modal opens/closes or when mode changes
  useEffect(() => {
    if (open) {
      if (isAddingPosition && parentExperience) {
        // Mode: add-position - pre-fill company and location
        form.reset({
          titulo_cargo: "",  // EMPTY - user fills
          empresa: parentExperience.empresa,  // PRE-FILLED
          tipo_emprego: "clt",  // Default - user chooses
          estado: parentExperience.estado || "",  // PRE-FILLED but EDITABLE
          cidade: parentExperience.cidade || "",  // PRE-FILLED but EDITABLE
          cidade_ibge_id: parentExperience.cidade_ibge_id || 0,
          remoto: parentExperience.remoto || "presencial",  // PRE-FILLED but EDITABLE
          inicio: "",  // EMPTY - user fills
          atualmente_trabalhando: false,
          fim: "",
          descricao: "",
        });
        
        // Load municipalities if state is set and not remote
        if (parentExperience.estado && parentExperience.remoto !== "remoto") {
          fetchMunicipios(parentExperience.estado);
        }
      } else if (isEditing && editingExperience) {
        // Mode: edit - populate form with existing data
        form.reset({
          titulo_cargo: editingExperience.titulo_cargo,
          empresa: editingExperience.empresa,
          tipo_emprego: editingExperience.tipo_emprego as ExperienceFormData["tipo_emprego"],
          estado: editingExperience.estado || "",
          cidade: editingExperience.cidade || "",
          cidade_ibge_id: editingExperience.cidade_ibge_id || 0,
          remoto: editingExperience.remoto || "presencial",
          inicio: editingExperience.inicio?.substring(0, 7) || "",
          atualmente_trabalhando: editingExperience.atualmente_trabalhando || false,
          fim: editingExperience.fim?.substring(0, 7) || "",
          descricao: editingExperience.descricao || "",
        });

        // Load municipalities if state is set and not remote
        if (editingExperience.estado && editingExperience.remoto !== "remoto") {
          fetchMunicipios(editingExperience.estado);
        }
      } else {
        // Mode: create - reset to defaults for new experience
        form.reset({
          titulo_cargo: "",
          empresa: "",
          tipo_emprego: "clt",
          estado: "",
          cidade: "",
          cidade_ibge_id: 0,
          remoto: "presencial",
          inicio: "",
          atualmente_trabalhando: false,
          fim: "",
          descricao: "",
        });
        clearMunicipios();
      }
    }
  }, [open, mode, editingExperience, parentExperience, form, fetchMunicipios, clearMunicipios, isAddingPosition, isEditing]);

  // Clear end date when "currently working" is checked
  useEffect(() => {
    if (atualmenteTrabalhando) {
      form.setValue("fim", "");
    }
  }, [atualmenteTrabalhando, form]);

  // Clear location fields when remote is selected
  useEffect(() => {
    if (remoto === "remoto") {
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

      // Convert dates to YYYY-MM-DD format (only for cargos_experiencia which uses date type)
      const inicioDate = `${data.inicio}-01`;
      const fimDate = data.fim ? `${data.fim}-01` : null;

      if (isAddingPosition && parentExperience) {
        // Mode: add-position - create new cargo
        await addCargo(parentExperience.id, {
          titulo_cargo: data.titulo_cargo,
          tipo_emprego: data.tipo_emprego,
          inicio: inicioDate,
          fim: fimDate,
          atualmente_trabalhando: data.atualmente_trabalhando,
          descricao: data.descricao || null,
          habilidades_usadas: null,
        });
        
        toast({
          title: "Cargo adicionado",
          description: `Novo cargo "${data.titulo_cargo}" adicionado com sucesso.`,
        });
      } else if (isEditing && editingExperience) {
        // Mode: edit - update existing experience
        const experienceData = {
          titulo_cargo: data.titulo_cargo,
          empresa: data.empresa,
          tipo_emprego: data.tipo_emprego,
          cidade: data.remoto === "remoto" ? null : data.cidade || null,
          estado: data.remoto === "remoto" ? null : data.estado || null,
          cidade_ibge_id: data.remoto === "remoto" ? null : data.cidade_ibge_id || null,
          remoto: data.remoto,
          inicio: inicioDate,
          fim: fimDate,
          atualmente_trabalhando: data.atualmente_trabalhando,
          descricao: data.descricao || null,
        };
        
        await updateExperience(editingExperience.id, experienceData);
        toast({
          title: "Experiência atualizada",
          description: "Suas alterações foram salvas com sucesso.",
        });
      } else {
        // Mode: create - create new experience
        const experienceData = {
          titulo_cargo: data.titulo_cargo,
          empresa: data.empresa,
          tipo_emprego: data.tipo_emprego,
          cidade: data.remoto === "remoto" ? null : data.cidade || null,
          estado: data.remoto === "remoto" ? null : data.estado || null,
          cidade_ibge_id: data.remoto === "remoto" ? null : data.cidade_ibge_id || null,
          remoto: data.remoto,
          inicio: inicioDate,
          fim: fimDate,
          atualmente_trabalhando: data.atualmente_trabalhando,
          descricao: data.descricao || null,
        };
        
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
      <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-[750px] p-0 flex flex-col h-[90dvh] sm:h-[85vh] overflow-hidden">
        <DialogHeader className="p-6 pb-4 shrink-0">
          <DialogTitle className="font-display text-xl">
            {getModalTitle()}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <ScrollArea type="always" className="flex-1 min-h-0">
              <div className="space-y-4 px-6 pb-6 pr-8">
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
                        <Input placeholder="Ex: Senior Game Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Company - disabled in add-position mode */}
                <FormField
                  control={form.control}
                  name="empresa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Estúdio <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Ubisoft" 
                          {...field} 
                          disabled={isAddingPosition}
                          className={isAddingPosition ? "bg-muted cursor-not-allowed" : ""}
                        />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
                {remoto !== "remoto" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Estado <span className="text-destructive">*</span>
                          </FormLabel>
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
                                <SelectItem key={municipio.id} value={municipio.id.toString()}>
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

                {/* Work Modality */}
                <FormField
                  control={form.control}
                  name="remoto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Modalidade <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a modalidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {modalidadeOptions.map((option) => (
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

                  {!atualmenteTrabalhando ? (
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
                  ) : (
                    <div className="hidden sm:block" aria-hidden="true" />
                  )}
                </div>

                {/* Currently Working */}
                <FormField
                  control={form.control}
                  name="atualmente_trabalhando"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Atualmente trabalho aqui</FormLabel>
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
              </div>
            </ScrollArea>

            <DialogFooter className="flex-col sm:flex-row gap-2 border-t p-6 pt-4 shrink-0">
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
                ) : isAddingPosition ? (
                  "Adicionar Cargo"
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
