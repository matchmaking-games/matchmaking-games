import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Star, Trash2, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTipoProjeto, formatStatusProjeto } from "@/lib/formatters";
import type { Project } from "@/hooks/useProjects";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onToggleDestaque: (id: string, currentValue: boolean) => void;
}

function getTypeBadgeClasses(tipo: string): string {
  const map: Record<string, string> = {
    profissional: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    pessoal: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    game_jam: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    open_source: "bg-green-500/20 text-green-300 border-green-500/30",
  };
  return map[tipo] || "bg-muted text-muted-foreground border-border";
}

function getStatusBadgeClasses(status: string): string {
  const map: Record<string, string> = {
    publicado: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    em_desenvolvimento: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    arquivado: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  };
  return map[status] || "bg-muted text-muted-foreground border-border";
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onToggleDestaque,
}: ProjectCardProps) {
  return (
    <Card className="overflow-hidden group relative">
      {/* Image placeholder with aspect ratio */}
      <div className="aspect-video bg-muted relative flex items-center justify-center">
        <Gamepad2 className="h-12 w-12 text-muted-foreground/50" />

        {/* Dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(project)}>
              <Pencil className="h-4 w-4 mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onToggleDestaque(project.id, project.destaque ?? false)
              }
            >
              <Star
                className={cn(
                  "h-4 w-4 mr-2",
                  project.destaque && "fill-yellow-400 text-yellow-400"
                )}
              />
              {project.destaque ? "Remover destaque" : "Destacar no topo"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(project)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground truncate mb-2">
          {project.titulo}
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type badge */}
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full border",
              getTypeBadgeClasses(project.tipo)
            )}
          >
            {formatTipoProjeto(project.tipo)}
          </span>

          {/* Status badge */}
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full border",
              getStatusBadgeClasses(project.status)
            )}
          >
            {formatStatusProjeto(project.status)}
          </span>

          {/* Star indicator when highlighted */}
          {project.destaque && (
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 ml-auto" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
