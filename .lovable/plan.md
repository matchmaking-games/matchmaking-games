

# Menu Dropdown de Acoes na Tabela de Membros

## Resumo

Substituir os botoes inline da coluna "Acoes" por um dropdown menu (MoreVertical) com 3 itens: Ver Perfil Publico, Alterar Permissao e Remover do Estudio. Tambem melhorar os dialogs existentes (trocar Select por RadioGroup no dialog de permissao, adicionar icone AlertTriangle no AlertDialog de remocao).

## Arquivos a modificar

### 1. `src/hooks/useStudioMembers.ts`

**Adicionar `slug` no SELECT do JOIN com users.**

Na interface `StudioMember`, adicionar `slug: string | null` ao objeto `user` (linha 16).

Na query `.select()` (linha 55-59), adicionar `slug` na lista de campos do JOIN:
```text
user:users!user_id (
  id, nome_completo, email, avatar_url, slug
)
```

Nenhuma outra mudanca no hook - as funcoes `updateMemberRole` e `removeMember` ja tem validacoes de super_admin count e ja fazem refetch.

### 2. `src/pages/studio/Team.tsx`

**Substituir `renderActions` e melhorar dialogs.**

**Imports a adicionar:**
- `MoreVertical, User, AlertTriangle` do lucide-react (ja tem Shield, Trash2)
- `DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger` de `@/components/ui/dropdown-menu`
- `RadioGroup, RadioGroupItem` de `@/components/ui/radio-group`
- `Label` de `@/components/ui/label`

**Remover imports nao mais necessarios:**
- `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` (substituido por RadioGroup)

**Substituir funcao `renderActions`:**

Remover a logica atual que esconde acoes para o proprio usuario (`if (member.user_id === currentUserId) return null`). Todos os membros mostram o dropdown - as validacoes acontecem ao clicar em cada item.

Nova funcao `renderActions`:
- Renderizar `DropdownMenu` com trigger `MoreVertical` (botao ghost, size icon, h-8 w-8)
- `DropdownMenuContent` com `align="end"`
- Item 1: icone `User` + "Ver Perfil Publico" - ao clicar, `window.open(\`/p/${member.user.slug}\`, '_blank')`. Desabilitar se slug nao existir.
- Item 2: icone `Shield` + "Alterar Permissao" - ao clicar, executar validacoes e abrir dialog se permitido
- `DropdownMenuSeparator`
- Item 3: icone `Trash2` + "Remover do Estudio" - com `className="text-destructive focus:text-destructive"`. Ao clicar, executar validacoes e abrir dialog se permitido.

**Logica de validacao ao clicar "Alterar Permissao":**
- Se membro e o usuario logado E superAdminCount <= 1 E role === "super_admin": toast erro "Voce nao pode remover sua propria permissao de Super Admin." e nao abrir dialog
- Se membro e o ultimo super_admin (superAdminCount <= 1 E role === "super_admin"): toast erro "O estudio precisa ter pelo menos um Super Admin." e nao abrir dialog
- Senao: chamar `openRoleDialog(member)` normalmente

**Logica de validacao ao clicar "Remover do Estudio":**
- Se membro e o usuario logado (`member.user_id === currentUserId`): toast erro "Voce nao pode remover a si mesmo. Peca para outro Super Admin fazer isso." e nao abrir dialog
- Se membro e o ultimo super_admin (superAdminCount <= 1 E role === "super_admin"): toast erro "Nao e possivel remover. O estudio precisa ter pelo menos um Super Admin." e nao abrir dialog
- Senao: chamar `openRemoveDialog(member)` normalmente

**Melhorar Role Dialog (linhas 253-280):**

Substituir o `Select` por um `RadioGroup` com descricoes:
- Opcao "member": label "Membro", descricao "Pode editar perfil do estudio e gerenciar vagas"
- Opcao "super_admin": label "Super Admin", descricao "Controle total, incluindo gerenciar equipe"
- Valor inicial: `selectedRole` (pre-selecionado com role atual)

Adicionar informacoes do membro no corpo do dialog:
- "Membro: [nome_completo]"
- "Permissao atual: [RoleBadge]"

Alterar texto do botao de "Salvar" para "Alterar Permissao".

**Melhorar Remove AlertDialog (linhas 282-298):**

Adicionar icone `AlertTriangle` antes do titulo "Remover Membro".
Melhorar descricao: "Tem certeza que deseja remover **[nome]** do estudio? Esta acao nao pode ser desfeita."
Alterar texto do botao de "Remover" para "Remover Membro".

**Mobile cards (linhas 196-214):**

Substituir a chamada `{renderActions(member)}` na area de mobile cards. O mesmo dropdown funciona em mobile - posicionar o botao MoreVertical no canto superior direito do card, ao lado do RoleBadge.

## O que NAO muda

- Hook useStudioMembers: funcoes `updateMemberRole` e `removeMember` continuam iguais (ja tem todas as validacoes necessarias)
- RLS policies
- InviteMemberDialog
- Estrutura da tabela/cards (apenas o conteudo da coluna Acoes muda)
- Nenhuma migracao SQL necessaria

