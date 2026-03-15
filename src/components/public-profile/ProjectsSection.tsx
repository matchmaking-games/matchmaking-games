import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { PublicProjectData } from "@/hooks/public/usePublicProfile";

interface ProjectsSectionProps {
  featuredProjects: PublicProjectData[];
  otherProjects: PublicProjectData[];
  userSlug: string;
}

const typeLabels: Record<string, string> = {
  profissional: "Profissional",
  pessoal: "Pessoal",
  game_jam: "Game Jam",
  open_source: "Open Source",
};

const typeColors: Record<string, string> = {
  profissional: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  pessoal: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  game_jam: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  open_source: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
};

function getProjectUrl(userSlug: string, project: PublicProjectData) {
  const projectSlug = project.slug || project.id;
  return `/p/${userSlug}/project/${projectSlug}`;
}

function FeaturedProjectCard({ project, userSlug }: { project: PublicProjectData; userSlug: string }) {
  return (
    <a
      href={getProjectUrl(userSlug, project)}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <Card className="overflow-hidden border-border/50 hover:border-border shadow-md hover:shadow-lg transition-all cursor-pointer">
        {/* Cover image */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          {project.imagem_capa_url ? (
            <img
              src={project.imagem_capa_url}
              alt={project.titulo}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <span className="text-3xl font-display font-bold text-muted-foreground/20">
                {project.titulo.charAt(0)}
              </span>
            </div>
          )}

          {/* Type badge */}
          <Badge
            className={`absolute top-3 left-3 border-0 ${typeColors[project.tipo] || "bg-muted text-muted-foreground"}`}
          >
            {typeLabels[project.tipo] || project.tipo}
          </Badge>
        </div>

        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-foreground line-clamp-1">
            {project.titulo}
          </h3>
          {project.descricao && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.descricao}
            </p>
          )}
        </CardContent>
      </Card>
    </a>
  );
}

function CompactProjectCard({ project, userSlug }: { project: PublicProjectData; userSlug: string }) {
  return (
    <a
      href={getProjectUrl(userSlug, project)}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <Card className="overflow-hidden border-border/50 hover:border-border shadow-sm hover:shadow-md transition-all cursor-pointer p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground text-sm line-clamp-1">
            {project.titulo}
          </h3>
          <Badge
            className={`shrink-0 text-xs border-0 ${typeColors[project.tipo] || "bg-muted text-muted-foreground"}`}
          >
            {typeLabels[project.tipo] || project.tipo}
          </Badge>
        </div>
        {project.descricao && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {project.descricao}
          </p>
        )}
      </Card>
    </a>
  );
}

export function ProjectsSection({ featuredProjects, otherProjects, userSlug }: ProjectsSectionProps) {
  const isEmpty = featuredProjects.length === 0 && otherProjects.length === 0;

  return (
    <Card id="projetos" className="scroll-mt-32 shadow-none">
      <CardHeader>
        <h2 className="text-xl font-display font-semibold text-foreground">
          Projetos
        </h2>
      </CardHeader>
      <CardContent className="space-y-8">
        {isEmpty ? (
          <p className="text-muted-foreground italic">
            Nenhum projeto adicionado ainda.
          </p>
        ) : (
          <>
            {/* Featured projects */}
            {featuredProjects.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-display font-semibold text-foreground">
                  Em Destaque
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredProjects.map((project) => (
                    <FeaturedProjectCard
                      key={project.id}
                      project={project}
                      userSlug={userSlug}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other projects */}
            {otherProjects.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-display font-semibold text-foreground">
                  Outros Projetos
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {otherProjects.map((project) => (
                    <CompactProjectCard
                      key={project.id}
                      project={project}
                      userSlug={userSlug}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
