

# Correcao do success_url no fluxo de pagamento Stripe

## Diagnostico

Apos inspecionar os dois arquivos:

- **`src/pages/studio/Jobs.tsx`**: As duas chamadas `navigate` nas linhas 131 e 146 ja incluem o parametro `?studio=${activeStudio?.estudio.id}`. O Bug 2 ja foi corrigido anteriormente.

- **`supabase/functions/create-checkout-session/index.ts`**: A linha 39 ainda aponta para `/studio/manage/dashboard` em vez de `/studio/manage/jobs`. Este e o unico bug remanescente.

## Alteracao necessaria

### Arquivo: `supabase/functions/create-checkout-session/index.ts`

**Linha 39** -- trocar `/studio/manage/dashboard` por `/studio/manage/jobs` no `success_url`:

```text
// DE:
success_url: `${siteUrl}/studio/manage/dashboard?studio=${estudioId}&payment=success&session_id={CHECKOUT_SESSION_ID}`,

// PARA:
success_url: `${siteUrl}/studio/manage/jobs?studio=${estudioId}&payment=success&session_id={CHECKOUT_SESSION_ID}`,
```

Nenhuma outra alteracao. O `cancel_url` na linha 40 permanece inalterado. O `{CHECKOUT_SESSION_ID}` e mantido intacto (variavel do Stripe). Apos a alteracao, a edge function sera redeployada automaticamente.
