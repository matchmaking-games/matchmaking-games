

# Plano Revisado: Integracao Stripe para Vagas em Destaque

## Objetivo
Implementar o fluxo completo de pagamento via Stripe para vagas em destaque (R$ 97,00), incluindo Edge Functions seguras e tabela de pagamentos.

---

## Pre-requisitos (Acoes do Usuario)

**Secrets a configurar no Supabase:**
- `STRIPE_SECRET_KEY`: Chave secreta do Stripe (sk_live_... ou sk_test_...)
- `SITE_URL`: URL base da aplicacao (ex: https://matchmaking-games.lovable.app)

**Importante:** Antes de implementar, vou solicitar a habilitacao do Stripe atraves da ferramenta de integracao. Isso ira pedir a chave secreta automaticamente.

---

## Arquivos a Criar

**Arquivo 1:**
- Caminho: `supabase/functions/create-checkout-session/index.ts`
- Descricao: Edge Function para criar sessao Stripe Checkout

**Arquivo 2:**
- Caminho: `supabase/functions/verify-payment/index.ts`
- Descricao: Edge Function para verificar pagamento e ativar vaga

---

## Arquivos a Modificar

**Arquivo 1:**
- Caminho: `supabase/config.toml`
- Alteracao: Adicionar configuracao das novas Edge Functions com verify_jwt = true

---

## Migracao de Banco de Dados

### Migracao Unica: Criar tabela pagamentos

**Nota:** O campo `status` ja existe na tabela `vagas` como tipo `text` com default 'publicada'. Nao e necessaria migracao para a tabela vagas.

```sql
CREATE TABLE pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudio_id UUID NOT NULL REFERENCES estudios(id) ON DELETE CASCADE,
  vaga_id UUID REFERENCES vagas(id) ON DELETE SET NULL,
  stripe_session_id TEXT NOT NULL,
  stripe_payment_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'brl',
  status TEXT DEFAULT 'pending',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stripe_session_id)
);

-- RLS
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- Apenas super_admin do estudio pode VER pagamentos
CREATE POLICY "Studio ve proprios pagamentos" ON pagamentos
FOR SELECT
USING (
  estudio_id IN (
    SELECT estudio_id FROM estudio_membros
    WHERE user_id = auth.uid() 
      AND role = 'super_admin'
      AND ativo = true
  )
);

-- INSERT/UPDATE bloqueado para usuarios (apenas service_role via Edge Functions)
-- Nao criar policies de INSERT/UPDATE = bloqueado por padrao
```

---

## Secao Tecnica

### 1. Configuracao do supabase/config.toml (Correcao 3)

```toml
project_id = "njyoimhjfqtygnlccjzq"

[functions.create-checkout-session]
verify_jwt = true

[functions.verify-payment]
verify_jwt = true
```

**Beneficio:** Com `verify_jwt = true`, o Supabase valida o JWT automaticamente. Nao e necessario codigo manual de validacao.

---

### 2. Edge Function: create-checkout-session

**Endpoint:** POST /functions/v1/create-checkout-session

**Request Body:**
```json
{
  "vaga_id": "uuid-da-vaga"
}
```

**Fluxo Simplificado (com verify_jwt = true):**

1. JWT ja validado automaticamente pelo Supabase
2. Extrair user_id do contexto autenticado
3. Buscar vaga pelo ID
4. Validar que vaga existe
5. Validar que `vaga.tipo_publicacao === 'destaque'`
6. Validar que `vaga.status === 'aguardando_pagamento'`
7. Buscar membership do usuario em `estudio_membros`
8. Validar que usuario e `super_admin` do estudio da vaga
9. Criar sessao Stripe Checkout com preco HARDCODED (9700 centavos)
10. Inserir registro na tabela `pagamentos` com status 'pending' usando service_role
11. Retornar URL da sessao

**Configuracao Stripe (Correcao 2 - apenas cartao):**
```javascript
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  payment_method_types: ['card'],  // APENAS cartao para MVP
  line_items: [{
    price_data: {
      currency: 'brl',
      product_data: {
        name: 'Vaga em Destaque - 30 dias',
        description: 'Sua vaga ficara no topo da lista por 30 dias'
      },
      unit_amount: 9700, // HARDCODED - R$ 97,00
    },
    quantity: 1,
  }],
  metadata: {
    vaga_id: vaga.id,
    estudio_id: vaga.estudio_id,
  },
  success_url: `${SITE_URL}/studio/jobs?payment=success&session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${SITE_URL}/studio/jobs/${vaga.id}/edit?payment=cancelled`,
});
```

**Codigo simplificado da Edge Function:**
```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Nao autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Criar cliente Supabase com token do usuario
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Obter usuario autenticado
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Token invalido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    const { vaga_id } = await req.json();

    // Buscar vaga
    const { data: vaga, error: vagaError } = await supabase
      .from("vagas")
      .select("id, estudio_id, tipo_publicacao, status, titulo")
      .eq("id", vaga_id)
      .single();

    if (vagaError || !vaga) {
      return new Response(
        JSON.stringify({ error: "Vaga nao encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar tipo e status
    if (vaga.tipo_publicacao !== "destaque") {
      return new Response(
        JSON.stringify({ error: "Esta vaga nao e do tipo destaque" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (vaga.status !== "aguardando_pagamento") {
      return new Response(
        JSON.stringify({ error: "Status invalido para pagamento" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar membership
    const { data: membership, error: membershipError } = await supabase
      .from("estudio_membros")
      .select("role")
      .eq("user_id", userId)
      .eq("estudio_id", vaga.estudio_id)
      .eq("ativo", true)
      .single();

    if (membershipError || !membership || membership.role !== "super_admin") {
      return new Response(
        JSON.stringify({ error: "Sem permissao para esta acao" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Criar sessao Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    const SITE_URL = Deno.env.get("SITE_URL") || "https://matchmaking-games.lovable.app";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "brl",
          product_data: {
            name: "Vaga em Destaque - 30 dias",
            description: `Destaque para: ${vaga.titulo}`,
          },
          unit_amount: 9700, // R$ 97,00 HARDCODED
        },
        quantity: 1,
      }],
      metadata: {
        vaga_id: vaga.id,
        estudio_id: vaga.estudio_id,
      },
      success_url: `${SITE_URL}/studio/jobs?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/studio/jobs/${vaga.id}/edit?payment=cancelled`,
    });

    // Inserir pagamento com service_role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabaseAdmin.from("pagamentos").insert({
      estudio_id: vaga.estudio_id,
      vaga_id: vaga.id,
      stripe_session_id: session.id,
      amount: 9700,
      currency: "brl",
      status: "pending",
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

### 3. Edge Function: verify-payment

**Endpoint:** POST /functions/v1/verify-payment

**Request Body:**
```json
{
  "session_id": "cs_xxx..."
}
```

**Fluxo:**

1. JWT ja validado automaticamente
2. Extrair user_id do contexto
3. Consultar sessao DIRETO no Stripe: `stripe.checkout.sessions.retrieve(session_id)`
4. Validar que `session.payment_status === 'paid'`
5. Extrair `vaga_id` da metadata da sessao
6. Buscar vaga e validar ownership (pertence a estudio do usuario)
7. Validar que `vaga.status === 'aguardando_pagamento'`
8. Buscar registro em `pagamentos` com este session_id
9. Validar que nao foi processado antes (status !== 'completed')
10. Usar service_role para:
    - Atualizar vaga: `status = 'publicada'`, `ativa = true`
    - Atualizar pagamento: `status = 'completed'`, `stripe_payment_id = session.payment_intent`
11. Retornar sucesso

**Codigo da Edge Function:**
```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Nao autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Token invalido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    const { session_id } = await req.json();

    if (!session_id) {
      return new Response(
        JSON.stringify({ error: "session_id obrigatorio" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Consultar Stripe diretamente
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ success: false, status: "unpaid", error: "Pagamento nao confirmado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const vagaId = session.metadata?.vaga_id;
    const estudioId = session.metadata?.estudio_id;

    if (!vagaId || !estudioId) {
      return new Response(
        JSON.stringify({ error: "Metadata invalida na sessao" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar ownership
    const { data: membership } = await supabase
      .from("estudio_membros")
      .select("role")
      .eq("user_id", userId)
      .eq("estudio_id", estudioId)
      .eq("ativo", true)
      .single();

    if (!membership || membership.role !== "super_admin") {
      return new Response(
        JSON.stringify({ error: "Sem permissao" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar vaga
    const { data: vaga } = await supabase
      .from("vagas")
      .select("id, status")
      .eq("id", vagaId)
      .single();

    if (!vaga || vaga.status !== "aguardando_pagamento") {
      return new Response(
        JSON.stringify({ error: "Vaga ja foi processada ou nao encontrada" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar se pagamento ja foi processado
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: pagamento } = await supabaseAdmin
      .from("pagamentos")
      .select("id, status")
      .eq("stripe_session_id", session_id)
      .single();

    if (pagamento?.status === "completed") {
      return new Response(
        JSON.stringify({ success: true, status: "already_processed", vaga_id: vagaId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Atualizar vaga
    await supabaseAdmin
      .from("vagas")
      .update({ status: "publicada", ativa: true })
      .eq("id", vagaId);

    // Atualizar pagamento
    if (pagamento) {
      await supabaseAdmin
        .from("pagamentos")
        .update({
          status: "completed",
          stripe_payment_id: session.payment_intent as string,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", pagamento.id);
    }

    return new Response(
      JSON.stringify({ success: true, status: "paid", vaga_id: vagaId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

### 4. Fluxo Completo de Pagamento

```text
1. Usuario cria vaga com tipo_publicacao = 'destaque'
   |
2. Frontend salva vaga:
   - status = 'aguardando_pagamento'
   - ativa = false
   |
3. Frontend chama POST /create-checkout-session
   - Body: { vaga_id: "xxx" }
   |
4. Edge Function valida e cria sessao Stripe
   |
5. Frontend recebe URL e redireciona: window.location.href = url
   |
6. Usuario paga no Stripe Checkout (apenas cartao)
   |
7. Stripe redireciona para success_url com session_id
   |
8. Frontend chama POST /verify-payment
   - Body: { session_id: "cs_xxx" }
   |
9. Edge Function consulta Stripe e ativa vaga
   |
10. Frontend mostra toast de sucesso
```

---

### 5. Validacoes de Seguranca Implementadas

**Prevencao de Manipulacao de Preco:**
- Preco HARDCODED no servidor (9700 centavos)
- Nunca aceita amount do body da requisicao

**Prevencao de Bypass de Pagamento:**
- verify-payment consulta Stripe diretamente
- Nao confia em query params para ativar
- Valida payment_status === 'paid'

**Prevencao de Acesso Nao Autorizado:**
- verify_jwt = true valida JWT automaticamente
- Verifica membership em estudio_membros
- Confirma role === 'super_admin'
- Confirma vaga.estudio_id === membership.estudio_id

**Prevencao de Processamento Duplo:**
- Usa UNIQUE em stripe_session_id
- Verifica status !== 'completed' antes de processar
- Retorna sucesso se ja processado (idempotente)

---

### 6. Uso das Edge Functions (Documentacao)

**Chamar create-checkout-session:**
```typescript
const { data, error } = await supabase.functions.invoke('create-checkout-session', {
  body: { vaga_id: 'uuid-da-vaga' }
});

if (data?.url) {
  window.location.href = data.url;
}
```

**Chamar verify-payment:**
```typescript
const sessionId = new URLSearchParams(window.location.search).get('session_id');

const { data, error } = await supabase.functions.invoke('verify-payment', {
  body: { session_id: sessionId }
});

if (data?.success) {
  toast({ title: 'Pagamento confirmado!' });
}
```

---

## Resumo das Correcoes Aplicadas

**Correcao 1:** Removida "Migracao 1" - o campo `status` ja existe na tabela `vagas` como tipo `text` com default 'publicada'

**Correcao 2:** Metodo de pagamento simplificado para apenas cartao: `payment_method_types: ['card']`

**Correcao 3:** Configuracao `verify_jwt = true` nas Edge Functions, simplificando o codigo de autenticacao

---

## Fluxo de Implementacao

1. Habilitar integracao Stripe (solicitar chave secreta)
2. Criar migracao para tabela `pagamentos` com RLS
3. Criar Edge Function `create-checkout-session`
4. Criar Edge Function `verify-payment`
5. Atualizar `supabase/config.toml`
6. Testar Edge Functions com tool de curl
7. Documentar uso para frontend

