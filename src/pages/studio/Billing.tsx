import { CreditCard, ExternalLink, Download, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useActiveStudio } from "@/hooks/useActiveStudio";
import { usePagamentos } from "@/hooks/usePagamentos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function StatusBadge({ status }: { status: string | null }) {
  if (status === "completed") {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15">
        Pago
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/15">
        Aguardando
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">—</Badge>
  );
}

function BillingSkeletons() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Billing() {
  const { activeStudio } = useActiveStudio();
  const { pagamentos, isLoading, error, refetch } = usePagamentos(
    activeStudio?.estudio.id ?? null
  );

  return (
      <div className="max-w-4xl space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="font-display font-bold text-3xl text-foreground">Faturas</h1>
          </div>
          <p className="text-muted-foreground text-[15px]">
            Histórico de pagamentos do estúdio
          </p>
        </div>

        {isLoading && <BillingSkeletons />}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center space-y-3">
            <AlertCircle className="h-6 w-6 text-destructive mx-auto" />
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !error && pagamentos.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-[15px]">
              Nenhuma fatura encontrada. Suas faturas aparecerão aqui após a publicação de vagas em destaque.
            </p>
          </div>
        )}

        {!isLoading && !error && pagamentos.length > 0 && (
          <div className="space-y-3">
            {pagamentos.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-card/80"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-sans font-medium text-[15px] text-foreground truncate">
                      {p.vaga?.titulo ?? (
                        <span className="text-muted-foreground">Vaga removida</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {p.criado_em
                        ? format(new Date(p.criado_em), "dd/MM/yyyy", { locale: ptBR })
                        : "—"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-sans font-semibold text-[15px] text-foreground whitespace-nowrap">
                      {(p.amount / 100).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>

                    <StatusBadge status={p.status} />

                    {p.invoice_url || p.invoice_pdf_url ? (
                      <div className="flex items-center gap-2">
                        {p.invoice_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={p.invoice_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1.5" />
                              Ver fatura
                            </a>
                          </Button>
                        )}
                        {p.invoice_pdf_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={p.invoice_pdf_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1.5" />
                              Baixar PDF
                            </a>
                          </Button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Fatura não disponível para este pagamento.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}
