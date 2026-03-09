import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { usePublicEvents, PublicEvento } from "@/hooks/usePublicEvents";
import { useIBGELocations } from "@/hooks/useIBGELocations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, ExternalLink, Clock } from "lucide-react";

function formatEventDate(inicio: string, fim: string): string {
  const start = new Date(inicio);
  const end = new Date(fim);
  const opts: Intl.DateTimeFormatOptions = { timeZone: "America/Sao_Paulo" };
  const startDate = start.toLocaleDateString("pt-BR", opts);
  const endDate = end.toLocaleDateString("pt-BR", opts);
  const timeOpts: Intl.DateTimeFormatOptions = { ...opts, hour: "2-digit", minute: "2-digit" };
  const startTime = start.toLocaleTimeString("pt-BR", timeOpts);
  const endTime = end.toLocaleTimeString("pt-BR", timeOpts);
  if (startDate === endDate) return `${startDate}, ${startTime} – ${endTime} (BRT)`;
  return `${startDate} ${startTime} – ${endDate} ${endTime} (BRT)`;
}

function formatDetailDate(dateStr: string): string {
  const d = new Date(dateStr);
  const opts: Intl.DateTimeFormatOptions = { timeZone: "America/Sao_Paulo" };
  const date = d.toLocaleDateString("pt-BR", opts);
  const time = d.toLocaleTimeString("pt-BR", { ...opts, hour: "2-digit", minute: "2-digit" });
  return `${date} às ${time} (BRT)`;
}

const modalidadeStyles: Record<string, string> = {
  presencial: "bg-green-950 text-green-300 border border-green-800",
  hibrido: "bg-blue-950 text-blue-300 border border-blue-800",
  online: "bg-purple-950 text-purple-300 border border-purple-800",
};

const modalidadeLabels: Record<string, string> = {
  presencial: "Presencial",
  hibrido: "Híbrido",
  online: "Online",
};

function ModalidadeBadge({ modalidade }: { modalidade: string }) {
  return (
    <Badge variant="outline" className={`text-xs ${modalidadeStyles[modalidade] ?? ""}`}>
      {modalidadeLabels[modalidade] ?? modalidade}
    </Badge>
  );
}

function EncerradoBadge() {
  return (
    <Badge variant="outline" className="text-xs bg-red-950 text-red-300 border border-red-800">
      Encerrado
    </Badge>
  );
}

function EventCard({ evento, onClick }: { evento: PublicEvento; onClick: () => void }) {
  const encerrado = new Date(evento.data_fim) < new Date();
  const location = [evento.cidade, evento.estado].filter(Boolean).join(", ");

  return (
    <Card
      className="cursor-pointer hover:border-primary/40 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-sans font-semibold text-lg text-foreground leading-tight">{evento.nome}</h3>
          <div className="flex gap-1.5 shrink-0">
            <ModalidadeBadge modalidade={evento.modalidade} />
            {encerrado && <EncerradoBadge />}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0" />
          <span>{formatEventDate(evento.data_inicio, evento.data_fim)}</span>
        </div>

        {location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{location}</span>
          </div>
        )}

        {evento.descricao && (
          <p className="text-sm text-muted-foreground line-clamp-2">{evento.descricao}</p>
        )}
      </CardContent>
    </Card>
  );
}

function EventDetailSheet({ evento, open, onOpenChange }: { evento: PublicEvento | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  if (!evento) return null;

  const encerrado = new Date(evento.data_fim) < new Date();
  const location = [evento.cidade, evento.estado].filter(Boolean).join(", ");
  const startDate = new Date(evento.data_inicio).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const endDate = new Date(evento.data_fim).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const isSameDay = startDate === endDate;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md w-full p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="text-xl font-sans font-semibold text-foreground">{evento.nome}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-5rem)] px-6 pb-6">
          <div className="space-y-5 pt-4">
            <div className="flex gap-1.5 flex-wrap">
              <ModalidadeBadge modalidade={evento.modalidade} />
              {encerrado && <EncerradoBadge />}
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" /> Data e horário
              </h4>
              {isSameDay ? (
                <p className="text-sm text-muted-foreground">{formatEventDate(evento.data_inicio, evento.data_fim)}</p>
              ) : (
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p>Início: {formatDetailDate(evento.data_inicio)}</p>
                  <p>Fim: {formatDetailDate(evento.data_fim)}</p>
                </div>
              )}
            </div>

            {location && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Localização
                </h4>
                <p className="text-sm text-muted-foreground">{location}</p>
                {evento.endereco && <p className="text-sm text-muted-foreground">{evento.endereco}</p>}
              </div>
            )}

            {evento.descricao && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-foreground">Descrição</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{evento.descricao}</p>
              </div>
            )}

            {evento.link_externo && (
              <Button asChild>
                <a href={evento.link_externo} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Acessar link do evento
                </a>
              </Button>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default function Events() {
  const [modalidade, setModalidade] = useState("todos");
  const [estadoSelect, setEstadoSelect] = useState("__all__");
  const [mostrarEncerrados, setMostrarEncerrados] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<PublicEvento | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const estado = estadoSelect === "__all__" ? "" : estadoSelect;
  const { data: eventos, isLoading, error } = usePublicEvents({ modalidade, estado, mostrarEncerrados });
  const { estados, loadingEstados } = useIBGELocations();

  const handleCardClick = (evento: PublicEvento) => {
    setSelectedEvento(evento);
    setSheetOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pt-16">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {/* Header + Filters Card */}
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="font-display font-bold text-4xl text-foreground">Eventos</CardTitle>
            <CardDescription>Encontre eventos da comunidade de games e criação digital.</CardDescription>
          </CardHeader>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Modalidade</Label>
            <Select value={modalidade} onValueChange={setModalidade}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="hibrido">Híbrido</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Estado</Label>
            <Select value={estadoSelect} onValueChange={setEstadoSelect}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos os estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos os estados</SelectItem>
                {!loadingEstados &&
                  estados.map((uf) => (
                    <SelectItem key={uf.sigla} value={uf.sigla}>
                      {uf.sigla} – {uf.nome}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 pb-0.5">
            <Switch id="encerrados" checked={mostrarEncerrados} onCheckedChange={setMostrarEncerrados} />
            <Label htmlFor="encerrados" className="text-sm text-muted-foreground cursor-pointer">
              Mostrar encerrados
            </Label>
          </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {isLoading && (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">Erro ao carregar eventos. Tente novamente.</p>
        )}

        {!isLoading && !error && eventos?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="font-sans font-semibold text-lg text-foreground mb-1">Nenhum evento encontrado</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              {mostrarEncerrados
                ? "Não há eventos com os filtros selecionados."
                : "Não há eventos futuros no momento. Ative \"Mostrar encerrados\" para ver eventos passados."}
            </p>
          </div>
        )}

        {!isLoading && !error && eventos && eventos.length > 0 && (
          <div className="grid gap-4">
            {eventos.map((evento) => (
              <EventCard key={evento.id} evento={evento} onClick={() => handleCardClick(evento)} />
            ))}
          </div>
        )}

        <EventDetailSheet evento={selectedEvento} open={sheetOpen} onOpenChange={setSheetOpen} />
      </main>
      <Footer />
    </div>
  );
}
