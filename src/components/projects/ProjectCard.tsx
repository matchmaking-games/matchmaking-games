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
import { MoreVertical, Pencil, Star, Trash2, Gamepad2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTipoProjeto, formatStatusProjeto } from "@/lib/formatters";
import type { ProjectWithSkills } from "@/hooks/dashboard/useProjects";

interface ProjectCardProps {
  project: ProjectWithSkills;
  userSlug?: string;
  onEdit: (project: ProjectWithSkills) => void;
  onDelete: (project: ProjectWithSkills) => void;
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
    em_andamento: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    concluido: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  };
  return map[status] || "bg-muted text-muted-foreground border-border";
}

function getSkillBadgeClasses(categoria: string): string {
  const map: Record<string, string> = {
    habilidades: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    softwares: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  };
  return map[categoria] || "bg-muted text-muted-foreground border-border";
}

export function ProjectCard({ project, userSlug, onEdit, onDelete, onToggleDestaque }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden group relative">
      {/* Image or placeholder with aspect ratio */}
      <div className="aspect-video bg-muted relative flex items-center justify-center overflow-hidden">
        {project.imagem_capa_url ? (
          <img src={project.imagem_capa_url} alt={project.titulo} className="w-full h-full object-cover" />
        ) : (
          <Gamepad2 className="h-12 w-12 text-muted-foreground/50" />
        )}

        {/* Dropdown menu — always visible on touch devices, hover-only on desktop */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {userSlug && project.slug && (
              <DropdownMenuItem asChild>
                <a
                  href={`/p/${userSlug}/project/${project.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" /> Ver projeto
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(project)}>
              <Pencil className="h-4 w-4 mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleDestaque(project.id, project.destaque ?? false)}>
              <Star className={cn("h-4 w-4 mr-2", project.destaque && "fill-yellow-400 text-yellow-400")} />
              {project.destaque ? "Remover destaque" : "Destacar no topo"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(project)} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground truncate mb-2">{project.titulo}</h3>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type badge */}
          <Badge variant="outline" className={cn("text-xs", getTypeBadgeClasses(project.tipo))}>
            {formatTipoProjeto(project.tipo)}
          </Badge>

          {/* Status badge */}
          <Badge variant="outline" className={cn("text-xs", getStatusBadgeClasses(project.status))}>
            {formatStatusProjeto(project.status)}
          </Badge>

          {/* Star indicator when highlighted */}
          {project.destaque && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 ml-auto" />}
        </div>

        {/* Skills badges */}
        {project.projeto_habilidades && project.projeto_habilidades.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border">
            {project.projeto_habilidades.slice(0, 5).map((ph) => (
              <Badge
                key={ph.id}
                variant="outline"
                className={cn("text-xs", getSkillBadgeClasses(ph.habilidade.categoria))}
              >
                {ph.habilidade.nome}
              </Badge>
            ))}
            {project.projeto_habilidades.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{project.projeto_habilidades.length - 5}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
