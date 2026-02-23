
## Plano: Refatorar dropdown do rodape da sidebar

### Resumo

Unificar o dropdown do rodape em ambas as sidebars (DashboardSidebar e StudioSidebar) com estrutura de secoes, submenu "Trocar de perfil", e "Criar novo estudio" sempre visivel.

---

### Arquivo 1: `src/components/dashboard/DashboardSidebar.tsx`

**Alteracoes:**

1. Remover import e uso de `useHasStudio` — nao mais necessario
2. Adicionar import de `useStudioMembership` para popular o submenu
3. Adicionar imports: `Shuffle`, `Plus`, `Check` de lucide-react. Remover `Building2`.
4. Adicionar imports: `DropdownMenuLabel`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent` do dropdown-menu
5. Remover a logica condicional `navItems = hasStudio ? [...baseNavItems, studio] : baseNavItems` — a navegacao principal da sidebar nao deve depender disso (o item "Meu estudio" sai do nav principal, pois a troca agora e feita pelo submenu do dropdown)
6. Buscar `useStudioMembership()` para obter a lista de estudios

**Novo layout do dropdown:**

```
DropdownMenuLabel "Contas"
DropdownMenuSub
  DropdownMenuSubTrigger: Shuffle icon + "Trocar de perfil"
  DropdownMenuSubContent:
    Item: Avatar do user + nome_completo + Check (se em /dashboard)
    Item por estudio: Avatar + nome + Check (se studio.id === studioParam ativo)
DropdownMenuSeparator
DropdownMenuItem: Plus + "Criar novo estudio" → /studio/manage/new
DropdownMenuSeparator
DropdownMenuLabel "Geral"
DropdownMenuItem: Settings + "Configuracoes" → /dashboard/settings
DropdownMenuItem: Mail + "Suporte" → mailto:
DropdownMenuItem: ExternalLink + "Ver perfil publico" → /p/:slug
DropdownMenuSeparator
DropdownMenuItem: LogOut + "Sair"
```

Contexto ativo: como estamos em `/dashboard`, o perfil pessoal tem o Check. Os estudios nao tem Check.

Ao clicar num estudio no submenu: `navigate(/studio/manage/dashboard?studio=UUID)`
Ao clicar no perfil pessoal: `navigate(/dashboard)`

---

### Arquivo 2: `src/components/studio/StudioSidebar.tsx`

**Alteracoes:**

1. Adicionar import de `useCurrentUser` para ter dados do usuario no submenu
2. Adicionar imports: `Shuffle`, `Plus` de lucide-react. Remover `Building2`, `UsersRound`.
3. Adicionar imports: `DropdownMenuLabel`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`
4. Remover a badge "Admin" que aparece no studio switcher atual — simplificar

**Novo layout do dropdown:**

```
DropdownMenuLabel "Contas"
DropdownMenuSub
  DropdownMenuSubTrigger: Shuffle icon + "Trocar de perfil"
  DropdownMenuSubContent:
    Item: Avatar do user + nome_completo (clicar → /dashboard)
    Item por estudio: Avatar + nome + Check se ativo
DropdownMenuSeparator
DropdownMenuItem: Plus + "Criar novo estudio" → /studio/manage/new
DropdownMenuSeparator
DropdownMenuLabel "Estudio"
DropdownMenuItem: CreditCard + "Faturas" → /studio/manage/billing
DropdownMenuItem: ExternalLink + "Ver pagina publica" → /studio/:slug
DropdownMenuSeparator
DropdownMenuLabel "Geral"
DropdownMenuItem: Settings + "Configuracoes" → /dashboard/settings
DropdownMenuItem: Mail + "Suporte" → mailto:
DropdownMenuSeparator
DropdownMenuItem: LogOut + "Sair"
```

Contexto ativo: determinado por `membership.estudio.id`. O estudio ativo tem Check. Os outros nao.

Ao clicar no perfil pessoal: `navigate(/dashboard)`
Ao clicar num estudio diferente: chama `onStudioChange(studioId)` (comportamento existente)

---

### Detalhes de implementacao comuns

**Submenu "Trocar de perfil":**
- Cada item do submenu mostra Avatar (h-6 w-6) + nome (truncate, max-w-[140px]) + Check (h-4 w-4 text-primary) se ativo
- O perfil pessoal usa `user.avatar_url` e `user.nome_completo`
- Cada estudio usa `estudio.logo_url` e `estudio.nome`
- Os nomes longos sao truncados com `truncate`

**"Criar novo estudio":**
- Sempre visivel, sem condicao alguma
- Usa icone `Plus`

**Width do dropdown:**
- DashboardSidebar: `w-56` (atual)
- StudioSidebar: `w-56` (reduzir de `w-64` para consistencia)

---

### Arquivos tocados

| Arquivo | Acao |
|---|---|
| `src/components/dashboard/DashboardSidebar.tsx` | Refatorar dropdown completo |
| `src/components/studio/StudioSidebar.tsx` | Refatorar dropdown completo |

### O que NAO muda

- Navegacao principal da sidebar (itens de menu)
- Rotas, paginas, queries Supabase, RLS
- Hooks useCurrentUser, useStudioMembership, useActiveStudio
- Nenhum outro componente
- O trigger do dropdown (avatar + nome + chevron) permanece igual em ambos
