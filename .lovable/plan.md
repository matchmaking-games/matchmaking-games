

# Captura de Links de Fatura do Stripe

## Resumo

Duas alteracoes cirurgicas em Edge Functions existentes para capturar URLs de fatura (invoice) do Stripe quando um pagamento e concluido.

## Alteracao 1: `supabase/functions/create-checkout-session/index.ts`

Adicionar um unico parametro ao `URLSearchParams` na funcao `createStripeCheckoutSession`: `'invoice_creation[enabled]': 'true'`. Isso instrui o Stripe a gerar automaticamente uma fatura para o pagamento one-time.

Local exato: dentro do objeto `URLSearchParams` (por volta da linha 25-40), adicionar a nova entrada junto aos demais parametros.

## Alteracao 2: `supabase/functions/verify-payment/index.ts`

Tres mudancas pontuais:

1. **URL da chamada Stripe**: Na funcao `retrieveStripeSession`, alterar o endpoint de `/v1/checkout/sessions/${sessionId}` para `/v1/checkout/sessions/${sessionId}?expand[]=invoice`.

2. **Tipo de retorno**: Adicionar `invoice` como campo opcional no tipo de retorno da funcao, com a estrutura `{ hosted_invoice_url: string | null; invoice_pdf: string | null } | null`.

3. **Update do pagamento**: No bloco onde `supabaseAdmin` atualiza o registro de pagamento para `completed` (por volta da linha 175-185), adicionar dois campos ao `.update()`: `invoice_url: session.invoice?.hosted_invoice_url ?? null` e `invoice_pdf_url: session.invoice?.invoice_pdf ?? null`.

## O que NAO muda

- Nenhum componente frontend
- Nenhuma migracao SQL (colunas ja existem)
- Logica de autenticacao, validacao, precos, URLs de redirect
- Nenhuma outra Edge Function

