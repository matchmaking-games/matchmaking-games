import { useParams, Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Copy, MapPin, Users, ChevronLeft } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useJobDetail } from "@/hooks/useJobDetail";
import { JobNotFound } from "@/components/jobs/JobNotFound";
import {
  formatNivelVaga,
  formatTipoContrato,
  formatTipoTrabalho,
  formatTamanhoEstudio,
} from "@/lib/formatters";

function formatSalario(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;

  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }
  if (min) {
    return `A partir de ${formatter.format(min)}`;
  }
  if (max) {
    return `Até ${formatter.format(max)}`;
  }
  return null;
}

function JobDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-32 mb-6" />

      <div className="flex flex-col lg:flex-row gap-8">
        <main className="flex-1 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>

        <aside className="w-full lg:w-80 space-y-4 order-first lg:order-last">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export default function JobDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { data: vaga, isLoading, error } = useJobDetail(slug);

  // Separate skills
  const requiredSkills =
    vaga?.habilidades
      .filter((h) => h.obrigatoria && h.habilidade)
      .map((h) => h.habilidade!) || [];

  const optionalSkills =
    vaga?.habilidades
      .filter((h) => !h.obrigatoria && h.habilidade)
      .map((h) => h.habilidade!) || [];

  // Formatted salary
  const salarioFormatado = vaga?.mostrar_salario
    ? formatSalario(vaga.salario_min, vaga.salario_max)
    : null;

  const handleCopy = async () => {
    if (!vaga?.contato_candidatura) return;

    try {
      await navigator.clipboard.writeText(vaga.contato_candidatura);
      toast({
        title: "Copiado!",
        description: "Copiado para a área de transferência.",
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <JobDetailSkeleton />
        </div>
      </div>
    );
  }

  if (!vaga || error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <JobNotFound />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-16">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Back button */}
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link to="/jobs">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar para vagas
            </Link>
          </Button>

          {/* Responsive layout: stacked on mobile, 2 columns on desktop */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <main className="flex-1 lg:flex-[2]">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  {/* Title and badges */}
                  <div className="space-y-4">
                    <h1 className="text-3xl font-display font-bold">
                      {vaga.titulo}
                    </h1>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {formatNivelVaga(vaga.nivel)}
                      </Badge>
                      <Badge variant="outline">
                        {formatTipoContrato(vaga.tipo_contrato)}
                      </Badge>
                      <Badge variant="outline">
                        {formatTipoTrabalho(vaga.remoto)}
                      </Badge>
                    </div>

                    {salarioFormatado && (
                      <p className="text-lg font-semibold text-primary">
                        {salarioFormatado}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <section className="space-y-3">
                    <h2 className="text-lg font-semibold">Descrição</h2>
                    <div className="text-muted-foreground whitespace-pre-wrap">
                      {vaga.descricao}
                    </div>
                  </section>

                  {/* Skills */}
                  {(requiredSkills.length > 0 || optionalSkills.length > 0) && (
                    <section className="space-y-4">
                      <h2 className="text-lg font-semibold">Habilidades</h2>

                      {requiredSkills.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Obrigatórias
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {requiredSkills.map((skill) => (
                              <Badge
                                key={skill.id}
                                className="bg-primary/10 text-primary border-0"
                              >
                                {skill.nome}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {optionalSkills.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Desejáveis
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {optionalSkills.map((skill) => (
                              <Badge key={skill.id} variant="secondary">
                                {skill.nome}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </section>
                  )}

                  {/* Footer - only publication date */}
                  {vaga.criada_em && (
                    <div className="text-sm text-muted-foreground pt-4 border-t">
                      Publicada{" "}
                      {formatDistanceToNow(new Date(vaga.criada_em), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </main>

            {/* Sidebar (mobile: first, desktop: right) */}
            <aside className="lg:flex-1 space-y-4 order-first lg:order-last">
              {/* Studio card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-16 h-16 rounded-lg">
                      <AvatarImage
                        src={vaga.estudio?.logo_url || undefined}
                        alt={vaga.estudio?.nome}
                      />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-lg">
                        {vaga.estudio?.nome?.charAt(0).toUpperCase() || "E"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      {/* Plain text - no link */}
                      <h2 className="font-semibold text-lg">
                        {vaga.estudio?.nome}
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-muted-foreground">
                    {(vaga.estudio?.cidade && vaga.estudio?.estado) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{vaga.estudio.cidade}, {vaga.estudio.estado}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {formatTamanhoEstudio(vaga.estudio?.tamanho || null)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* How to apply - only show if contact exists */}
              {vaga.contato_candidatura && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Como se candidatar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <div
                        onClick={handleCopy}
                        className="flex-1 px-3 py-2 bg-muted rounded-md cursor-pointer select-all font-mono text-sm truncate"
                        title={vaga.contato_candidatura}
                      >
                        {vaga.contato_candidatura}
                      </div>
                      <Button
                        onClick={handleCopy}
                        size="icon"
                        variant="outline"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
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
