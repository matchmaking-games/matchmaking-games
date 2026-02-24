import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  Play,
  Code,
  Calendar,
  Briefcase,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useProjectDetail } from "@/hooks/useProjectDetail";
import { RichTextViewer } from "@/components/editor/RichTextViewer";
import { formatTipoProjeto, formatStatusProjeto } from "@/lib/formatters";

// --- Helpers ---

const typeColors: Record<string, string> = {
  profissional: "bg-blue-500/10 text-blue-500",
  pessoal: "bg-purple-500/10 text-purple-500",
  game_jam: "bg-orange-500/10 text-orange-500",
  open_source: "bg-green-500/10 text-green-500",
};

const statusColors: Record<string, string> = {
  em_andamento: "bg-yellow-500/10 text-yellow-500",
  concluido: "bg-green-500/10 text-green-500",
};

const categoryColors: Record<string, string> = {
  engine: "bg-blue-500/10 text-blue-500",
  linguagem: "bg-purple-500/10 text-purple-500",
  ferramenta: "bg-orange-500/10 text-orange-500",
  soft_skill: "bg-green-500/10 text-green-500",
};


function formatProjectPeriod(
  inicio: string | null,
  fim: string | null,
  status: string
): string {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (!inicio) return "Período não informado";

  const startFormatted = capitalize(
    format(new Date(inicio), "MMM yyyy", { locale: ptBR })
  );

  if (fim) {
    const endFormatted = capitalize(
      format(new Date(fim), "MMM yyyy", { locale: ptBR })
    );
    return `${startFormatted} - ${endFormatted}`;
  }

  if (status === "em_andamento") {
    return `${startFormatted} - Até o momento`;
  }

  return startFormatted;
}

// --- Skeleton ---

function ProjectDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-36 mb-6" />
      <Skeleton className="w-full aspect-video rounded-lg mb-8" />
      <Skeleton className="h-10 w-2/3 mb-4" />
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-28" />
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 lg:flex-[2] space-y-6">
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="lg:flex-1 space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
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
          <p className="text-muted-foreground text-lg">
            Projeto não encontrado
          </p>
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

  const hasLinks = project.demo_url || project.codigo_url;

  // Video embed

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

          {/* Hero image */}
          <div className="mb-8 rounded-lg overflow-hidden">
            {project.imagem_capa_url ? (
              <AspectRatio ratio={16 / 9}>
                <img
                  src={project.imagem_capa_url}
                  alt={project.titulo}
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
            ) : (
              <AspectRatio ratio={16 / 9}>
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <span className="text-6xl font-display font-bold text-muted-foreground/20">
                    {project.titulo.charAt(0)}
                  </span>
                </div>
              </AspectRatio>
            )}
          </div>

          {/* Title + Badges */}
          <div className="space-y-4 mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              {project.titulo}
            </h1>

            <div className="flex flex-wrap gap-2">
              <Badge
                className={`border-0 ${typeColors[project.tipo] || "bg-muted text-muted-foreground"}`}
              >
                {formatTipoProjeto(project.tipo)}
              </Badge>
              <Badge
                className={`border-0 ${statusColors[project.status] || "bg-muted text-muted-foreground"}`}
              >
                {formatStatusProjeto(project.status)}
              </Badge>
            </div>

            {/* Owner inline */}
            <Link
              to={`/p/${owner.slug}`}
              className="inline-flex items-center gap-3 rounded-lg p-2 -ml-2 transition-colors hover:bg-accent"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={owner.avatar_url || undefined} alt={owner.nome_completo} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {owner.nome_completo.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <span className="font-medium">{owner.nome_completo}</span>
                {owner.titulo_profissional && (
                  <span className="text-muted-foreground ml-2">
                    {owner.titulo_profissional}
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* 2-column layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <main className="flex-1 lg:flex-[2] space-y-6">
              {/* Description */}
              {project.descricao && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Sobre o Projeto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {project.descricao}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Rich text description */}
              {project.descricao_rich && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Descrição Completa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RichTextViewer content={JSON.stringify(project.descricao_rich)} />
                  </CardContent>
                </Card>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Habilidades Utilizadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge
                          key={skill.id}
                          className={`border-0 gap-1.5 ${categoryColors[skill.categoria] || "bg-muted text-muted-foreground"}`}
                        >
                          {skill.icone_url && (
                            <img
                              src={skill.icone_url}
                              alt=""
                              className="w-3.5 h-3.5"
                            />
                          )}
                          {skill.nome}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </main>

            {/* Sidebar */}
            <aside className="lg:flex-1 space-y-4 order-first lg:order-last">
              {/* Details card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Detalhes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {project.papel && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span>{project.papel}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>
                      {formatProjectPeriod(
                        project.inicio,
                        project.fim,
                        project.status
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs w-4 text-center flex-shrink-0">
                      Tipo
                    </span>
                    <Badge
                      className={`border-0 ${typeColors[project.tipo] || "bg-muted text-muted-foreground"}`}
                    >
                      {formatTipoProjeto(project.tipo)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs w-4 text-center flex-shrink-0">
                      Status
                    </span>
                    <Badge
                      className={`border-0 ${statusColors[project.status] || "bg-muted text-muted-foreground"}`}
                    >
                      {formatStatusProjeto(project.status)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Links card */}
              {hasLinks && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {project.demo_url && (
                      <Button asChild className="w-full">
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Jogar / Ver Demo
                        </a>
                      </Button>
                    )}
                    {project.codigo_url && (
                      <Button variant="secondary" asChild className="w-full">
                        <a
                          href={project.codigo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Code className="w-4 h-4 mr-2" />
                          Ver Código
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Studios card */}
              {studios.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Estúdios Colaboradores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {studios.map((studio) => {
                      const content = (
                        <div className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-accent cursor-pointer">
                          <Avatar className="w-8 h-8 rounded-md">
                            <AvatarImage
                              src={studio.logo_url || undefined}
                              alt={studio.nome}
                            />
                            <AvatarFallback className="rounded-md bg-primary/10 text-primary text-sm">
                              {studio.nome.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {studio.nome}
                          </span>
                        </div>
                      );

                      return studio.slug ? (
                        <Link
                          key={studio.id}
                          to={`/studio/${studio.slug}`}
                        >
                          {content}
                        </Link>
                      ) : (
                        <div key={studio.id}>{content}</div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
