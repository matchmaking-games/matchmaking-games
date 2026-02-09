import { format, differenceInDays, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreVertical, Pencil, ExternalLink, Trash2, Sparkles, Calendar, Clock, EyeOff, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StudioVaga } from "@/hooks/useStudioJobs";

interface JobsMobileCardProps {
  vagas: StudioVaga[];
  onToggleAtiva: (vaga: StudioVaga) => Promise<void>;
  onDelete: (vaga: StudioVaga) => void;
  isToggling: boolean;
}

const nivelConfig: Record<string, { label: string; className: string }> = {
  iniciante: { label: "Iniciante", className: "bg-muted text-muted-foreground" },
  junior: { label: "Júnior", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  pleno: { label: "Pleno", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  senior: { label: "Sênior", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
  lead: { label: "Lead", className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
};

// Updated to include "oculta" status
function getJobStatus(vaga: StudioVaga): "ativa" | "oculta" | "expirada" | "rascunho" {
  if (vaga.status === 'rascunho') return "rascunho";
  
  const now = new Date();
  const expiraEm = vaga.expira_em ? new Date(vaga.expira_em) : null;

  if (expiraEm && expiraEm < now) return "expirada";
  if (!vaga.ativa) return "oculta";
  return "ativa";
}

// Updated status config with "oculta" instead of "inativa"
const statusConfig: Record<string, { label: string; className: string }> = {
  ativa: { label: "Ativa", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  oculta: { label: "Oculta", className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
  expirada: { label: "Expirada", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  rascunho: { label: "Rascunho", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
};

export function JobsMobileCard({ vagas, onToggleAtiva, onDelete, isToggling }: JobsMobileCardProps) {
  const navigate = useNavigate();

  const handleViewPublic = (slug: string) => {
    window.open(`/jobs/${slug}`, "_blank");
  };

  return (
    <div className="space-y-4">
      {vagas.map((vaga) => {
        const status = getJobStatus(vaga);
        const nivel = nivelConfig[vaga.nivel] || { label: vaga.nivel, className: "bg-muted text-muted-foreground" };
        const statusBadge = statusConfig[status];

        const expiraEm = vaga.expira_em ? new Date(vaga.expira_em) : null;
        const diasRestantes = expiraEm ? differenceInDays(expiraEm, new Date()) : null;
        const isExpired = expiraEm ? isPast(expiraEm) : false;
        const showCounter = vaga.ativa && !isExpired && diasRestantes !== null && diasRestantes < 7 && diasRestantes >= 0;

        return (
          <Card key={vaga.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-foreground/90 break-words">
                      {vaga.titulo}
                    </h3>
                    {vaga.tipo_publicacao === "destaque" && (
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400" title="Destaque">
                        <Sparkles className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className={nivel.className}>
                      {nivel.label}
                    </Badge>
                    <Badge variant="outline" className={statusBadge.className}>
                      {statusBadge.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {vaga.criada_em
                          ? format(new Date(vaga.criada_em), "dd/MM/yyyy", { locale: ptBR })
                          : "-"}
                      </span>
                    </div>
                    {expiraEm && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{format(expiraEm, "dd/MM/yyyy", { locale: ptBR })}</span>
                        {showCounter && (
                          <span className="text-yellow-600 dark:text-yellow-400">
                            ({diasRestantes === 0 ? "hoje" : `${diasRestantes}d`})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* Editar - available for ATIVA, OCULTA, RASCUNHO (not EXPIRADA) */}
                    {status !== "expirada" && (
                      <DropdownMenuItem onClick={() => navigate(`/studio/jobs/${vaga.id}/edit`)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    
                    {/* Ver página pública - only for ATIVA and OCULTA */}
                    {(status === "ativa" || status === "oculta") && (
                      <DropdownMenuItem onClick={() => handleViewPublic(vaga.slug)}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver página pública
                      </DropdownMenuItem>
                    )}
                    
                    {/* Toggle visibility - only for ATIVA and OCULTA */}
                    {(status === "ativa" || status === "oculta") && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onToggleAtiva(vaga)}
                          disabled={isToggling}
                        >
                          {vaga.ativa ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Ocultar vaga
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Mostrar vaga
                            </>
                          )}
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {/* Excluir - always available */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(vaga)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
