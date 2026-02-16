

# Navegacao entre Multiplos Estudios

## Resumo

Permitir que usuarios membros de multiplos estudios alternem entre eles no dashboard do estudio, usando query parameter `?studio=id` para manter contexto. Requer refatorar `useStudioMembership` para retornar lista, criar hook `useActiveStudio`, atualizar sidebar com selector e propagar estudioId para hooks dependentes.

## Arquivos a criar/modificar

### 1. Reescrever `src/hooks/useStudioMembership.ts`

Converter de TanStack Query para padrao useState/useEffect do projeto. Retornar array ao inves de objeto unico.

**Mudancas:**
- Remover import de `useQuery` e `@tanstack/react-query`
- Usar `useState` e `useEffect`
- Remover `.limit(1).maybeSingle()`, usar query sem limit
- Adicionar `.order('adicionado_em', { ascending: false })`
- Retornar `{ studios: StudioMembership[], isLoading: boolean }`
- Interface `StudioMembership` ganha campo `id` (id do registro estudio_membros)

```text
Interface atualizada:
  StudioMembership {
    id: string           // id do registro em estudio_membros
    estudio: { id, nome, slug, logo_url }
    role: "super_admin" | "member"
    ativo: boolean
  }

Retorno:
  { studios: StudioMembership[], isLoading: boolean }
```

### 2. Criar `src/hooks/useActiveStudio.ts` (novo)

Hook que gerencia qual estudio esta ativo baseado no query param `?studio=`.

**Logica:**
- Usa `useSearchParams` para ler/escrever `?studio=`
- Usa `useStudioMembership` para ter a lista de estudios
- `activeStudio` = estudio cujo `estudio.id` bate com o param, ou primeiro da lista como fallback
- `setActiveStudio(id)` atualiza o searchParam preservando outros params existentes
- Retorna `{ studios, activeStudio, setActiveStudio, isLoading }`

### 3. Modificar `src/components/studio/StudioDashboardLayout.tsx`

Trocar `useStudioMembership` por `useActiveStudio`.

**Mudancas:**
- Substituir `const { data: membership, isLoading } = useStudioMembership()` por `const { activeStudio, isLoading } = useActiveStudio()`
- Condicao de redirect: `if (!isLoading && !activeStudio)` -> navega para `/studio/manage/new`
- Passar `activeStudio` (que e um `StudioMembership`) para `StudioSidebar` como `membership`

### 4. Modificar `src/components/studio/StudioSidebar.tsx`

Adicionar selector de estudio no footer e preservar query param nos links de navegacao.

**Mudancas na interface:**
- Props passam a incluir `studios: StudioMembership[]`, `activeStudio: StudioMembership`, `onStudioChange: (id: string) => void`
- Ou, mais simples: sidebar usa `useActiveStudio` internamente

**Mudancas no footer:**
- Se `studios.length > 1`: substituir o dropdown atual por um que inclui secao de troca de estudio no topo do menu, seguida de separador e os itens existentes (Configuracoes, Faturas, Suporte, etc)
- Se `studios.length === 1`: manter dropdown atual sem alteracao (sem selector)
- Cada estudio no dropdown mostra: Avatar/logo + nome + badge "Admin" se super_admin
- Item ativo fica destacado (checkmark ou bg diferente)

**Mudancas nos links de navegacao:**
- Os navItems devem preservar o query param `?studio=` ao navegar
- Criar helper inline ou usar `useSearchParams` para construir URLs com o param
- Exemplo: `/studio/manage/jobs?studio=abc123`

### 5. Modificar `src/hooks/useStudioMembers.ts`

Aceitar `estudioId` como parametro ao inves de buscar internamente.

**Mudancas:**
- Adicionar parametro `estudioId: string | null` na funcao
- Remover Effect 1 (checkMembership) que busca estudioId internamente
- Manter apenas o Effect 2 (fetchMembers) que depende do `estudioId` recebido
- Remover estados `isAuthorized` e `membershipChecked` (a autorizacao sera verificada pelo layout/activeStudio)
- Manter `currentUserId` buscando da sessao no effect de fetch

### 6. Modificar `src/hooks/useStudioJobs.ts`

Mesma refatoracao do useStudioMembers.

**Mudancas:**
- Adicionar parametro `estudioId: string | null`
- Remover Effect 1 de checkMembership
- Usar estudioId recebido diretamente no fetchVagas

### 7. Modificar `src/pages/studio/Team.tsx`

Usar `useActiveStudio` para obter estudioId e passar para `useStudioMembers`.

**Mudancas:**
- Importar `useActiveStudio`
- Obter `activeStudio` do hook
- Passar `activeStudio?.estudio.id` para `useStudioMembers(estudioId)`
- Ajustar condicoes de loading/error de acordo

### 8. Modificar `src/pages/studio/Jobs.tsx`

Usar `useActiveStudio` para obter estudioId e passar para `useStudioJobs`.

**Mudancas:**
- Importar `useActiveStudio`
- Obter `activeStudio` do hook
- Passar `activeStudio?.estudio.id` para `useStudioJobs(estudioId)`

### 9. Modificar `src/pages/studio/Dashboard.tsx`

Trocar `useStudioMembership` por `useActiveStudio`.

**Mudancas:**
- Substituir `const { data: membership } = useStudioMembership()` por `const { activeStudio } = useActiveStudio()`
- Usar `activeStudio?.estudio.nome` no texto de boas-vindas

### 10. Modificar `src/pages/studio/Profile.tsx`

Trocar `useStudioMembership` por `useActiveStudio`.

**Mudancas:**
- Substituir `const { data: membership, isLoading: loadingMembership } = useStudioMembership()` por `const { activeStudio, isLoading: loadingMembership } = useActiveStudio()`
- Todas as referencias a `membership?.estudio.id` viram `activeStudio?.estudio.id`
- Todas as referencias a `membership` viram `activeStudio`

## Comportamento esperado

1. Usuario acessa `/studio/manage/dashboard` sem `?studio=` -> sistema usa primeiro estudio da lista
2. Usuario clica em outro estudio no selector -> URL atualiza para `?studio=novo_id`
3. Navegacao entre paginas preserva o `?studio=` param
4. Hooks de dados (jobs, members) reexecutam quando estudioId muda (via useEffect dependency)
5. Se usuario tem apenas 1 estudio, nao mostra selector (mantem dropdown original)

## O que NAO muda

- Nao usa localStorage para persistir estudio ativo
- Nao cria novas tabelas ou migracoes
- Nao altera RLS policies
- Nao altera rotas no App.tsx
- Funcionalidade de convite permanece igual

