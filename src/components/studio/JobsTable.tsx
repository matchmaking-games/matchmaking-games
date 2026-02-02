import { useState } from "react";
import { format, differenceInDays, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreVertical, Pencil, ExternalLink, Power, Trash2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { StudioVaga } from "@/hooks/useStudioJobs";

interface JobsTableProps {
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

const tipoContratoLabels: Record<string, string> = {
  clt: "CLT",
  pj: "PJ",
  freelance: "Freelance",
  estagio: "Estágio",
};

function getJobStatus(vaga: StudioVaga): "ativa" | "inativa" | "expirada" {
  const now = new Date();
  const expiraEm = vaga.expira_em ? new Date(vaga.expira_em) : null;

  if (expiraEm && expiraEm < now) return "expirada";
  if (!vaga.ativa) return "inativa";
  return "ativa";
}

const statusConfig: Record<string, { label: string; className: string }> = {
  ativa: { label: "Ativa", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  inativa: { label: "Inativa", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
  expirada: { label: "Expirada", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
};

function renderExpiraEm(vaga: StudioVaga) {
  if (!vaga.expira_em) return <span className="text-muted-foreground">-</span>;

  const expiraEm = new Date(vaga.expira_em);
  const formattedDate = format(expiraEm, "dd/MM/yyyy", { locale: ptBR });

  const diasRestantes = differenceInDays(expiraEm, new Date());
  const isExpired = isPast(expiraEm);
  const isAtiva = vaga.ativa;

  // Warning for inconsistent data
  if (diasRestantes < 0 && !isExpired) {
    console.warn(`Vaga ${vaga.id} deveria estar expirada mas status não foi atualizado`);
  }

  // Show counter only if all conditions are true
  const showCounter = isAtiva && !isExpired && diasRestantes < 7 && diasRestantes >= 0;

  return (
    <div className="flex flex-col">
      <span>{formattedDate}</span>
      {showCounter && (
        <span className="text-xs text-yellow-600 dark:text-yellow-400">
          {diasRestantes === 0 ? "Expira hoje" : `${diasRestantes} dias restantes`}
        </span>
      )}
    </div>
  );
}

export function JobsTable({ vagas, onToggleAtiva, onDelete, isToggling }: JobsTableProps) {
  const navigate = useNavigate();

  const handleViewPublic = (slug: string) => {
    window.open(`/jobs/${slug}`, "_blank");
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Nível</TableHead>
            <TableHead>Contrato</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Publicada em</TableHead>
            <TableHead>Expira em</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vagas.map((vaga) => {
            const status = getJobStatus(vaga);
            const nivel = nivelConfig[vaga.nivel] || { label: vaga.nivel, className: "bg-muted text-muted-foreground" };
            const statusBadge = statusConfig[status];

            return (
              <TableRow key={vaga.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={vaga.tipo_publicacao !== "destaque" ? "text-muted-foreground" : "font-medium"}>
                      {vaga.titulo}
                    </span>
                    {vaga.tipo_publicacao === "destaque" && (
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400">
                        <Sparkles className="h-3 w-3 mr-1" />
                        DESTAQUE
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={nivel.className}>
                    {nivel.label}
                  </Badge>
                </TableCell>
                <TableCell>{tipoContratoLabels[vaga.tipo_contrato] || vaga.tipo_contrato}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusBadge.className}>
                    {statusBadge.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {vaga.criada_em
                    ? format(new Date(vaga.criada_em), "dd/MM/yyyy", { locale: ptBR })
                    : "-"}
                </TableCell>
                <TableCell>{renderExpiraEm(vaga)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/studio/jobs/${vaga.id}/edit`)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewPublic(vaga.slug)}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver página pública
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onToggleAtiva(vaga)}
                        disabled={isToggling}
                      >
                        <Power className="h-4 w-4 mr-2" />
                        {vaga.ativa ? "Desativar vaga" : "Ativar vaga"}
                      </DropdownMenuItem>
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
