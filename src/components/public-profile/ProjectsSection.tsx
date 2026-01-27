import { ExternalLink, Play, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { PublicProjectData } from "@/hooks/usePublicProfile";

interface ProjectsSectionProps {
  projects: PublicProjectData[];
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

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section id="projetos" className="scroll-mt-20">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-display font-semibold text-foreground">
            Projetos em Destaque
          </h2>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-muted-foreground italic">
              Nenhum projeto em destaque ainda.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="overflow-hidden rounded-lg border border-border/50 hover:border-border transition-colors group bg-muted/30"
                >
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

                  <div className="p-4 space-y-3">
                    {/* Title */}
                    <h3 className="font-semibold text-foreground line-clamp-1">
                      {project.titulo}
                    </h3>

                    {/* Description */}
                    {project.descricao_curta && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.descricao_curta}
                      </p>
                    )}

                    {/* Links */}
                    {(project.demo_url || project.video_url || project.codigo_url) && (
                      <div className="flex gap-2 pt-2">
                        {project.demo_url && (
                          <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-md bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Ver demo"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {project.video_url && (
                          <a
                            href={project.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-md bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Ver vídeo"
                          >
                            <Play className="w-4 h-4" />
                          </a>
                        )}
                        {project.codigo_url && (
                          <a
                            href={project.codigo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-md bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Ver código"
                          >
                            <Code className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
