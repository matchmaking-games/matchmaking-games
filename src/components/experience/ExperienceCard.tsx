import { Calendar, Pencil, Trash2, ExternalLink, EllipsisVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatTipoEducacao, formatEducationPeriod } from "@/lib/formatters";
import type { Education } from "@/hooks/dashboard/useEducations";

interface EducationCardProps {
  education: Education;
  onEdit: (education: Education) => void;
  onDelete: (education: Education) => void;
}

interface ActionsDropdownProps {
  education: Education;
  onEdit: (education: Education) => void;
  onDelete: (education: Education) => void;
}

const tipoEducacaoStyles: Record<string, string> = {
  graduacao: "bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20",
  pos: "bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20",
  tecnico: "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/20",
  curso: "bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/20",
  certificacao: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/20",
};

function ActionsDropdown({ education, onEdit, onDelete }: ActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(education)}>
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(education)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function EducationCard({ education, onEdit, onDelete }: EducationCardProps) {
  const period = formatEducationPeriod(education.inicio, education.fim, education.concluido);
  const tipoEducacaoLabel = formatTipoEducacao(education.tipo);
  const tipoEducacaoStyle = tipoEducacaoStyles[education.tipo] || tipoEducacaoStyles.graduacao;

  return (
    <Card className="group transition-all hover:border-primary/30">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-1.5">
            <h3 className="text-sm sm:text-base font-semibold text-foreground">{education.titulo}</h3>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">{education.instituicao}</span>
              <Badge
                variant="outline"
                className={`text-xs whitespace-nowrap ${tipoEducacaoStyle}`}
              >
                {tipoEducacaoLabel}
              </Badge>
            </div>

            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <span>{period}</span>
            </div>

            {education.area && (
              <p className="text-xs sm:text-sm text-muted-foreground">{education.area}</p>
            )}

            {education.descricao && (
              <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap break-words leading-relaxed pt-1">
                {education.descricao}
              </p>
            )}

            {education.credencial_url && (
              
                href={education.credencial_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-primary hover:underline pt-1"
              >
                <ExternalLink className="h-3 w-3" />
                Ver credencial
              </a>
            )}
          </div>

          <ActionsDropdown
            education={education}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </CardContent>
    </Card>
  );
}