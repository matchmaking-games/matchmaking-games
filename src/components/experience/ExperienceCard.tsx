import { Calendar, MapPin, EllipsisVertical, Pencil, Plus, Trash2 } from "lucide-react";
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
import { formatDateRange, formatTipoEmprego } from "@/lib/formatters";
import type { ExperienceWithCargos, CargoExperiencia } from "@/hooks/useExperiences";

interface ExperienceCardProps {
  experience: ExperienceWithCargos;
  onEdit: (experience: ExperienceWithCargos) => void;
  onDelete: (experience: ExperienceWithCargos) => void;
  onAddCargo: (experience: ExperienceWithCargos) => void;
}

// Badge color configuration for employment types
const tipoEmpregoStyles: Record<string, string> = {
  clt: "bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20",
  pj: "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/20",
  freelance: "bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20",
  estagio: "bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/20",
};

function CargoTimelineItem({ cargo }: { cargo: CargoExperiencia }) {
  const dateRange = formatDateRange(cargo.inicio, cargo.fim, cargo.atualmente_trabalhando);
  const tipoEmpregoLabel = formatTipoEmprego(cargo.tipo_emprego);
  const tipoEmpregoStyle = tipoEmpregoStyles[cargo.tipo_emprego] || tipoEmpregoStyles.clt;

  return (
    <div className="relative pb-4 last:pb-0 pl-5">
      {/* Timeline dot */}
      <div className="absolute left-0 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full bg-primary border-2 border-background" />

      <div className="space-y-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h4 className="text-sm font-medium text-foreground">{cargo.titulo_cargo}</h4>
          <Badge variant="outline" className={`text-xs px-2 py-0 ${tipoEmpregoStyle}`}>
            {tipoEmpregoLabel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{dateRange}</p>
        {cargo.descricao && (
          <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">
            {cargo.descricao}
          </p>
        )}
        {cargo.habilidades_usadas && cargo.habilidades_usadas.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {cargo.habilidades_usadas.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ExperienceCard({ experience, onEdit, onDelete, onAddCargo }: ExperienceCardProps) {
  const hasCargos = experience.cargos && experience.cargos.length > 0;

  const ActionsDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(experience)}>
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddCargo(experience)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar cargo
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(experience)} className="text-destructive focus:text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Layout WITH multiple cargos (internal timeline)
  if (hasCargos) {
    return (
      <Card className="group transition-all hover:border-primary/30">
        <CardContent className="p-3 sm:p-4">
          {/* Header: Company */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-foreground">{experience.empresa}</h3>
              {((experience.cidade && experience.estado) || experience.remoto) && (
                <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                  <span className="break-words">
                    {experience.cidade && experience.estado && `${experience.cidade}, ${experience.estado}`}
                    {experience.cidade && experience.estado && experience.remoto && " • "}
                    {experience.remoto && <span className="text-primary">Remoto</span>}
                  </span>
                </div>
              )}
            </div>
            <ActionsDropdown />
          </div>

          {/* Internal cargo timeline */}
          <div className="relative ml-2 border-l-2 border-border overflow-visible">
            {experience.cargos.map((cargo) => (
              <CargoTimelineItem key={cargo.id} cargo={cargo} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Layout WITHOUT extra cargos (single position)
  const dateRange = formatDateRange(experience.inicio, experience.fim, experience.atualmente_trabalhando);
  const tipoEmpregoLabel = formatTipoEmprego(experience.tipo_emprego);
  const tipoEmpregoStyle = tipoEmpregoStyles[experience.tipo_emprego] || tipoEmpregoStyles.clt;

  return (
    <Card className="group transition-all hover:border-primary/30">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Title */}
            <h3 className="text-sm sm:text-base font-semibold text-foreground">{experience.titulo_cargo}</h3>

            {/* Company */}
            <p className="text-sm text-muted-foreground">{experience.empresa}</p>

            {/* Employment Type Badge */}
            <div className="mt-1">
              <Badge variant="outline" className={`text-xs px-2 py-0.5 rounded-full ${tipoEmpregoStyle}`}>
                {tipoEmpregoLabel}
              </Badge>
            </div>

            {/* Date range */}
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <span>{dateRange}</span>
            </div>

            {/* Location */}
            {((experience.cidade && experience.estado) || experience.remoto) && (
              <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                <span className="break-words">
                  {experience.cidade && experience.estado && `${experience.cidade}, ${experience.estado}`}
                  {experience.cidade && experience.estado && experience.remoto && " • "}
                  {experience.remoto && <span className="text-primary">Remoto</span>}
                </span>
              </div>
            )}

            {/* Description */}
            {experience.descricao && (
              <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap break-words leading-relaxed pt-1">
                {experience.descricao}
              </p>
            )}

            {/* Skills used */}
            {experience.habilidades_usadas && experience.habilidades_usadas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {experience.habilidades_usadas.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action dropdown */}
          <ActionsDropdown />
        </div>
      </CardContent>
    </Card>
  );
}
