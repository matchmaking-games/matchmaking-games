
# Correcao Definitiva: Publicacao de Vagas

## Diagnostico

O `form.trigger()` (linha 386) depende do `zodResolver` do react-hook-form para validar. Esse resolver pode ter problemas de sincronizacao de estado interno -- o valor esta no form, mas o resolver nao reconhece na hora do trigger. Resultado: retorna `false` sem dizer qual campo falhou, e o toast generico "Preencha todos os campos obrigatorios" aparece.

## Causa Raiz

`form.trigger()` e uma caixa preta. Nao sabemos qual campo falha porque usamos um toast generico. A solucao anterior tentou "consertar" adicionando `form.setValue` e checagens manuais antes do trigger, mas o trigger em si continua falhando por problemas internos do zodResolver.

## Solucao Definitiva

**Substituir `form.trigger()` por `vagaFormSchema.safeParse(form.getValues())`** -- validacao direta com Zod, sem passar pelo zodResolver. Se falhar, mostra a mensagem EXATA do primeiro erro.

## Mudanca Unica

### Arquivo: `src/pages/studio/JobForm.tsx` - funcao `handlePublishClick` (linhas 350-419)

Substituir as linhas 385-395 (o bloco `form.trigger()`) por:

```typescript
// 4. Validate form fields directly with Zod (bypasses zodResolver issues)
const parseResult = vagaFormSchema.safeParse(form.getValues());

if (!parseResult.success) {
  const firstError = parseResult.error.errors[0];
  toast({
    title: "Erro de validacao",
    description: firstError.message,
    variant: "destructive",
  });
  return;
}
```

Isso significa:
- Validacao direta com o schema Zod, sem depender do zodResolver
- Se algum campo falhar, mostra a mensagem EXATA (ex: "Minimo 5 caracteres", "Minimo 100 caracteres", etc.)
- Sem mais "Preencha todos os campos obrigatorios" generico
- Zero chance de problemas de timing/sincronizacao

## O que NAO muda

- Schema Zod (ja esta correto)
- Cards de selecao de tipo (ja funcionam com field.onChange)
- Logica de saveDraft/updateDraft
- Hook useJobForm (createJob, updateJob)
- Integracao Stripe
- Botoes (texto dinamico, visibilidade condicional)
- Todo o resto da pagina

## Verificacao dos 4 cenarios

1. **Criar vaga nova + gratuita**: skills OK -> tipo OK -> safeParse OK -> createJob("gratuita") -> publicada com expires_at = now+30d
2. **Criar vaga nova + destaque**: skills OK -> tipo OK -> safeParse OK -> createJob("destaque") -> redirect Stripe, expires_at = null
3. **Editar rascunho + gratuita**: skills OK -> tipo OK -> safeParse OK -> updateJob(id) -> publicada
4. **Editar rascunho + destaque**: skills OK -> tipo OK -> safeParse OK -> updateJob(id) -> redirect Stripe
