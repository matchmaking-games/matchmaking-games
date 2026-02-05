
# Plano: Corrigir Autenticacao no verify-payment

## Problema

A Edge Function `verify-payment` esta falhando com o erro:

```
supabase.auth.getClaims is not a function
```

Este e o mesmo erro que foi corrigido em `create-checkout-session`. O metodo `getClaims()` nao existe na versao atual do cliente Supabase.

---

## Solucao

Aplicar a mesma correcao feita em `create-checkout-session`:

**Arquivo:** `supabase/functions/verify-payment/index.ts`

**Mudanca:** Substituir `getClaims(token)` por `getUser()`

### Codigo Atual (linhas 46-60)

```typescript
// Obter usuário autenticado via getClaims
const token = authHeader.replace("Bearer ", "");
const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

if (claimsError || !claimsData?.claims) {
  logStep("ERROR: Invalid token", { error: claimsError?.message });
  return new Response(
    JSON.stringify({ error: "Token inválido" }),
    { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

const userId = claimsData.claims.sub;
```

### Codigo Corrigido

```typescript
// Obter usuário autenticado via getUser
const { data: { user }, error: userError } = await supabase.auth.getUser();

if (userError || !user) {
  logStep("ERROR: Invalid token", { error: userError?.message });
  return new Response(
    JSON.stringify({ error: "Token inválido" }),
    { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

const userId = user.id;
```

---

## Impacto

- Remove a linha `const token = authHeader.replace("Bearer ", "");` (nao e mais necessaria)
- Substitui `getClaims(token)` por `getUser()` (metodo correto)
- Atualiza variaveis de `claimsData/claimsError` para `user/userError`
- Muda `claimsData.claims.sub` para `user.id`

---

## Resultado Esperado

Apos esta correcao:

1. O usuario completa pagamento no Stripe
2. Stripe redireciona para `/studio/jobs?payment=success&session_id=cs_xxx`
3. Frontend chama `verify-payment` com o session_id
4. Edge Function valida JWT via `getUser()` (sem erro)
5. Verifica pagamento no Stripe via fetch
6. Atualiza vaga para `status='publicada'`
7. Retorna sucesso ao frontend
8. Modal de sucesso aparece para o usuario
