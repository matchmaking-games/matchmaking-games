import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Briefcase, AlertTriangle, Loader2 } from "lucide-react";
import { StudioDashboardLayout } from "@/components/studio/StudioDashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStudioJobs, type StudioVaga } from "@/hooks/useStudioJobs";
import { JobsTable } from "@/components/studio/JobsTable";
import { JobsMobileCard } from "@/components/studio/JobsMobileCard";
import { JobsDeleteDialog } from "@/components/studio/JobsDeleteDialog";

type TabValue = "todas" | "ativas" | "inativas" | "expiradas" | "destaque";

export default function StudioJobs() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { vagas, isLoading, error, isAuthorized, refetch, toggleAtiva, deleteVaga } = useStudioJobs();

  const [activeTab, setActiveTab] = useState<TabValue>("todas");
  const [isToggling, setIsToggling] = useState(false);
  const [deletingVaga, setDeletingVaga] = useState<StudioVaga | null>(null);

  const filteredVagas = useMemo(() => {
    const now = new Date();

    switch (activeTab) {
      case "ativas":
        return vagas.filter((v) => v.ativa && v.expira_em && new Date(v.expira_em) > now);
      case "inativas":
        return vagas.filter((v) => !v.ativa);
      case "expiradas":
        return vagas.filter((v) => v.expira_em && new Date(v.expira_em) < now);
      case "destaque":
        return vagas.filter((v) => v.tipo_publicacao === "destaque");
      default:
        return vagas;
    }
  }, [vagas, activeTab]);

  const handleToggleAtiva = async (vaga: StudioVaga) => {
    try {
      setIsToggling(true);

      const newValue = !vaga.ativa;
      await toggleAtiva(vaga.id, vaga.ativa ?? false);

      toast({
        title: newValue ? "Vaga ativada" : "Vaga desativada",
        description: `A vaga "${vaga.titulo}" foi ${newValue ? "ativada" : "desativada"}.`,
      });

      await refetch();
    } catch (err) {
      console.error("Error toggling vaga:", err);
      toast({
        title: "Erro ao atualizar vaga",
        description: "Não foi possível alterar o status. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleDeleteVaga = async () => {
    if (!deletingVaga) return;

    await deleteVaga(deletingVaga.id);
    await refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <StudioDashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </StudioDashboardLayout>
    );
  }

  // Access denied state
  if (!isAuthorized) {
    return (
      <StudioDashboardLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acesso negado</h2>
          <p className="text-muted-foreground mb-4 text-center max-w-md">{error}</p>
          <Button onClick={() => navigate("/dashboard")}>Voltar ao Dashboard</Button>
        </div>
      </StudioDashboardLayout>
    );
  }

  // Error state
  if (error && isAuthorized) {
    return (
      <StudioDashboardLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erro ao carregar vagas</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => refetch()}>Tentar novamente</Button>
        </div>
      </StudioDashboardLayout>
    );
  }

  return (
    <StudioDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-display font-bold">Minhas Vagas</h1>
          <Button onClick={() => navigate("/studio/jobs/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Vaga
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="ativas">Ativas</TabsTrigger>
            <TabsTrigger value="inativas">Inativas</TabsTrigger>
            <TabsTrigger value="expiradas">Expiradas</TabsTrigger>
            <TabsTrigger value="destaque">Destaque</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Content */}
        {filteredVagas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {activeTab === "todas"
                ? "Nenhuma vaga publicada ainda"
                : `Nenhuma vaga ${activeTab === "destaque" ? "em destaque" : activeTab}`}
            </h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              {activeTab === "todas"
                ? "Comece publicando sua primeira vaga para atrair talentos"
                : "Não há vagas nesta categoria"}
            </p>
            {activeTab === "todas" && (
              <Button onClick={() => navigate("/studio/jobs/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Publicar Vaga
              </Button>
            )}
          </div>
        ) : isMobile ? (
          <JobsMobileCard
            vagas={filteredVagas}
            onToggleAtiva={handleToggleAtiva}
            onDelete={setDeletingVaga}
            isToggling={isToggling}
          />
        ) : (
          <JobsTable
            vagas={filteredVagas}
            onToggleAtiva={handleToggleAtiva}
            onDelete={setDeletingVaga}
            isToggling={isToggling}
          />
        )}
      </div>

      {/* Delete Dialog */}
      <JobsDeleteDialog
        vaga={deletingVaga}
        open={!!deletingVaga}
        onOpenChange={(open) => !open && setDeletingVaga(null)}
        onConfirm={handleDeleteVaga}
      />
    </StudioDashboardLayout>
  );
}
