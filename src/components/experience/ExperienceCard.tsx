import { Briefcase, Calendar, MapPin, EllipsisVertical, Pencil, Plus, Trash2 } from "lucide-react";
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
  clt: "bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30",
  pj: "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30",
  freelance: "bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30",
  estagio: "bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30",
};

function CargoTimelineItem({ cargo }: { cargo: CargoExperiencia }) {
  const dateRange = formatDateRange(cargo.inicio, cargo.fim, cargo.atualmente_trabalhando);
  const tipoEmpregoLabel = formatTipoEmprego(cargo.tipo_emprego);
  const tipoEmpregoStyle = tipoEmpregoStyles[cargo.tipo_emprego] || tipoEmpregoStyles.clt;

  return (
    <div className="relative pb-6 last:pb-0 pl-6">
      {/* Dot da timeline */}
      <div className="absolute left-0 top-1.5 h-4 w-4 -translate-x-1/2 rounded-full bg-primary border-2 border-background" />

      {/* Info do cargo */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-medium text-foreground">{cargo.titulo_cargo}</h4>
          <Badge variant="outline" className={tipoEmpregoStyle}>
            {tipoEmpregoLabel}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{dateRange}</p>
        {cargo.descricao && (
          <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-line">{cargo.descricao}</p>
        )}
        {cargo.habilidades_usadas && cargo.habilidades_usadas.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
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

  // DropdownMenu comum a ambos os layouts
  const ActionsDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
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

  // Layout COM multiplos cargos (timeline interna)
  if (hasCargos) {
    return (
      <Card className="group transition-all hover:border-primary/30">
        <CardContent className="pt-6">
          {/* Header: Empresa */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">{experience.empresa}</h3>
                {((experience.cidade && experience.estado) || experience.remoto) && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {experience.cidade && experience.estado && `${experience.cidade}, ${experience.estado}`}
                    {experience.cidade && experience.estado && experience.remoto && " • "}
                    {experience.remoto && <span className="text-primary">Remoto</span>}
                  </p>
                )}
              </div>
            </div>
            <ActionsDropdown />
          </div>

          {/* Timeline interna de cargos */}
          <div className="relative ml-5 border-l-2 border-border overflow-visible">
            {experience.cargos.map((cargo) => (
              <CargoTimelineItem key={cargo.id} cargo={cargo} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Layout SEM cargos extras (cargo unico - layout original)
  const dateRange = formatDateRange(experience.inicio, experience.fim, experience.atualmente_trabalhando);

  const tipoEmpregoLabel = formatTipoEmprego(experience.tipo_emprego);
  const tipoEmpregoStyle = tipoEmpregoStyles[experience.tipo_emprego] || tipoEmpregoStyles.clt;

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
              <h3 className="font-semibold text-lg text-foreground truncate">{experience.titulo_cargo}</h3>

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
              {((experience.cidade && experience.estado) || experience.remoto) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {experience.cidade && experience.estado && `${experience.cidade}, ${experience.estado}`}
                    {experience.cidade && experience.estado && experience.remoto && " • "}
                    {experience.remoto && <span className="text-primary">Remoto</span>}
                  </span>
                </div>
              )}

              {/* Description */}
              {experience.descricao && (
                <p className="text-sm text-muted-foreground mt-3 whitespace-pre-line">{experience.descricao}</p>
              )}

              {/* Skills used */}
              {experience.habilidades_usadas && experience.habilidades_usadas.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {experience.habilidades_usadas.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action dropdown */}
          <ActionsDropdown />
        </div>
      </CardContent>
    </Card>
  );
}
