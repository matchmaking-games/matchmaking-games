import { Briefcase, Calendar, MapPin, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateRange, formatTipoEmprego } from "@/lib/formatters";
import type { Experience } from "@/hooks/useExperiences";

interface ExperienceCardProps {
  experience: Experience;
  onEdit: (experience: Experience) => void;
  onDelete: (experience: Experience) => void;
}

// Badge color configuration for employment types
const tipoEmpregoStyles: Record<string, string> = {
  clt: "bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30",
  pj: "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30",
  freelance: "bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30",
  estagio: "bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30",
};

export function ExperienceCard({ experience, onEdit, onDelete }: ExperienceCardProps) {
  // Safely access fields with fallbacks
  const inicio = experience.inicio;
  const fim = experience.fim;
  const atualmenteTrabalhando = experience.atualmente_trabalhando;
  const tipoEmprego = experience.tipo_emprego || "clt";
  const tituloCargo = experience.titulo_cargo || "";
  const descricao = experience.descricao;
  const habilidadesUsadas = experience.habilidades_usadas;

  const dateRange = inicio 
    ? formatDateRange(inicio, fim, atualmenteTrabalhando)
    : "Período não informado";

  const tipoEmpregoLabel = formatTipoEmprego(tipoEmprego);
  const tipoEmpregoStyle = tipoEmpregoStyles[tipoEmprego] || tipoEmpregoStyles.clt;

  return (
    <Card className="group transition-all hover:border-primary/30">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          {/* Main content */}
          <div className="flex gap-4 flex-1 min-w-0">
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Title */}
              <h3 className="font-semibold text-lg text-foreground truncate">
                {tituloCargo || "Cargo não informado"}
              </h3>

              {/* Company + Employment Type */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-muted-foreground">{experience.empresa}</span>
                <Badge variant="outline" className={tipoEmpregoStyle}>
                  {tipoEmpregoLabel}
                </Badge>
              </div>

              {/* Date range */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>{dateRange}</span>
              </div>

              {/* Location */}
              {(experience.localizacao || experience.remoto) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {experience.localizacao}
                    {experience.localizacao && experience.remoto && " • "}
                    {experience.remoto && (
                      <span className="text-primary">Remoto</span>
                    )}
                  </span>
                </div>
              )}

              {/* Description */}
              {descricao && (
                <p className="text-sm text-muted-foreground mt-3 whitespace-pre-line">
                  {descricao}
                </p>
              )}

              {/* Skills used */}
              {habilidadesUsadas && habilidadesUsadas.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {habilidadesUsadas.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(experience)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(experience)}
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
