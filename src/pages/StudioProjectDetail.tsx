import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useStudioProject } from "@/hooks/useStudioProject";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ENGINE_LABELS, PLATAFORMA_LABELS, GENERO_LABELS } from "@/constants/project-labels";
import { ArrowLeft, Play, Code, ExternalLink } from "lucide-react";

function StudioProjectSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="w-full aspect-video rounded-lg" />
      <Skeleton className="h-9 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

export default function StudioProjectDetail() {
  const { slug, projectSlug } = useParams<{ slug: string; projectSlug: string }>();
  const { project, isLoading, error } = useStudioProject(projectSlug);

  const estudio = project?.estudio as { id: string; nome: string; slug: string; logo_url: string | null } | null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <StudioProjectSkeleton />
        ) : error || !project ? (
          <Card className="max-w-md mx-auto mt-16">
            <CardContent className="pt-6 text-center space-y-4">
              <h1 className="font-display font-semibold text-2xl">Projeto não encontrado</h1>
              <p className="text-muted-foreground">O projeto que você procura não existe ou foi removido.</p>
              <Button asChild variant="outline">
                <Link to="/projects">Ver todos os projetos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Back link */}
            {estudio && (
              <Button asChild variant="ghost" size="sm" className="gap-1.5">
                <Link to={`/studio/${estudio.slug}`}>
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao estúdio
                </Link>
              </Button>
            )}

            {/* Cover image */}
            {project.imagem_capa_url && (
              <img
                src={project.imagem_capa_url}
                alt={project.titulo}
                className="w-full aspect-video object-cover rounded-lg"
              />
            )}

            {/* Title */}
            <h1 className="font-display font-semibold text-3xl">{project.titulo}</h1>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {project.engine && (
                <Badge variant="secondary">
                  {ENGINE_LABELS[project.engine] ?? project.engine}
                </Badge>
              )}
              {(project.plataformas as string[] | null)?.map((p) => (
                <Badge key={p} variant="outline">
                  {PLATAFORMA_LABELS[p] ?? p}
                </Badge>
              ))}
              {(project.genero as string[] | null)?.map((g) => (
                <Badge key={g} variant="outline">
                  {GENERO_LABELS[g] ?? g}
                </Badge>
              ))}
            </div>

            {/* Description */}
            {project.descricao && (
              <p className="text-muted-foreground whitespace-pre-line">{project.descricao}</p>
            )}

            {/* External links */}
            {(project.demo_url || project.codigo_url || project.steam_url) && (
              <div className="flex flex-wrap gap-3">
                {project.demo_url && (
                  <Button asChild variant="outline" size="sm">
                    <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                      <Play className="h-4 w-4" />
                      Ver demo
                    </a>
                  </Button>
                )}
                {project.codigo_url && (
                  <Button asChild variant="outline" size="sm">
                    <a href={project.codigo_url} target="_blank" rel="noopener noreferrer">
                      <Code className="h-4 w-4" />
                      Ver código
                    </a>
                  </Button>
                )}
                {project.steam_url && (
                  <Button asChild variant="outline" size="sm">
                    <a href={project.steam_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Ver na Steam
                    </a>
                  </Button>
                )}
              </div>
            )}

            {/* Studio footer */}
            {estudio && (
              <p className="text-sm text-muted-foreground pt-4 border-t border-border">
                Projeto de{" "}
                <Link to={`/studio/${estudio.slug}`} className="text-foreground font-medium hover:underline">
                  {estudio.nome}
                </Link>
              </p>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
