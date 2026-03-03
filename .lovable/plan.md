
# Centralizar autenticacao em AuthProvider

## Resumo

Cinco alteracoes cirurgicas para eliminar multiplos listeners de auth concorrentes que causam o erro "Lock broken by another request with the 'steal' option" em paginas publicas.

---

## Arquivo 1 -- CRIAR `src/contexts/AuthContext.tsx`

Novo arquivo que centraliza toda a logica de autenticacao em um unico lugar.

Exporta:
- `AuthContext` (createContext)
- `AuthProvider` (componente provider)
- `useAuth` (hook que retorna useContext)
- `AuthUser` (interface)

O `AuthProvider` gerencia 4 estados: `session`, `user`, `isLoading`, `hasProfile`.

Registra um unico `onAuthStateChange` no useEffect:
- `INITIAL_SESSION` / `SIGNED_IN` com sessao: salva session, busca perfil na tabela `users`, atualiza user/hasProfile, seta isLoading=false no finally
- `SIGNED_OUT` / sem sessao: limpa tudo, seta isLoading=false

`signOut` apenas chama `supabase.auth.signOut()` -- o listener cuida do resto.

`isAuthenticated` e derivado: `!!session`.

---

## Arquivo 2 -- REESCREVER `src/hooks/useAuth.ts`

Substituir todo o conteudo por duas linhas de re-export:

```text
export type { AuthUser } from "@/contexts/AuthContext";
export { useAuth } from "@/contexts/AuthContext";
```

Garante compatibilidade retroativa -- os 3 arquivos que importam de `@/hooks/useAuth` (Header, Login, Signup) continuam funcionando sem alteracao.

---

## Arquivo 3 -- REESCREVER `src/components/ProtectedRoute.tsx`

Remover: useState, useEffect, useNavigate, import do supabase, chamada a getSession, segundo onAuthStateChange.

Novo comportamento (sem nenhum efeito colateral):
1. `const { isAuthenticated, hasProfile, isLoading } = useAuth()`
2. Se isLoading: renderiza spinner (Loader2)
3. Se !isAuthenticated: `<Navigate to="/login" replace />`
4. Se !hasProfile: `<Navigate to="/onboarding" replace />`
5. Caso contrario: renderiza children

Usa `Navigate` do react-router-dom em vez de `useNavigate`.

---

## Arquivo 4 -- MODIFICAR `src/App.tsx`

Adicionar `AuthProvider` como elemento mais externo, antes do `QueryClientProvider`:

```text
<AuthProvider>
  <QueryClientProvider client={queryClient}>
    ... tudo que ja existe ...
  </QueryClientProvider>
</AuthProvider>
```

Adicionar import do AuthProvider. Nenhuma rota alterada.

---

## Arquivo 5 -- MODIFICAR `src/integrations/supabase/client.ts`

Remover o terceiro argumento do `createClient` (o objeto `{ auth: { storage, persistSession, autoRefreshToken } }`).

Fica apenas: `createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)`

O Supabase usa esses valores por padrao -- passa-los explicitamente causa instabilidade no lock interno.

---

## O que NAO muda

- Nenhuma pagina (Header, Login, Signup, PublicProfile, Jobs, etc.)
- Nenhum hook de dados (usePublicProfile, useStudioMembership, etc.)
- Nenhuma rota no App.tsx
- Nenhum import existente de useAuth nos componentes

## Ordem de implementacao

1. Criar `AuthContext.tsx`
2. Reescrever `useAuth.ts` (re-export)
3. Reescrever `ProtectedRoute.tsx`
4. Modificar `App.tsx` (adicionar AuthProvider)
5. Modificar `client.ts` (remover config auth)
