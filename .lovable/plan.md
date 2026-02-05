

# Plano: Completar Fluxo de Verificacao de Pagamento no Frontend

## Resumo
Implementar a logica de verificacao de pagamento quando o usuario retorna do Stripe Checkout, incluindo polling com retry, modais de feedback e tratamento de cancelamento.

**IMPORTANTE**: Sua implementacao atual esta CORRETA. Nao deletar Edge Functions ou tabela pagamentos - apenas adicionar a logica de frontend que esta faltando.

---

## O Que Ja Esta Funcionando (NAO MODIFICAR)

- `supabase/functions/create-checkout-session/index.ts` - Cria sessao Stripe
- `supabase/functions/verify-payment/index.ts` - Verifica pagamento no Stripe
- Tabela `pagamentos` com RLS
- `src/hooks/useJobForm.ts` - Salva vaga e redireciona para Stripe
- `src/pages/studio/JobForm.tsx` - UI do formulario
- Secrets: STRIPE_SECRET_KEY, SITE_URL

---

## Arquivos a Modificar

### 1. `src/pages/studio/Jobs.tsx`

Adicionar toda a logica de deteccao de retorno do Stripe e verificacao de pagamento.

**Alteracoes:**

#### 1.1 Novos Imports
```typescript
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
```

#### 1.2 Novos Estados
```typescript
const [searchParams] = useSearchParams();
const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
const [paymentResult, setPaymentResult] = useState<'success' | 'timeout' | 'error' | null>(null);
const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);
```

#### 1.3 Funcao de Polling com Retry
```typescript
const verifyPaymentWithPolling = async (sessionId: string): Promise<boolean> => {
  const MAX_ATTEMPTS = 10;
  const INTERVAL_MS = 2000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`[VERIFY-PAYMENT] Attempt ${attempt}/${MAX_ATTEMPTS}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { session_id: sessionId }
      });

      if (error) {
        console.error(`[VERIFY-PAYMENT] Error:`, error);
        if (attempt === MAX_ATTEMPTS) throw new Error(error.message || 'Erro ao verificar pagamento');
      }

      // Sucesso ou ja processado
      if (data?.success === true) {
        console.log(`[VERIFY-PAYMENT] Success! Status: ${data.status}`);
        return true;
      }

      // Pagamento ainda nao confirmado
      if (data?.status === 'unpaid' && attempt < MAX_ATTEMPTS) {
        console.log(`[VERIFY-PAYMENT] Payment not confirmed yet, waiting...`);
        await new Promise(resolve => setTimeout(resolve, INTERVAL_MS));
        continue;
      }

      if (data?.error) throw new Error(data.error);

    } catch (err) {
      if (attempt === MAX_ATTEMPTS) throw err;
    }

    if (attempt < MAX_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, INTERVAL_MS));
    }
  }

  return false; // Timeout
};
```

#### 1.4 Handler de Retorno Success
```typescript
const handlePaymentSuccess = async (sessionId: string) => {
  setIsVerifyingPayment(true);
  setPaymentResult(null);
  setPaymentErrorMessage(null);

  try {
    const success = await verifyPaymentWithPolling(sessionId);
    
    if (success) {
      setPaymentResult('success');
      await refetch(); // Recarregar lista de vagas
    } else {
      setPaymentResult('timeout');
    }
  } catch (err) {
    console.error('[VERIFY-PAYMENT] Error:', err);
    setPaymentResult('error');
    setPaymentErrorMessage(err instanceof Error ? err.message : 'Erro desconhecido');
  } finally {
    setIsVerifyingPayment(false);
  }

  // Limpar query params
  navigate('/studio/jobs', { replace: true });
};
```

#### 1.5 useEffect para Detectar Query Params
```typescript
useEffect(() => {
  const payment = searchParams.get('payment');
  const sessionId = searchParams.get('session_id');

  if (payment === 'success' && sessionId) {
    if (sessionId.startsWith('cs_test_') || sessionId.startsWith('cs_live_')) {
      handlePaymentSuccess(sessionId);
    } else {
      console.warn('[VERIFY-PAYMENT] Invalid session_id format:', sessionId);
      navigate('/studio/jobs', { replace: true });
    }
  }
}, [searchParams]);
```

#### 1.6 Modais de Feedback (adicionar no JSX, antes do fechamento de StudioDashboardLayout)

**Modal de Loading:**
```tsx
<Dialog open={isVerifyingPayment} onOpenChange={() => {}}>
  <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
      <DialogTitle className="text-xl font-semibold mb-2">
        Confirmando pagamento...
      </DialogTitle>
      <DialogDescription className="text-center text-muted-foreground">
        Estamos verificando seu pagamento com o Stripe.
        <br />
        Isso pode levar alguns segundos.
      </DialogDescription>
    </div>
  </DialogContent>
</Dialog>
```

**Modal de Sucesso:**
```tsx
<Dialog open={paymentResult === 'success'} onOpenChange={() => setPaymentResult(null)}>
  <DialogContent className="sm:max-w-md">
    <div className="flex flex-col items-center justify-center py-6">
      <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
      <DialogTitle className="text-xl font-semibold mb-2">
        Pagamento confirmado!
      </DialogTitle>
      <DialogDescription className="text-center text-muted-foreground mb-6">
        Sua vaga foi publicada com destaque por 30 dias.
      </DialogDescription>
      <Button onClick={() => setPaymentResult(null)} className="w-full">
        Ver minhas vagas
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

**Modal de Timeout:**
```tsx
<Dialog open={paymentResult === 'timeout'} onOpenChange={() => setPaymentResult(null)}>
  <DialogContent className="sm:max-w-md">
    <div className="flex flex-col items-center justify-center py-6">
      <AlertCircle className="h-16 w-16 text-yellow-500 mb-4" />
      <DialogTitle className="text-xl font-semibold mb-2">
        Confirmacao pendente
      </DialogTitle>
      <DialogDescription className="text-center text-muted-foreground mb-2">
        Seu pagamento esta sendo processado. Sua vaga sera ativada em alguns minutos.
      </DialogDescription>
      <p className="text-xs text-muted-foreground text-center mb-6">
        Voce pode fechar esta pagina. Te avisaremos quando a vaga for publicada.
      </p>
      <Button onClick={() => setPaymentResult(null)} className="w-full">
        Entendi
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

**Modal de Erro:**
```tsx
<Dialog open={paymentResult === 'error'} onOpenChange={() => setPaymentResult(null)}>
  <DialogContent className="sm:max-w-md">
    <div className="flex flex-col items-center justify-center py-6">
      <XCircle className="h-16 w-16 text-destructive mb-4" />
      <DialogTitle className="text-xl font-semibold mb-2">
        Erro ao confirmar pagamento
      </DialogTitle>
      <DialogDescription className="text-center text-muted-foreground mb-2">
        Nao conseguimos confirmar seu pagamento no momento.
      </DialogDescription>
      {paymentErrorMessage && (
        <p className="text-xs text-muted-foreground text-center mb-2">
          Detalhes: {paymentErrorMessage}
        </p>
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
```

---

### 2. `src/pages/studio/JobForm.tsx`

Adicionar tratamento do query param `?payment=cancelled`.

**Alteracoes:**

#### 2.1 Novos Imports
```typescript
import { useSearchParams } from "react-router-dom";
```

#### 2.2 Hook e useEffect para Cancelamento
```typescript
const [searchParams] = useSearchParams();

useEffect(() => {
  const payment = searchParams.get('payment');
  
  if (payment === 'cancelled') {
    toast({
      title: "Pagamento cancelado",
      description: "Voce pode ajustar a vaga e tentar publicar novamente.",
    });
    
    // Limpar query param
    navigate(window.location.pathname, { replace: true });
  }
}, [searchParams, toast, navigate]);
```

---

## Fluxos Resultantes

### Cenario 1: Pagamento Bem-Sucedido
```text
1. Stripe redireciona: /studio/jobs?payment=success&session_id=cs_xxx
2. useEffect detecta query params
3. Modal loading aparece IMEDIATAMENTE
4. verifyPaymentWithPolling() inicia (2s x 10 tentativas)
5. Edge Function retorna { success: true }
6. Modal loading fecha, Modal sucesso aparece
7. refetch() recarrega lista de vagas
8. navigate() limpa query params
9. Usuario clica "Ver minhas vagas"
10. Vaga aparece na lista com destaque
```

### Cenario 2: Pagamento Cancelado
```text
1. Stripe redireciona: /studio/jobs/:id/edit?payment=cancelled
2. useEffect em JobForm.tsx detecta query param
3. Toast informativo aparece
4. Query param removido da URL
5. Usuario continua editando vaga
```

### Cenario 3: Timeout (20 segundos)
```text
1-4. [mesmo do cenario 1]
5. 10 tentativas sem sucesso
6. Modal timeout aparece
7. Usuario clica "Entendi"
8. Vaga sera ativada por webhook em background (se implementado)
```

---

## Seguranca Garantida

- Query params NAO sao confiados - apenas disparam verificacao
- Edge Function `verify-payment` valida DIRETAMENTE no Stripe
- Vaga so ativada pela Edge Function (service_role)
- Frontend nao tem permissao para UPDATE direto em vagas
- Session ID fake resulta em erro
- Fluxo idempotente (pode verificar multiplas vezes)

---

## NAO FAZER

- NAO deletar Edge Functions existentes
- NAO deletar tabela pagamentos
- NAO modificar useJobForm.ts (ja esta correto)
- NAO modificar logica do JobForm.tsx (alem do cancel handler)

