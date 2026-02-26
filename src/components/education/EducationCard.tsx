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
import type { Education } from "@/hooks/useEducations";

interface EducationCardProps {
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

export function EducationCard({ education, onEdit, onDelete }: EducationCardProps) {
  const period = formatEducationPeriod(education.inicio, education.fim, education.concluido);
  const tipoEducacaoLabel = formatTipoEducacao(education.tipo);
  const tipoEducacaoStyle = tipoEducacaoStyles[education.tipo] || tipoEducacaoStyles.graduacao;

  return (
    <Card className="group transition-all hover:border-primary/30">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Title */}
            <h3 className="text-sm sm:text-base font-semibold text-foreground">{education.titulo}</h3>

            {/* Institution + Type */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">{education.instituicao}</span>
              <Badge
                variant="outline"
                className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${tipoEducacaoStyle}`}
              >
                {tipoEducacaoLabel}
              </Badge>
            </div>

            {/* Date range */}
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <span>{period}</span>
            </div>

            {/* Area of study */}
            {education.area && <p className="text-xs sm:text-sm text-muted-foreground">{education.area}</p>}

            {/* Description */}
            {education.descricao && (
              <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap break-words leading-relaxed pt-1">
                {education.descricao}
              </p>
            )}

            {/* Credential link */}
            {education.credencial_url && (
              <a
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

          {/* Action dropdown (⋮) */}
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
              <DropdownMenuItem onClick={() => onDelete(education)} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
