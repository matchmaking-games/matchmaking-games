
# Refatoracao: Layout Route + React Query no Painel do Estudio

## Visao Geral

Quatro mudancas interdependentes para eliminar o remount do layout e o refetch desnecessario ao navegar entre paginas do painel do estudio.

---

## Arquivo 1 -- CRIAR `src/components/studio/StudioManageLayout.tsx`

Componente simples que renderiza `StudioDashboardLayout` com `Outlet` dentro:

```text
import { Outlet } from "react-router-dom"
import { StudioDashboardLayout } from "./StudioDashboardLayout"

export function StudioManageLayout() {
  return (
    <StudioDashboardLayout>
      <Outlet />
    </StudioDashboardLayout>
  )
}
```

Nenhuma prop, nenhuma logica. O `StudioDashboardLayout` continua inalterado internamente.

---

## Arquivo 2 -- REESCREVER `src/hooks/useStudioMembership.ts`

Migrar de `useState + useEffect` para `useQuery` do `@tanstack/react-query`.

- Query key: `["studio-memberships"]`
- `staleTime`: 300000 (5 minutos)
- `queryFn`: mesma logica de fetch atual (getSession, query estudio_membros, map para StudioMembership[])
- Retorno: `{ studios: StudioMembership[], isLoading: boolean }` -- mesma interface exata de hoje
- Se nao houver sessao, retorna array vazio (sem erro)

---

## Arquivos 3-9 -- REMOVER `StudioDashboardLayout` de cada pagina

Para cada pagina abaixo, a unica alteracao e:
1. Apagar o `import { StudioDashboardLayout }` 
2. Substituir `<StudioDashboardLayout>...</StudioDashboardLayout>` pelo conteudo interno (fragmento `<>...</>` quando ha multiplos nos raiz)

Nenhuma logica interna, hook, query ou estado e alterado.

### `src/pages/studio/Dashboard.tsx`
- 1 return: remover wrapper nas linhas 26 e 107

### `src/pages/studio/Profile.tsx`
- 2 returns: loading (linhas 395-400) e main (linhas 404-669)
- Loading: trocar `<StudioDashboardLayout>...</ >` por apenas o div interno
- Main: trocar `<StudioDashboardLayout>...</ >` por apenas o div interno

### `src/pages/studio/Jobs.tsx`
- 3 returns: loading (linhas 206-220), error (linhas 226-234), main (linhas 239-425)
- Cada um: remover wrapper, manter conteudo interno
- Main tem conteudo + dialogs como irmaos -- usar fragmento `<>...</>`

### `src/pages/studio/JobForm.tsx`
- 2 returns: loading (linhas 427-438) e main (linhas 443-1044)
- Main tem Card + AlertDialog como irmaos -- usar fragmento `<>...</>`

### `src/pages/studio/Team.tsx`
- 1 return com conteudo + dialogs como irmaos (linhas 219-429)
- Usar fragmento `<>...</>`

### `src/pages/studio/Billing.tsx`
- 1 return (linhas 60-155): remover wrapper, manter div interno

### `src/pages/studio/StudioProfileLinks.tsx`
- 2 returns: loading (linhas 263-268) e main (linhas 272-351)

---

## Arquivo 10 -- MODIFICAR `src/App.tsx`

Substituir as 8 rotas individuais do painel do estudio por uma rota pai com rotas aninhadas:

```text
<Route
  element={
    <ProtectedRoute>
      <StudioManageLayout />
    </ProtectedRoute>
  }
>
  <Route path="/studio/manage/dashboard" element={<StudioDashboard />} />
  <Route path="/studio/manage/profile" element={<StudioProfile />} />
  <Route path="/studio/manage/profile/links" element={<StudioProfileLinks />} />
  <Route path="/studio/manage/jobs" element={<StudioJobs />} />
  <Route path="/studio/manage/jobs/new" element={<JobForm />} />
  <Route path="/studio/manage/jobs/:id/edit" element={<JobForm />} />
  <Route path="/studio/manage/team" element={<Team />} />
  <Route path="/studio/manage/billing" element={<Billing />} />
</Route>
```

A rota `/studio/manage/new` permanece independente com seu proprio `ProtectedRoute`, fora do grupo.

Adicionar import do `StudioManageLayout`. Remover os 8 `ProtectedRoute` individuais que envolviam cada rota.

Nenhuma outra rota do App.tsx e alterada.

---

## Ordem de implementacao

1. Criar `StudioManageLayout.tsx`
2. Reescrever `useStudioMembership.ts` com React Query
3. Remover `StudioDashboardLayout` das 7 paginas
4. Refatorar rotas no `App.tsx`

---

## O que NAO muda

- `StudioDashboardLayout.tsx` (conteudo interno inalterado)
- `StudioSidebar.tsx`
- `ProtectedRoute.tsx`
- `useActiveStudio.ts`
- Nenhuma rota fora do painel do estudio
- Nenhuma logica de negocio dentro das paginas
- Nenhum CSS ou componente de UI
