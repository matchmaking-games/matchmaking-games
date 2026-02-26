
# Fix: Suporte a multiplos estudios no useJobForm

## Problema
O hook `useJobForm.ts` usa `.maybeSingle()` ao buscar memberships do usuario na tabela `estudio_membros` sem filtrar por `estudio_id`. Quando o usuario pertence a multiplos estudios, a query retorna multiplas linhas, `.maybeSingle()` retorna `null`, e a pagina fica travada no skeleton infinito.

## Varredura do projeto
Apos busca em todo o codebase, o unico local com este bug e `src/hooks/useJobForm.ts` (linha 102-107). Os outros usos de `estudio_membros` com `.maybeSingle()` ja filtram por `estudio_id` especifico:
- `InviteMemberDialog.tsx` -- filtra por `estudio_id` (seguro)
- `AcceptInvite.tsx` -- filtra por `estudio_id` (seguro)

## Alteracao

**Arquivo unico:** `src/hooks/useJobForm.ts`

### 1. Adicionar import de `useSearchParams`
Adicionar `useSearchParams` ao import de `react-router-dom` (linha 2).

### 2. Ler o parametro `?studio=` da URL
Dentro do hook, antes dos useEffects, adicionar:
```ts
const [searchParams] = useSearchParams();
const studioIdFromUrl = searchParams.get("studio");
```

### 3. Reescrever a query de membership (linhas 102-107)
Substituir a query problematica por logica condicional:

**Se `studioIdFromUrl` existe:** filtrar por `estudio_id` especifico + `user_id` + `ativo`, usar `.maybeSingle()` com seguranca (combinacao unica).

**Se NAO existe:** buscar sem filtro de `estudio_id`, usar `.limit(1)` em vez de `.maybeSingle()`, e pegar o primeiro resultado do array.

### 4. Garantir isLoading = false
Adicionar `finally { setIsLoading(false); }` ao bloco try/catch do `checkMembership` para cobrir todos os caminhos, incluindo o caso sem `jobId`.

## Detalhes tecnicos

```text
ANTES:
  query: estudio_membros WHERE user_id = X AND ativo = true → .maybeSingle()
  Resultado com 2+ estudios: null (bug)

DEPOIS:
  Se ?studio=ID na URL:
    query: estudio_membros WHERE user_id = X AND estudio_id = ID AND ativo = true → .maybeSingle()
    Resultado: exatamente 0 ou 1 linha (seguro)

  Se sem ?studio=:
    query: estudio_membros WHERE user_id = X AND ativo = true → .limit(1)
    Resultado: array com 0 ou 1 elemento (seguro)
```

## O que NAO muda
- Nenhuma validacao de seguranca (auth, role, ativo, pertencimento da vaga)
- Nenhum outro hook ou componente
- Nenhuma logica de criacao/edicao/rascunho de vagas
- Nenhum arquivo alem de `src/hooks/useJobForm.ts`
