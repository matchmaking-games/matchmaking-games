import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Briefcase, FileText, Clock, Sparkles, Plus, Settings, ExternalLink } from "lucide-react";

import { useActiveStudio } from "@/hooks/useActiveStudio";
import { useStudioDashboardStats } from "@/hooks/useStudioDashboardStats";
import { useStudioInviteCTA } from "@/hooks/useStudioInviteCTA";
import { StudioInviteCTACard } from "@/components/studio/StudioInviteCTACard";
import { StudioProfileCompletion } from "@/components/studio/StudioProfileCompletion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const statCards = [
  { key: "ativas" as const, label: "Ativas", icon: Briefcase, color: "text-primary" },
  { key: "rascunhos" as const, label: "Rascunhos", icon: FileText, color: "text-muted-foreground" },
  { key: "expiradas" as const, label: "Expiradas", icon: Clock, color: "text-muted-foreground" },
  { key: "destaque" as const, label: "Em destaque", icon: Sparkles, color: "text-primary" },
];

export default function StudioDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { activeStudio } = useActiveStudio();
  const estudioId = activeStudio?.estudio.id ?? null;
  const { stats, isLoading } = useStudioDashboardStats(estudioId);
  const { showCTA, isLoading: ctaLoading, dismiss } = useStudioInviteCTA(estudioId);

  // Detect payment cancellation from Stripe redirect
  useEffect(() => {
    if (searchParams.get("payment") === "cancelled") {
      toast({
        title: "Pagamento não concluído",
        description: "Sua vaga foi salva e está aguardando pagamento. Acesse 'Minhas Vagas' para retomar.",
      });
      const studioParam = searchParams.get("studio");
      navigate(
        studioParam ? `/studio/manage/dashboard?studio=${studioParam}` : "/studio/manage/dashboard",
        { replace: true },
      );
    }
  }, [searchParams, toast, navigate]);

  const hasNoJobs =
    stats && stats.ativas === 0 && stats.rascunhos === 0 && stats.expiradas === 0 && stats.destaque === 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Bloco 1 — Resumo de vagas */}
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-4">Suas Vagas</h2>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6 flex flex-col items-center gap-2">
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : hasNoJobs ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Nenhuma vaga publicada ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ key, label, icon: Icon, color }) => (
              <Card key={key}>
                <CardContent className="pt-6 flex flex-col items-center gap-1">
                  <Icon className={`h-5 w-5 ${color} mb-1`} />
                  <span className="font-display text-3xl font-bold text-foreground">{stats?.[key] ?? 0}</span>
                  <span className="text-sm text-muted-foreground">{label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showCTA && !ctaLoading && estudioId && (
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            Sua equipe
          </h2>
          <StudioInviteCTACard onDismiss={dismiss} estudioId={estudioId} />
        </div>
      )}

      {/* Bloco 2 — Ações rápidas */}
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-4">Ações rápidas</h2>
        <Card>
          <CardContent className="pt-6 grid gap-3 sm:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate(`/studio/manage/jobs/new?studio=${activeStudio?.estudio.id}`)}
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm font-medium">Publicar nova vaga</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => navigate(`/studio/manage/profile?studio=${activeStudio?.estudio.id}`)}
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm font-medium">Editar perfil do estúdio</span>
            </Button>

            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
              <a href={`/studio/${activeStudio?.estudio.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-5 w-5" />
                <span className="text-sm font-medium">Ver página pública</span>
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
