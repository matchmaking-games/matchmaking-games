import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  Briefcase,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStudioJobs, type StudioVaga } from "@/hooks/useStudioJobs";
import { useActiveStudio } from "@/hooks/useActiveStudio";
import { JobsTable } from "@/components/studio/JobsTable";
import { JobsMobileCard } from "@/components/studio/JobsMobileCard";
import { JobsDeleteDialog } from "@/components/studio/JobsDeleteDialog";
import { supabase } from "@/integrations/supabase/client";

type TabValue = "todas" | "ativas" | "inativas" | "expiradas" | "destaque";

export default function StudioJobs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { activeStudio } = useActiveStudio();
  const { vagas, isLoading, error, refetch, toggleAtiva, deleteVaga } = useStudioJobs(activeStudio?.estudio.id ?? null);

  const [activeTab, setActiveTab] = useState<TabValue>("todas");
  const [isToggling, setIsToggling] = useState(false);
  const [deletingVaga, setDeletingVaga] = useState<StudioVaga | null>(null);

  // Payment verification states
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState<"success" | "timeout" | "error" | null>(null);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);

  // Scroll state for tabs navigation
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const hasOverflow = el.scrollWidth > el.clientWidth;
    setCanScrollLeft(hasOverflow && el.scrollLeft > 2);
    setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };

  // Payment verification with polling
  const verifyPaymentWithPolling = useCallback(async (sessionId: string): Promise<boolean> => {
    const MAX_ATTEMPTS = 10;
    const INTERVAL_MS = 2000;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      console.log(`[VERIFY-PAYMENT] Attempt ${attempt}/${MAX_ATTEMPTS}`);

      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { session_id: sessionId },
        });

        if (error) {
          console.error(`[VERIFY-PAYMENT] Error:`, error);
          if (attempt === MAX_ATTEMPTS) throw new Error(error.message || "Erro ao verificar pagamento");
        }

        // Success or already processed
        if (data?.success === true) {
          console.log(`[VERIFY-PAYMENT] Success! Status: ${data.status}`);
          return true;
        }

        // Payment not confirmed yet
        if (data?.status === "unpaid" && attempt < MAX_ATTEMPTS) {
          console.log(`[VERIFY-PAYMENT] Payment not confirmed yet, waiting...`);
          await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
          continue;
        }

        if (data?.error) throw new Error(data.error);
      } catch (err) {
        if (attempt === MAX_ATTEMPTS) throw err;
      }

      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
      }
    }

    return false; // Timeout
  }, []);

  // Handle payment success return from Stripe
  const handlePaymentSuccess = useCallback(
    async (sessionId: string) => {
      setIsVerifyingPayment(true);
      setPaymentResult(null);
      setPaymentErrorMessage(null);

      try {
        const success = await verifyPaymentWithPolling(sessionId);

        if (success) {
          setPaymentResult("success");
          await refetch();
        } else {
          setPaymentResult("timeout");
        }
      } catch (err) {
        console.error("[VERIFY-PAYMENT] Error:", err);
        setPaymentResult("error");
        setPaymentErrorMessage(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsVerifyingPayment(false);
      }

      // Clean query params — use studio from searchParams (came from Stripe redirect)
      const studioParam = searchParams.get("studio");
      const cleanUrl = studioParam
        ? `/studio/manage/jobs?studio=${studioParam}`
        : "/studio/manage/jobs";
      navigate(cleanUrl, { replace: true });
    },
    [verifyPaymentWithPolling, refetch, navigate, searchParams],
  );

  // Detect payment return from Stripe
  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (payment === "success" && sessionId) {
      if (sessionId.startsWith("cs_test_") || sessionId.startsWith("cs_live_")) {
        handlePaymentSuccess(sessionId);
      } else {
        console.warn("[VERIFY-PAYMENT] Invalid session_id format:", sessionId);
        const studioParam = searchParams.get("studio");
        const cleanUrl = studioParam
          ? `/studio/manage/jobs?studio=${studioParam}`
          : "/studio/manage/jobs";
        navigate(cleanUrl, { replace: true });
      }
    }
  }, [searchParams, handlePaymentSuccess, navigate]);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) {
        el.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

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
    );
  }

  // Error state (replaces old access denied + error)
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Erro ao carregar vagas</h2>
        <p className="text-muted-foreground mb-4 text-center max-w-md">{error}</p>
        <Button onClick={() => refetch()}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h1 className="text-2xl font-display font-bold">Minhas Vagas</h1>
              <Button onClick={() => navigate(`/studio/manage/jobs/new?studio=${activeStudio?.estudio.id}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Vaga
              </Button>
            </div>

            {/* Tabs with horizontal scroll */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
              <nav className="relative mb-4 w-full max-w-full overflow-hidden">
                {/* Left fade indicator */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent pointer-events-none z-10 flex items-center justify-start transition-opacity duration-200 ${
                    canScrollLeft ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 text-muted-foreground ml-0.5" />
                </div>

                {/* Scroll container with hidden scrollbar */}
                <div ref={scrollRef} className="w-full overflow-x-auto scrollbar-hide">
                  <TabsList className="inline-flex h-10 items-center justify-start gap-1 rounded-md bg-muted p-1 text-muted-foreground min-w-max">
                    <TabsTrigger value="todas">Todas</TabsTrigger>
                    <TabsTrigger value="ativas">Ativas</TabsTrigger>
                    <TabsTrigger value="inativas">Inativas</TabsTrigger>
                    <TabsTrigger value="expiradas">Expiradas</TabsTrigger>
                    <TabsTrigger value="destaque">Destaque</TabsTrigger>
                  </TabsList>
                </div>

                {/* Right fade indicator */}
                <div
                  className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none z-10 flex items-center justify-end transition-opacity duration-200 ${
                    canScrollRight ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <ChevronRight className="h-4 w-4 text-muted-foreground mr-0.5" />
                </div>
              </nav>
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
                  <Button onClick={() => navigate(`/studio/manage/jobs/new?studio=${activeStudio?.estudio.id}`)}>
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
                studioId={activeStudio?.estudio.id ?? ""}
              />
            ) : (
              <JobsTable
                vagas={filteredVagas}
                onToggleAtiva={handleToggleAtiva}
                onDelete={setDeletingVaga}
                isToggling={isToggling}
                studioId={activeStudio?.estudio.id ?? ""}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <JobsDeleteDialog
        vaga={deletingVaga}
        open={!!deletingVaga}
        onOpenChange={(open) => !open && setDeletingVaga(null)}
        onConfirm={handleDeleteVaga}
      />

      {/* Payment Verification Modals */}

      {/* Loading Modal */}
      <Dialog open={isVerifyingPayment} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <DialogTitle className="text-xl font-semibold mb-2">Confirmando pagamento...</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Estamos verificando seu pagamento com o Stripe.
              <br />
              Isso pode levar alguns segundos.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={paymentResult === "success"} onOpenChange={() => setPaymentResult(null)}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
            <DialogTitle className="text-xl font-semibold mb-2">Pagamento confirmado!</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground mb-6">
              Sua vaga foi publicada com destaque por 30 dias.
            </DialogDescription>
            <Button onClick={() => setPaymentResult(null)} className="w-full">
              Ver minhas vagas
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Timeout Modal */}
      <Dialog open={paymentResult === "timeout"} onOpenChange={() => setPaymentResult(null)}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-6">
            <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <DialogTitle className="text-xl font-semibold mb-2">Confirmação pendente</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground mb-2">
              Seu pagamento está sendo processado. Sua vaga será ativada em alguns minutos.
            </DialogDescription>
            <p className="text-xs text-muted-foreground text-center mb-6">
              Você pode fechar esta página. Te avisaremos quando a vaga for publicada.
            </p>
            <Button onClick={() => setPaymentResult(null)} className="w-full">
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={paymentResult === "error"} onOpenChange={() => setPaymentResult(null)}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-6">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <DialogTitle className="text-xl font-semibold mb-2">Erro ao confirmar pagamento</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground mb-2">
              Não conseguimos confirmar seu pagamento no momento.
            </DialogDescription>
            {paymentErrorMessage && (
              <p className="text-xs text-muted-foreground text-center mb-2">Detalhes: {paymentErrorMessage}</p>
            )}
            <p className="text-xs text-muted-foreground text-center mb-6">
              Se o valor foi debitado, entre em contato com o suporte.
            </p>
            <DialogFooter className="flex gap-2 w-full sm:flex-row">
              <Button variant="outline" onClick={() => setPaymentResult(null)} className="flex-1">
                Voltar
              </Button>
              <Button onClick={() => window.location.reload()} className="flex-1">
                Tentar novamente
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
