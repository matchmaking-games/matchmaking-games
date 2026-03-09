import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarRange, Loader2 } from "lucide-react";
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
      .max(1000, "A descrição deve ter no máximo 1000 caracteres")
      .optional()
      .or(z.literal("")),
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
      .optional()
      .or(z.literal(""))
      .refine(
        (val) => !val || z.string().url().safeParse(val).success,
        "Informe uma URL válida"
      ),
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutateAsync: createEvento, isPending } = useCreateEvento();
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

  const modalidade = form.watch("modalidade");
  const estadoSelecionado = form.watch("estado");
  const descricao = form.watch("descricao") || "";
  const dateRange = form.watch("dateRange");
  const showLocation = modalidade === "presencial" || modalidade === "hibrido";

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
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="font-display font-bold text-3xl text-foreground">
                Criar Evento
              </h1>
              <Button
                variant="outline"
                onClick={() => navigate("/eventos")}
                className="gap-2"
              >
                <CalendarRange className="h-4 w-4" />
                Ver eventos da comunidade
              </Button>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Nome */}
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do evento</FormLabel>
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
                      <FormLabel>Descrição</FormLabel>
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
                      <FormLabel>Período do evento</FormLabel>
                      <FormControl>
                        <div>
                          <div className="flex justify-center">
                            <Calendar
                              mode="range"
                              selected={field.value as DateRange | undefined}
                              onSelect={(range) => {
                                if (range) {
                                  field.onChange({
                                    from: range.from,
                                    to: range.to || range.from,
                                  });
                                }
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
                        <FormLabel>Horário de início</FormLabel>
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
                        <FormLabel>Horário de fim</FormLabel>
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
                      <FormLabel>Modalidade</FormLabel>
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
                            <FormLabel>Estado</FormLabel>
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
                            <FormLabel>Cidade</FormLabel>
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
                          <FormLabel>Endereço</FormLabel>
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
                      <FormLabel>Link para mais detalhes</FormLabel>
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
                    onClick={() => navigate("/dashboard/events")}
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
