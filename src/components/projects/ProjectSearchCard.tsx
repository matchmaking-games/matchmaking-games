import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Gamepad2 } from "lucide-react";
import { ENGINE_LABELS, PLATAFORMA_LABELS, GENERO_LABELS } from "@/constants/project-labels";
import type { ProjectCard as ProjectCardType } from "@/types/project-search";

interface ProjectSearchCardProps {
  project: ProjectCardType;
}

export function ProjectSearchCard({ project }: ProjectSearchCardProps) {
  const href = project.estudio_id
    ? `/studio/${project.estudio_slug}/project/${project.slug}`
    : `/p/${project.user_slug}/project/${project.slug}`;

  const ownerName = project.estudio_id ? project.estudio_nome : project.user_nome;
  const ownerAvatar = project.estudio_id ? project.estudio_logo_url : project.user_avatar_url;
  const ownerType = project.estudio_id ? "Estúdio" : "Profissional";

  const plataformas = project.plataformas ?? [];
  const genero = project.genero ?? [];

  const visiblePlataformas = plataformas.slice(0, 3);
  const extraPlataformas = plataformas.length - 3;

  const visibleGeneros = genero.slice(0, 2);
  const extraGeneros = genero.length - 2;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      <Card className="overflow-hidden cursor-pointer bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
        {/* Cover image */}
        <div className="aspect-video bg-muted relative flex items-center justify-center overflow-hidden">
          {project.imagem_capa_url ? (
            <img src={project.imagem_capa_url} alt={project.titulo} className="w-full h-full object-cover" />
          ) : (
            <Gamepad2 className="h-12 w-12 text-muted-foreground/50" />
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          {/* Title + engine */}
          <div className="flex items-start justify-between gap-2">
            <p className="font-display font-semibold text-foreground truncate leading-tight">{project.titulo}</p>
            {project.engine && ENGINE_LABELS[project.engine] && (
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                {ENGINE_LABELS[project.engine]}
              </Badge>
            )}
          </div>

          {/* Platforms */}
          {plataformas.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {visiblePlataformas.map((p) => (
                <Badge key={p} variant="outline" className="text-xs">
                  {PLATAFORMA_LABELS[p] || p}
                </Badge>
              ))}
              {extraPlataformas > 0 && (
                <Badge variant="outline" className="text-xs">
                  +{extraPlataformas}
                </Badge>
              )}
            </div>
          )}

          {/* Genres */}
          {genero.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {visibleGeneros.map((g) => (
                <Badge key={g} variant="outline" className="text-xs">
                  {GENERO_LABELS[g] || g}
                </Badge>
              ))}
              {extraGeneros > 0 && (
                <Badge variant="outline" className="text-xs">
                  +{extraGeneros}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 pt-3 border-t border-border/50">
            <Avatar className="w-6 h-6 flex-shrink-0">
              <AvatarImage src={ownerAvatar || undefined} alt={ownerName || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                {ownerName?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate">{ownerName}</span>
            <Badge variant="secondary" className="text-xs ml-auto flex-shrink-0">
              {ownerType}
            </Badge>
          </div>
        </div>
      </Card>
    </a>
  );
}
