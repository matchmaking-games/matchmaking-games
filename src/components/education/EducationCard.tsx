import { GraduationCap, Calendar, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTipoEducacao, formatEducationPeriod } from "@/lib/formatters";
import type { Education } from "@/hooks/useEducations";

interface EducationCardProps {
  education: Education;
  onEdit: (education: Education) => void;
  onDelete: (education: Education) => void;
}

// Badge color configuration for education types
const tipoEducacaoStyles: Record<string, string> = {
  graduacao: "bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30",
  pos: "bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30",
  tecnico: "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30",
  curso: "bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30",
  certificacao: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30",
};

export function EducationCard({ education, onEdit, onDelete }: EducationCardProps) {
  const period = formatEducationPeriod(
    education.inicio,
    education.fim,
    education.concluido
  );

  const tipoEducacaoLabel = formatTipoEducacao(education.tipo);
  const tipoEducacaoStyle = tipoEducacaoStyles[education.tipo] || tipoEducacaoStyles.graduacao;

  return (
    <Card className="group transition-all hover:border-primary/30">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          {/* Main content */}
          <div className="flex gap-4 flex-1 min-w-0">
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Title */}
              <h3 className="font-semibold text-lg text-foreground truncate">
                {education.titulo}
              </h3>

              {/* Institution + Type */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-muted-foreground">{education.instituicao}</span>
                <Badge variant="outline" className={tipoEducacaoStyle}>
                  {tipoEducacaoLabel}
                </Badge>
              </div>

              {/* Date range */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>{period}</span>
              </div>

              {/* Area of study */}
              {education.area && (
                <p className="text-sm text-muted-foreground">
                  {education.area}
                </p>
              )}

              {/* Description */}
              {education.descricao && (
                <p className="text-sm text-muted-foreground mt-3 whitespace-pre-line">
                  {education.descricao}
                </p>
              )}

              {/* Credential link */}
              {education.credencial_url && (
                <a
                  href={education.credencial_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver credencial
                </a>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(education)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(education)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
