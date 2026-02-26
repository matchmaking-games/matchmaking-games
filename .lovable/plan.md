
# Correcoes no Header Mobile e useAuth

## Arquivo 1: src/hooks/useAuth.ts

### Reescrever o useEffect para usar apenas onAuthStateChange

Remover a funcao `getSession()` e sua chamada manual. O listener `onAuthStateChange` passa a ser a unica fonte de verdade. Tratar tres eventos:

- **INITIAL_SESSION**: se `session` existe, buscar usuario na tabela `users` e setar. Se nao, setar `null`. Sempre chamar `setIsLoading(false)` no `finally`.
- **SIGNED_IN**: mesmo comportamento de buscar usuario. `setIsLoading(false)` no `finally`.
- **SIGNED_OUT**: setar `user` como `null`. `setIsLoading(false)`.

Qualquer evento nao listado acima sera ignorado (sem alterar estado). A interface `AuthUser`, os campos buscados e o retorno do hook permanecem identicos.

## Arquivo 2: src/components/layout/Header.tsx

### Correcao 1 — Remover botao "Entrar" duplicado no mobile (linhas 185-194)
Remover o bloco `<div className="md:hidden">` que renderiza o Link "/login" fora do Sheet. O botao "Entrar" ja existe dentro do menu hamburguer.

### Correcao 2 — Normalizar estilo do "Criar Conta" no mobile (linha 107)
Substituir as classes `bg-primary text-primary-foreground hover:bg-primary/90` por `text-foreground hover:bg-muted` para igualar ao estilo dos outros itens do menu.

### Correcao 3 — Logo com destino seguro durante loading (linha 120)
Alterar de `to={isAuthenticated ? "/dashboard" : "/"}` para `to={!isAuthenticated && !isLoading ? "/" : "/dashboard"}`.

### Correcao 4 — Adicionar icone Briefcase no item "Vagas" do mobile (linhas 54-60)
Importar `Briefcase` do lucide-react. Adicionar `<Briefcase className="h-4 w-4" />` dentro do Link de "Vagas" no Sheet.

### Correcao 5 — Mover separator para antes do "Sair" (linhas 62-91)
Remover o `<div className="my-2 border-t border-border" />` que esta entre "Painel" e "Configuracoes" (linha 72). Adicionar esse mesmo separator imediatamente antes do botao "Sair".

Ordem final do menu mobile autenticado:
1. Vagas (icone Briefcase)
2. Painel (icone LayoutDashboard)
3. Configuracoes (icone Settings)
4. [separator]
5. Sair (icone LogOut)

## Resumo de alteracoes por arquivo

| Arquivo | Tipo de alteracao |
|---|---|
| `src/hooks/useAuth.ts` | Reescrever useEffect: remover getSession, tratar INITIAL_SESSION/SIGNED_IN/SIGNED_OUT |
| `src/components/layout/Header.tsx` | 5 correcoes cirurgicas no JSX + 1 import adicionado (Briefcase) |
