import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectDetail } from "@/hooks/public/useProjectDetail";
import { Footer } from "@/components/layout/Footer";
import { RichTextViewer } from "@/components/editor/RichTextViewer";
import { formatTipoProjeto, formatStatusProjeto } from "@/lib/formatters";
import { Play, Code2 } from "lucide-react";
import { SocialIcon } from "@/components/shared/SocialIcon";
import { ENGINE_LABELS, PLATAFORMA_LABELS, GENERO_LABELS } from "@/constants/project-labels";

// --- Skeleton ---

function ProjectDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-36 mb-6" />
      <Skeleton className="w-full aspect-video rounded-lg mb-4" />
      <Skeleton className="h-9 w-2/3 mb-2" />
      <Skeleton className="h-4 w-48 mb-3" />
      <Skeleton className="h-16 w-full rounded-lg mb-2" />
      <Skeleton className="h-4 w-full mb-6" />
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

// --- Not Found ---

function ProjectNotFound({ userSlug }: { userSlug?: string }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <p className="text-muted-foreground text-lg">Projeto não encontrado</p>
          {userSlug && (
            <Button variant="outline" asChild>
              <Link to={`/p/${userSlug}`}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Voltar ao perfil
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --- Main Page ---

export default function ProjectDetail() {
  const { slug: userSlug, projectSlug } = useParams<{
    slug: string;
    projectSlug: string;
  }>();

  const { data, isLoading, error } = useProjectDetail(userSlug, projectSlug);

  // SEO title
  useEffect(() => {
    if (data?.project) {
      document.title = `${data.project.titulo} - ${data.owner.nome_completo}`;
    }
    return () => {
      document.title = "Matchmaking";
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <ProjectDetailSkeleton />
        </div>
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <ProjectNotFound userSlug={userSlug} />
        </div>
      </div>
    );
  }

  const { project, owner, skills, studios } = data;

  // New fields — cast safely since they may not yet be in the generated type
  const engine = ((project as Record<string, unknown>).engine as string | null) ?? null;
  const plataformas = ((project as Record<string, unknown>).plataformas as string[] | null) ?? [];
  const genero = ((project as Record<string, unknown>).genero as string[] | null) ?? [];
  const steamUrl = ((project as Record<string, unknown>).steam_url as string | null) ?? null;

  const hasLinks = project.demo_url || project.codigo_url || steamUrl;
  const hasGameDetails = engine || plataformas.length > 0 || genero.length > 0;

  const habilidades = skills.filter((s) => s.categoria === "habilidades");
  const softwares = skills.filter((s) => s.categoria === "softwares");
  const hasSkills = habilidades.length > 0 || softwares.length > 0;
  const skillGridCols = habilidades.length > 0 && softwares.length > 0 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-16">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Back button */}
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link to={`/p/${userSlug}`}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar ao perfil
            </Link>
          </Button>

          {/* Hero image — only if exists */}
          {project.imagem_capa_url && (
            <img
              src={project.imagem_capa_url}
              alt={project.titulo}
              className="w-full aspect-video object-cover rounded-b-lg"
            />
          )}

          {/* Title + metadata */}
          <div className={project.imagem_capa_url ? "mt-4" : ""}>
            <h1 className="text-3xl font-bold">{project.titulo}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {formatTipoProjeto(project.tipo)} · {formatStatusProjeto(project.status)}
            </p>
          </div>

          {/* Author card */}
          <Link
            to={`/p/${owner.slug}`}
            className="mt-3 flex items-center gap-3 rounded-lg p-3 -ml-3 transition-colors hover:bg-accent"
          >
            <Avatar className="w-9 h-9">
              <AvatarImage src={owner.avatar_url || undefined} alt={owner.nome_completo} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {owner.nome_completo.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{owner.nome_completo}</p>
              {owner.titulo_profissional && (
                <p className="text-sm text-muted-foreground truncate">{owner.titulo_profissional}</p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </Link>

          {/* Studios — positioned right after author */}
          {studios.length > 0 && (
            <Card className="mt-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Estúdios Colaboradores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {studios.map((studio) => {
                  const content = (
                    <div className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-accent cursor-pointer">
                      <Avatar className="w-8 h-8 rounded-md">
                        <AvatarImage src={studio.logo_url || undefined} alt={studio.nome} />
                        <AvatarFallback className="rounded-md bg-primary/10 text-primary text-sm">
                          {studio.nome.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{studio.nome}</span>
                    </div>
                  );

                  return studio.slug ? (
                    <Link key={studio.id} to={`/studio/${studio.slug}`}>
                      {content}
                    </Link>
                  ) : (
                    <div key={studio.id}>{content}</div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Short description */}
          {project.descricao && (
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{project.descricao}</p>
          )}

          {/* Content section */}
          <div className="mt-6 space-y-4">
            {/* Skills grid */}
            {hasSkills && (
              <div className={`grid ${skillGridCols} gap-4`}>
                {habilidades.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">Habilidades</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {habilidades.map((skill) => (
                          <Badge key={skill.id} variant="secondary" className="text-xs">
                            {skill.nome}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                {softwares.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">Softwares</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {softwares.map((skill) => (
                          <Badge key={skill.id} variant="secondary" className="text-xs">
                            {skill.nome}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Game details card — engine, plataformas, genero */}
            {hasGameDetails && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Detalhes do Jogo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {engine && ENGINE_LABELS[engine] && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Engine</p>
                      <Badge variant="secondary" className="text-xs">
                        {ENGINE_LABELS[engine]}
                      </Badge>
                    </div>
                  )}
                  {plataformas.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Plataformas</p>
                      <div className="flex flex-wrap gap-2">
                        {plataformas.map((p) => (
                          <Badge key={p} variant="secondary" className="text-xs">
                            {PLATAFORMA_LABELS[p] ?? p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {genero.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Gêneros</p>
                      <div className="flex flex-wrap gap-2">
                        {genero.map((g) => (
                          <Badge key={g} variant="secondary" className="text-xs">
                            {GENERO_LABELS[g] ?? g}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Links card */}
            {hasLinks && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {project.demo_url && (
                      <Button variant="outline" asChild>
                        <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                          <Play className="h-4 w-4 fill-current mr-2" />
                          Jogar
                        </a>
                      </Button>
                    )}
                    {project.codigo_url && (
                      <Button variant="outline" asChild>
                        <a href={project.codigo_url} target="_blank" rel="noopener noreferrer">
                          <Code2 className="h-4 w-4 mr-2" />
                          Ver Código
                        </a>
                      </Button>
                    )}
                    {steamUrl && (
                      <Button variant="outline" asChild>
                        <a href={steamUrl} target="_blank" rel="noopener noreferrer">
                          <SocialIcon network="steam" size={16} className="mr-2" />
                          Steam
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rich text description */}
            {project.descricao_rich && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold">Sobre o projeto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="[&_.bn-editor]:bg-transparent [&_.bn-block-outer]:bg-transparent [&_.bn-editor]:pl-0">
                    <RichTextViewer content={JSON.stringify(project.descricao_rich)} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
