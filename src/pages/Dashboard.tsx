import { Link, useNavigate } from "react-router-dom";
import { ExternalLink, Plus, User, CheckCircle, AlertCircle, Briefcase, MapPin } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useDashboardProfile } from "@/hooks/useDashboardProfile";
import { useRecentJobs } from "@/hooks/useRecentJobs";

const nivelLabels: Record<string, string> = {
  iniciante: "Iniciante",
  junior: "Júnior",
  pleno: "Pleno",
  senior: "Sênior",
  lead: "Lead",
};

interface ProfileItem {
  label: string;
  complete: boolean;
  href: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, skillsCount, isLoading: profileLoading } = useDashboardProfile();
  const { jobs, isLoading: jobsLoading } = useRecentJobs();

  const profileItems: ProfileItem[] = user
    ? [
        { label: "Foto de perfil", complete: !!user.avatar_url, href: "/dashboard/profile" },
        { label: "Título profissional", complete: !!user.titulo_profissional?.trim(), href: "/dashboard/profile" },
        { label: "Bio", complete: !!user.bio_curta?.trim(), href: "/dashboard/profile" },
        { label: "Localização", complete: !!user.cidade?.trim(), href: "/dashboard/profile" },
        { label: "Habilidades", complete: skillsCount > 0, href: "/dashboard/skills" },
      ]
    : [];

  const completedCount = profileItems.filter((i) => i.complete).length;
  const percentage = profileItems.length > 0 ? Math.round((completedCount / profileItems.length) * 100) : 0;
  const incompleteItems = profileItems.filter((i) => !i.complete);

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Bloco 1 — Completude do perfil */}
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Seu Perfil</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              {profileLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {percentage}% completo
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />

                  {percentage === 100 ? (
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        Parabéns! Seu perfil está completo.{" "}
                        <Link
                          to={`/p/${user?.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:opacity-80"
                        >
                          Ver portfólio público
                        </Link>
                      </span>
                    </div>
                  ) : (
                    <ul className="space-y-1.5">
                      {incompleteItems.map((item) => (
                        <li key={item.label}>
                          <Link
                            to={item.href}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bloco 2 — Ações rápidas */}
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Ações rápidas</h2>
          <Card>
            <CardContent className="pt-6 grid gap-3 sm:grid-cols-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                asChild
              >
                <a
                  href={user ? `/p/${user.slug}` : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span className="text-sm font-medium">Ver meu portfólio</span>
                </a>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/dashboard/projects/new")}
              >
                <Plus className="h-5 w-5" />
                <span className="text-sm font-medium">Adicionar projeto</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/dashboard/profile")}
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">Editar perfil</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bloco 3 — Vagas recentes */}
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Vagas abertas</h2>
          <Card>
            <CardContent className="pt-6">
              {jobsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm">
                    Nenhuma vaga aberta no momento.{" "}
                    <Link to="/jobs" className="text-primary underline underline-offset-2 hover:opacity-80">
                      Ver todas as vagas
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {jobs.map((job) => (
                    <Link
                      key={job.id}
                      to={`/jobs/${job.slug}`}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="h-10 w-10 rounded-lg shrink-0">
                        <AvatarImage src={job.estudio.logo_url ?? undefined} alt={job.estudio.nome} />
                        <AvatarFallback className="rounded-lg text-xs">
                          {job.estudio.nome.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{job.titulo}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{job.estudio.nome}</span>
                          {(job.cidade || job.estado) && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-0.5">
                                <MapPin className="h-3 w-3" />
                                {[job.cidade, job.estado].filter(Boolean).join(", ")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {nivelLabels[job.nivel] ?? job.nivel}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
