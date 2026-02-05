
# Plano: Corrigir Integracao Stripe nas Edge Functions

## Resumo do Problema

As Edge Functions de pagamento estao falhando por dois motivos:

1. **Erro 401 Invalid JWT**: O `verify_jwt = true` no config.toml esta rejeitando tokens validos porque o sistema de signing-keys do Supabase nao e compativel com essa configuracao
2. **Erro Deno Runtime**: O Stripe SDK via esm.sh usa polyfills Node.js que causam `Deno.core.runMicrotasks() is not supported`

## Solucao

### 1. Alterar Config.toml

Mudar `verify_jwt = true` para `verify_jwt = false` em ambas as funcoes.

A validacao JWT ja esta sendo feita manualmente via `getClaims()` no codigo, entao isso e seguro.

```toml
[functions.create-checkout-session]
verify_jwt = false

[functions.verify-payment]
verify_jwt = false
```

---

### 2. Reescrever create-checkout-session/index.ts

Substituir o Stripe SDK por chamadas diretas via `fetch` a API do Stripe.

**Principais mudancas:**

- Remover `import Stripe from "https://esm.sh/stripe@14?target=deno"`
- Criar funcao `createStripeCheckoutSession()` usando fetch
- Pinar versao exata do supabase-js: `@supabase/supabase-js@2.49.1`
- Manter toda a logica de validacao existente

**Estrutura da nova funcao:**

```text
1. CORS preflight handling
2. Verificar Authorization header
3. Criar cliente Supabase com token do usuario
4. Validar JWT via getClaims()
5. Parse request body (vaga_id)
6. Buscar vaga e validar (tipo_publicacao='destaque', status='aguardando_pagamento')
7. Verificar membership do usuario (super_admin)
8. Chamar Stripe API via fetch (POST /v1/checkout/sessions)
9. Inserir registro em pagamentos (via service_role)
10. Retornar URL do checkout
```

**Chamada Stripe via fetch:**

```typescript
const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    'mode': 'payment',
    'payment_method_types[0]': 'card',
    'line_items[0][price_data][currency]': 'brl',
    'line_items[0][price_data][product_data][name]': 'Vaga em Destaque - 30 dias',
    'line_items[0][price_data][product_data][description]': `Destaque para: ${titulo}`,
    'line_items[0][price_data][unit_amount]': '9700',
    'line_items[0][quantity]': '1',
    'metadata[vaga_id]': vaga_id,
    'metadata[estudio_id]': estudio_id,
    'success_url': `${SITE_URL}/studio/jobs?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    'cancel_url': `${SITE_URL}/studio/jobs/${vaga_id}/edit?payment=cancelled`,
  }),
});
```

---

### 3. Reescrever verify-payment/index.ts

Substituir o Stripe SDK por chamadas diretas via `fetch`.

**Principais mudancas:**

- Remover import do Stripe SDK
- Criar funcao `retrieveStripeSession()` usando fetch
- Pinar versao exata do supabase-js

**Chamada Stripe via fetch:**

```typescript
const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
  },
});
```

---

## Arquivos a Modificar

| Arquivo | Acao |
|---------|------|
| `supabase/config.toml` | Mudar verify_jwt para false |
| `supabase/functions/create-checkout-session/index.ts` | Reescrever com fetch |
| `supabase/functions/verify-payment/index.ts` | Reescrever com fetch |

---

## Fluxo Apos Correcao

```text
Frontend (useJobForm.ts)
    |
    v
supabase.functions.invoke('create-checkout-session', { body: { vaga_id } })
    |
    v
Edge Function (verify_jwt = false)
    |
    +-- Valida JWT manualmente via getClaims()
    +-- Busca vaga, valida status/tipo
    +-- Verifica membership super_admin
    +-- Chama Stripe API via fetch (nao SDK)
    +-- Insere registro em pagamentos
    +-- Retorna { url: checkout_url }
    |
    v
Frontend redireciona para Stripe Checkout
    |
    v
Usuario paga
    |
    v
Stripe redireciona para /studio/jobs?payment=success&session_id=cs_xxx
    |
    v
Frontend chama verify-payment
    |
    v
Edge Function valida no Stripe via fetch
    |
    v
Atualiza vaga para publicada
```

---

## Seguranca

- JWT continua sendo validado (agora manualmente via getClaims)
- Stripe Secret Key nunca exposta ao frontend
- RLS protege tabela pagamentos
- Preco hardcoded no servidor (9700 centavos = R$ 97)

---

## Resultado Esperado

Apos implementacao:

- Sem erro 401 Invalid JWT
- Sem erro Deno.core.runMicrotasks()
- Fluxo de pagamento completo funcionando
- Vaga ativada automaticamente apos pagamento confirmado

