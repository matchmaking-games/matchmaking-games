
# Pagina de Gerenciamento de Equipe do Estudio

## Resumo

Criar a pagina `/studio/manage/team` para super admins visualizarem, alterarem permissoes e removerem membros do estudio. Seguindo o padrao existente do projeto (useState/useEffect, sem React Query).

## Arquivos a criar/modificar

### 1. Criar `src/hooks/useStudioMembers.ts`

Hook seguindo o padrao de `useStudioJobs`:

**Effect 1 - Verificar permissoes:**
- Buscar sessao via `supabase.auth.getSession()`
- Buscar membership do usuario em `estudio_membros` (role e estudio_id)
- Validar que role === `super_admin`
- Setar `isAuthorized`, `estudioId`, `membershipChecked`

**Effect 2 - Buscar membros (quando autorizado):**
- Query PostgREST com join:
  ```typescript
  supabase
    .from("estudio_membros")
    .select(`
      id, role, adicionado_em, user_id,
      user:users!user_id (
        id, nome_completo, email, avatar_url
      )
    `)
    .eq("estudio_id", estudioId)
    .eq("ativo", true)
    .order("adicionado_em", { ascending: false })
  ```

**Interface `StudioMember`:**
```
id, role, adicionado_em, user_id,
user: { id, nome_completo, email, avatar_url }
```

**Funcoes exportadas:**
- `members`, `isLoading`, `error`, `isAuthorized`
- `refetch()` - recarrega a lista
- `updateMemberRole(memberId, newRole)` - update role via Supabase, chama refetch
- `removeMember(memberId)` - update ativo=false via Supabase, chama refetch
- `superAdminCount` - calculado com useMemo (quantos membros tem role super_admin)

### 2. Criar `src/pages/studio/Team.tsx`

Pagina usando `StudioDashboardLayout` (mesmo padrao de StudioJobs).

**Layout geral:**
- Container `max-w-4xl mx-auto`
- Titulo "Equipe" com `font-display text-2xl font-bold`
- Subtitulo com contagem de membros

**Loading:** 3 Skeletons empilhados

**Error/Nao autorizado:** Card com mensagem de erro

**Desktop (Table):**
- Colunas: Avatar+Nome, Email, Permissao (Badge), Adicionado em, Acoes
- Avatar com fallback de iniciais (getInitials)
- Badge de role: `super_admin` com `bg-green-500/10 text-green-500`, `member` com `bg-muted text-muted-foreground`
- Data formatada com `date-fns` locale ptBR (`dd/MM/yyyy`)
- Acoes: botao ghost Shield (alterar role) + botao ghost Trash2 vermelho (remover)
- Esconder acoes para o proprio usuario logado

**Mobile (Cards):**
- Usar `useIsMobile` para alternar
- Stack vertical de cards com avatar, nome, email, badge, botoes

**Dialog "Alterar Permissao":**
- Select com opcoes "Super Admin" e "Membro"
- Validacao: se `superAdminCount <= 1` e membro selecionado e super_admin, nao permitir demover
- Toast de sucesso/erro

**AlertDialog "Remover Membro":**
- Texto: "Tem certeza que deseja remover [Nome] da equipe?"
- Validacao: nao permitir remover ultimo super_admin
- Toast de sucesso/erro

**Empty state:** Icone Users + "Nenhum membro encontrado"

### 3. Modificar `src/App.tsx`

Adicionar rota protegida:
```
<Route path="/studio/manage/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
```
Importar `Team` de `src/pages/studio/Team`.

## Seguranca

- Hook valida no client que usuario e super_admin antes de mostrar acoes
- RLS policies existentes no banco protegem SELECT e UPDATE
- Validacao de ultimo super_admin feita no client como UX guard (banco tambem protege)
- Nao mostrar botoes de acao para o proprio usuario (evita auto-remocao)

## O que NAO muda

- Sidebar ja tem link "Equipe" apontando para `/studio/manage/team`
- Nao implementa convite de novos membros
- Nao mostra membros inativos
- Nao deleta registros, apenas marca ativo=false
