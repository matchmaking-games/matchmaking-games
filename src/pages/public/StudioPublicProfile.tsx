import { useParams } from "react-router-dom";
import { MapPin, Users, Globe, Calendar } from "lucide-react";
import { SocialIcon } from "@/components/shared/SocialIcon";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCard } from "@/components/jobs/JobCard";
import { usePublicStudio } from "@/hooks/public/usePublicStudio";
import { formatTamanhoEstudio } from "@/lib/formatters";
import { ProfileNotFound } from "@/components/public-profile/ProfileNotFound";

export default function StudioPublicProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = usePublicStudio(slug);

  const studio = data?.studio;
  const vagas = data?.vagas || [];

  if (isLoading) return <LoadingSkeleton />;
  if (!studio || error) return <StudioNotFound />;

  const location = [studio.cidade, studio.estado].filter(Boolean).join(", ");
  const fundadoEm = studio.fundado_em ? new Date(studio.fundado_em).getFullYear() : null;
  const initials = studio.nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12 pt-28 space-y-6">
        {/* Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-5">
              <Avatar className="w-20 h-20 rounded-xl flex-shrink-0">
                <AvatarImage src={studio.logo_url || undefined} alt={studio.nome} />
                <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-2xl font-display font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-3 min-w-0">
                <h1 className="font-display text-3xl font-bold text-foreground">{studio.nome}</h1>

                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  {location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 flex-shrink-0" /> {location}
                    </span>
                  )}
                  {studio.tamanho && (
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 flex-shrink-0" /> {formatTamanhoEstudio(studio.tamanho)}
                    </span>
                  )}
                  {studio.website && (
                    <a
                      href={studio.website.startsWith("http") ? studio.website : `https://${studio.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <Globe className="w-4 h-4 flex-shrink-0" /> Website
                    </a>
                  )}
                  {fundadoEm && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 flex-shrink-0" /> Fundado em {fundadoEm}
                    </span>
                  )}
                </div>

                {studio.especialidades && studio.especialidades.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {studio.especialidades.map((esp) => (
                      <Badge key={esp} variant="secondary">{esp}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Card */}
        {(() => {
          const socialLinks = [
            { key: "website", url: studio.website, isLucide: true },
            { key: "linkedin", url: studio.linkedin_url },
            { key: "github", url: studio.github_url },
            { key: "twitter", url: studio.twitter_url },
            { key: "instagram", url: studio.instagram_url },
            { key: "facebook", url: studio.facebook_url },
            { key: "youtube", url: studio.youtube_url },
            { key: "twitch", url: studio.twitch_url },
            { key: "telegram", url: studio.telegram_url },
            { key: "artstation", url: studio.artstation_url },
            { key: "behance", url: studio.behance_url },
            { key: "dribbble", url: studio.dribbble_url },
            { key: "itch", url: studio.itch_url },
            { key: "pinterest", url: studio.pinterest_url },
          ].filter((l) => l.url);

          const hasSobre = !!studio.sobre;
          const hasSocial = socialLinks.length > 0;

          if (!hasSobre && !hasSocial) return null;

          return (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl font-semibold">Sobre o Estúdio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasSobre && (
                  <p className="text-foreground whitespace-pre-line leading-relaxed">{studio.sobre}</p>
                )}
                {hasSocial && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {socialLinks.map(({ key, url, isLucide }) => (
                      <a
                        key={key}
                        href={url!.startsWith("http") ? url! : `https://${url!}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={key}
                      >
                        {isLucide ? (
                          <Globe className="w-5 h-5" />
                        ) : (
                          <SocialIcon network={key} size={20} />
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}

        {/* Jobs Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl font-semibold">Vagas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            {vagas.length > 0 ? (
              <div className="space-y-3">
                {vagas.map((vaga) => (
                  <JobCard key={vaga.id} job={vaga} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Este estúdio não possui vagas abertas no momento.
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

function StudioNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <p className="text-8xl font-display font-bold text-muted-foreground/30">404</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-display font-semibold text-foreground">Estúdio não encontrado</h1>
          <p className="text-muted-foreground">O estúdio que você procura não existe ou foi removido.</p>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12 pt-28 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-5">
              <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
