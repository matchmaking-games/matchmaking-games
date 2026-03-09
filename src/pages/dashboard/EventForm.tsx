import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { useCreateEvento } from "@/hooks/useCreateEvento";
import { useUpdateEvento } from "@/hooks/useUpdateEvento";
import { useEventoById } from "@/hooks/useEventoById";
import { Skeleton } from "@/components/ui/skeleton";
import { useIBGELocations } from "@/hooks/useIBGELocations";
import type { DateRange } from "react-day-picker";

const eventoSchema = z
  .object({
    nome: z
      .string()
      .min(3, "O nome deve ter pelo menos 3 caracteres")
      .max(150, "O nome deve ter no máximo 150 caracteres"),
    descricao: z
      .string()
      .min(10, "A descrição deve ter pelo menos 10 caracteres")
      .max(1000, "A descrição deve ter no máximo 1000 caracteres"),
    dateRange: z.object(
      {
        from: z.date({ required_error: "Selecione a data de início" }),
        to: z.date({ required_error: "Selecione a data de fim" }),
      },
      { required_error: "Selecione o período do evento" }
    ),
    horario_inicio: z
      .string()
      .min(1, "Informe o horário de início")
      .regex(/^\d{2}:\d{2}$/, "Formato inválido"),
    horario_fim: z
      .string()
      .min(1, "Informe o horário de fim")
      .regex(/^\d{2}:\d{2}$/, "Formato inválido"),
    modalidade: z.enum(["presencial", "hibrido", "online"], {
      required_error: "Selecione a modalidade",
    }),
    estado: z.string().optional().or(z.literal("")),
    cidade: z.string().optional().or(z.literal("")),
    endereco: z.string().optional().or(z.literal("")),
    link_externo: z
      .string()
      .min(1, "Informe o link do evento")
      .url("Informe uma URL válida (ex: https://...)"),
  })
  .superRefine((data, ctx) => {
    if (data.modalidade !== "online") {
      if (!data.estado) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selecione o estado",
          path: ["estado"],
        });
      }
      if (!data.cidade) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selecione a cidade",
          path: ["cidade"],
        });
      }
      if (!data.endereco) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o endereço do evento",
          path: ["endereco"],
        });
      }
    }
  });

type EventoFormData = z.infer<typeof eventoSchema>;

const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0")
);
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0")
);

interface TimeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

function TimeSelect({ value, onChange }: TimeSelectProps) {
  const [hour, setHour] = useState(() => value?.split(":")[0] ?? "");
  const [minute, setMinute] = useState(() => value?.split(":")[1] ?? "");

  useEffect(() => {
    if (value && value.includes(":")) {
      setHour(value.split(":")[0]);
      setMinute(value.split(":")[1]);
    }
  }, [value]);

  const handleHourChange = (h: string) => {
    setHour(h);
    if (minute) onChange(`${h}:${minute}`);
  };

  const handleMinuteChange = (m: string) => {
    setMinute(m);
    if (hour) onChange(`${hour}:${m}`);
  };

  return (
    <div className="flex gap-2">
      <Select value={hour} onValueChange={handleHourChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Hora" />
        </SelectTrigger>
        <SelectContent>
          {HOURS.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={minute} onValueChange={handleMinuteChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Min" />
        </SelectTrigger>
        <SelectContent>
          {MINUTES.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function EventForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutateAsync: createEvento, isPending: isCreating } = useCreateEvento();
  const { mutateAsync: updateEvento, isPending: isUpdating } = useUpdateEvento();
  const { data: eventoData, isLoading: isLoadingEvento } = useEventoById(id);
  const isPending = isCreating || isUpdating;
  const {
    estados,
    municipios,
    loadingMunicipios,
    fetchMunicipios,
    clearMunicipios,
  } = useIBGELocations();

  const form = useForm<EventoFormData>({
    resolver: zodResolver(eventoSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      horario_inicio: "",
      horario_fim: "",
      estado: "",
      cidade: "",
      endereco: "",
      link_externo: "",
    },
  });

  // Populate form when editing
  const [formPopulated, setFormPopulated] = useState(false);
  useEffect(() => {
    if (!eventoData || formPopulated) return;

    const dInicio = new Date(eventoData.data_inicio);
    const dFim = new Date(eventoData.data_fim);

    const tz = "America/Sao_Paulo";
    const hInicio = dInicio.toLocaleTimeString("pt-BR", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false });
    const hFim = dFim.toLocaleTimeString("pt-BR", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false });

    // Pre-fetch municipalities if there's a state
    if (eventoData.estado) {
      fetchMunicipios(eventoData.estado);
    }

    form.reset({
      nome: eventoData.nome,
      descricao: eventoData.descricao || "",
      dateRange: {
        from: new Date(dInicio.toLocaleDateString("en-CA", { timeZone: tz })),
        to: new Date(dFim.toLocaleDateString("en-CA", { timeZone: tz })),
      },
      horario_inicio: hInicio,
      horario_fim: hFim,
      modalidade: eventoData.modalidade as "presencial" | "hibrido" | "online",
      estado: eventoData.estado || "",
      cidade: eventoData.cidade || "",
      endereco: eventoData.endereco || "",
      link_externo: eventoData.link_externo || "",
    });
    setFormPopulated(true);
  }, [eventoData, formPopulated, form, fetchMunicipios]);

  const { isDirty } = form.formState;
  const modalidade = form.watch("modalidade");
  const estadoSelecionado = form.watch("estado");
  const descricao = form.watch("descricao") || "";
  const dateRange = form.watch("dateRange");
  const showLocation = modalidade === "presencial" || modalidade === "hibrido";

  const handleNavigateBack = useCallback(() => {
    if (isDirty && !window.confirm("Você tem alterações não salvas. Deseja realmente sair? Os dados serão perdidos.")) {
      return;
    }
    navigate("/dashboard/events");
  }, [isDirty, navigate]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  useEffect(() => {
    if (estadoSelecionado) {
      const estado = estados.find((e) => e.sigla === estadoSelecionado);
      if (estado) {
        fetchMunicipios(estado.sigla);
        form.setValue("cidade", "");
      }
    } else {
      clearMunicipios();
    }
  }, [estadoSelecionado, estados, fetchMunicipios, clearMunicipios, form]);

  const onSubmit = async (data: EventoFormData) => {
    try {
      const fromDate = format(data.dateRange.from, "yyyy-MM-dd");
      const toDate = format(data.dateRange.to, "yyyy-MM-dd");

      const dataInicio = `${fromDate}T${data.horario_inicio}:00-03:00`;
      const dataFim = `${toDate}T${data.horario_fim}:00-03:00`;

      await createEvento({
        nome: data.nome,
        descricao: data.descricao || undefined,
        data_inicio: dataInicio,
        data_fim: dataFim,
        modalidade: data.modalidade,
        estado: showLocation ? data.estado : undefined,
        cidade: showLocation ? data.cidade : undefined,
        endereco: showLocation ? data.endereco : undefined,
        link_externo: data.link_externo || undefined,
      });

      toast({ title: "Evento criado com sucesso!" });
      navigate("/dashboard/events");
    } catch {
      toast({
        title: "Erro ao criar evento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <Button variant="ghost" onClick={handleNavigateBack} className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para eventos
            </Button>
            {/* Header */}
            <h1 className="font-display font-bold text-3xl text-foreground">
              Criar Evento
            </h1>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Nome */}
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do evento<span className="text-destructive ml-1">*</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Global Game Jam São Paulo 2025"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Descrição */}
                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição<span className="text-destructive ml-1">*</span></FormLabel>
                      <FormControl>
                    <Textarea
                      placeholder="Descreva o evento, programação, público-alvo..."
                      className="min-h-[100px] overflow-hidden resize-none"
                      {...field}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                    />
                      </FormControl>
                      <div className="text-xs text-muted-foreground text-right">
                        {descricao.length}/1000 caracteres
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Período do evento */}
                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Período do evento<span className="text-destructive ml-1">*</span></FormLabel>
                      <FormControl>
                        <div>
                          <div className="flex justify-center">
                            <Calendar
                              mode="range"
                              selected={field.value as DateRange | undefined}
                              onSelect={(range) => {
                                if (!range || !range.from) {
                                  field.onChange(undefined);
                                  return;
                                }
                                // Se o usuário clicou no mesmo dia que já era o from e não há to,
                                // significa que quer resetar a seleção
                                const current = field.value as DateRange | undefined;
                                if (
                                  current?.from &&
                                  !current?.to &&
                                  range.from.toDateString() === current.from.toDateString()
                                ) {
                                  field.onChange(undefined);
                                  return;
                                }
                                field.onChange({
                                  from: range.from,
                                  to: range.to || range.from,
                                });
                              }}
                              locale={ptBR}
                              className="w-fit rounded-md border border-border"
                              numberOfMonths={2}
                            />
                          </div>
                          {dateRange?.from && (
                            <p className="text-sm text-muted-foreground mt-2">
                              De{" "}
                              {format(dateRange.from, "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                              {dateRange.to &&
                                dateRange.to.getTime() !==
                                  dateRange.from.getTime() && (
                                  <>
                                    {" "}
                                    até{" "}
                                    {format(dateRange.to, "dd/MM/yyyy", {
                                      locale: ptBR,
                                    })}
                                  </>
                                )}
                            </p>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Horários */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="horario_inicio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário de início<span className="text-destructive ml-1">*</span></FormLabel>
                        <FormControl>
                          <TimeSelect
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Horário de Brasília (BRT)
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="horario_fim"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário de fim<span className="text-destructive ml-1">*</span></FormLabel>
                        <FormControl>
                          <TimeSelect
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Horário de Brasília (BRT)
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Modalidade */}
                <FormField
                  control={form.control}
                  name="modalidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modalidade<span className="text-destructive ml-1">*</span></FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a modalidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="presencial">Presencial</SelectItem>
                          <SelectItem value="hibrido">Híbrido</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Localização condicional */}
                {showLocation && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Estado */}
                      <FormField
                        control={form.control}
                        name="estado"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado<span className="text-destructive ml-1">*</span></FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o estado" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {estados.map((estado) => (
                                  <SelectItem
                                    key={estado.sigla}
                                    value={estado.sigla}
                                  >
                                    {estado.sigla} — {estado.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Cidade */}
                      <FormField
                        control={form.control}
                        name="cidade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade<span className="text-destructive ml-1">*</span></FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={!estadoSelecionado || loadingMunicipios}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      loadingMunicipios
                                        ? "Carregando cidades..."
                                        : "Selecione a cidade"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {municipios.map((m) => (
                                  <SelectItem key={m.id} value={m.nome}>
                                    {m.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Endereço */}
                    <FormField
                      control={form.control}
                      name="endereco"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço<span className="text-destructive ml-1">*</span></FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Rua Augusta, 1200, Sala 42 — Centro, São Paulo"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Rua, número, complemento e bairro
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Link externo */}
                <FormField
                  control={form.control}
                  name="link_externo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link para mais detalhes<span className="text-destructive ml-1">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Site oficial, página de inscrição ou qualquer link relevante
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Botões */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleNavigateBack}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Criar Evento"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
