

## Adicionar dropdown de ações (editar/deletar) no EventCard

Inspirado no `SkillCard`, adicionar um menu de ações com ellipsis vertical no card de evento, com opções de editar (placeholder) e deletar (com confirmação).

### Alterações em `src/pages/dashboard/Events.tsx`

1. **Imports**: Adicionar `EllipsisVertical`, `Pencil`, `Trash2` do lucide-react; `DropdownMenu` e subcomponentes; `AlertDialog` e subcomponentes; `useState` do React; `useMutation`, `useQueryClient` do tanstack; `supabase`; `toast`

2. **EventCard — Dropdown menu**: Na row 1 (linha 60), ao lado das badges, adicionar um `DropdownMenu` com trigger de `EllipsisVertical` (botão ghost, `h-7 w-7`), com:
   - Item "Editar" com ícone `Pencil` — por enquanto apenas `console.log` ou noop
   - Separador
   - Item "Excluir" com ícone `Trash2` e classe `text-destructive` — abre dialog de confirmação

3. **Estado de delete**: Adicionar props `onEdit` e `onDelete` no `EventCard`, gerenciados pelo componente pai `EventsPage`

4. **AlertDialog de confirmação**: No `EventsPage`, adicionar um `AlertDialog` controlado por estado (`deleteDialogOpen`, `eventoToDelete`, `isDeleting`), com:
   - Título: "Excluir evento?"
   - Descrição com nome do evento em bold, mencionando que a ação é irreversível
   - Botão de confirmação com `variant="destructive"`
   - Ao confirmar: `supabase.from("eventos").delete().eq("id", ...)`, invalidar query `["eventos", "meus"]`, mostrar toast de sucesso

5. **Layout**: O botão ellipsis fica à direita das badges, seguindo o padrão do SkillCard — flex row com `justify-between`, nome à esquerda, badges + ellipsis à direita

