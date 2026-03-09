import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, CalendarDays, Clock, MapPin, CalendarRange, EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEventos, type Evento } from "@/hooks/useEventos";
import { useDeleteEvento } from "@/hooks/useDeleteEvento";

function formatEventDate(inicio: string, fim: string): string {
  const tz = "America/Sao_Paulo";
  const dInicio = new Date(inicio);
  const dFim = new Date(fim);
  const dayInicio = dInicio.toLocaleDateString("pt-BR", { timeZone: tz });
  const dayFim = dFim.toLocaleDateString("pt-BR", { timeZone: tz });
  const timeInicio = dInicio.toLocaleTimeString("pt-BR", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
  });
  const timeFim = dFim.toLocaleTimeString("pt-BR", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
  });
  if (dayInicio === dayFim) return `${dayInicio}, ${timeInicio} – ${timeFim} (BRT)`;
  return `${dayInicio} ${timeInicio} – ${dayFim} ${timeFim} (BRT)`;
}

const modalidadeConfig: Record<string, { label: string; className: string }> = {
  presencial: {
    label: "Presencial",
    className: "bg-green-950 text-green-300 border border-green-800",
  },
  hibrido: {
    label: "Híbrido",
    className: "bg-blue-950 text-blue-300 border border-blue-800",
  },
  online: {
    label: "Online",
    className: "bg-purple-950 text-purple-300 border border-purple-800",
  },
};

interface EventCardProps {
  evento: Evento;
  onEdit: (evento: Evento) => void;
  onDelete: (evento: Evento) => void;
}

function EventCard({ evento, onEdit, onDelete }: EventCardProps) {
  const now = new Date();
  const isEncerrado = new Date(evento.data_fim) < now;
  const config = modalidadeConfig[evento.modalidade] ?? {
    label: evento.modalidade,
    className: "bg-muted text-muted-foreground border border-border",
  };
  const showLocation =
    (evento.modalidade === "presencial" || evento.modalidade === "hibrido") &&
    (evento.cidade || evento.estado);

  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        {/* Row 1: name + badges + actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="font-medium text-foreground">{evento.nome}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isEncerrado && (
              <Badge variant="outline" className="text-xs bg-red-950 text-red-300 border border-red-800">
                Encerrado
              </Badge>
            )}
            <Badge variant="outline" className={`text-xs ${config.className}`}>
              {config.label}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(evento)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(evento)} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Row 2: date/time */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>{formatEventDate(evento.data_inicio, evento.data_fim)}</span>
        </div>

        {/* Row 3: location (conditional) */}
        {showLocation && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>
              {[evento.cidade, evento.estado].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {/* Footer: external link (conditional) */}
        {evento.link_externo && (
          <div className="mt-3 flex justify-end">
            <a
              href={evento.link_externo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver mais detalhes →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function EventsPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useEventos();
  const deleteEvento = useDeleteEvento();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventoToDelete, setEventoToDelete] = useState<Evento | null>(null);

  const now = new Date();
  const sorted = data
    ? [
        ...data.filter((e) => new Date(e.data_fim) >= now),
        ...data.filter((e) => new Date(e.data_fim) < now),
      ]
    : [];

  const handleEdit = (evento: Evento) => {
    navigate(`/dashboard/events/${evento.id}/edit`);
  };

  const handleDeleteRequest = (evento: Evento) => {
    setEventoToDelete(evento);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!eventoToDelete) return;
    deleteEvento.mutate(eventoToDelete.id, {
      onSettled: () => {
        setDeleteDialogOpen(false);
        setEventoToDelete(null);
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="font-display text-3xl font-bold text-foreground">
                Meus Eventos
              </h1>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/eventos")} className="flex-shrink-0">
                  <CalendarRange className="h-4 w-4" />
                  Ver comunidade
                </Button>
                <Button onClick={() => navigate("/dashboard/events/new")} className="flex-shrink-0">
                  <Plus className="h-4 w-4" />
                  Criar Evento
                </Button>
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            )}

            {/* Error */}
            {error && !isLoading && (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <p className="text-muted-foreground text-sm">
                  Não foi possível carregar seus eventos. Tente novamente.
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && sorted.length === 0 && (
              <div className="flex flex-col items-center gap-4 py-14 text-center">
                <CalendarDays className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground mb-1">
                    Você ainda não criou nenhum evento
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Compartilhe eventos da comunidade de games com outros profissionais.
                  </p>
                </div>
                <Button onClick={() => navigate("/dashboard/events/new")}>
                  Criar meu primeiro evento
                </Button>
              </div>
            )}

            {/* Events list */}
            {!isLoading && !error && sorted.length > 0 && (
              <div className="flex flex-col gap-3">
                {sorted.map((evento) => (
                  <EventCard
                    key={evento.id}
                    evento={evento}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
            <AlertDialogDescription>
              {eventoToDelete ? (
                <>
                  O evento <strong>"{eventoToDelete.nome}"</strong> será removido
                  permanentemente. Esta ação é irreversível.
                </>
              ) : (
                "Esta ação não pode ser desfeita."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteEvento.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteEvento.isPending}
              variant="destructive"
            >
              {deleteEvento.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
