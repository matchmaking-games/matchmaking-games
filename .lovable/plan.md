

## Alterações no formulário de eventos e listagem

### 1. EventForm.tsx — Dirty check ao navegar
- Usar `form.formState.isDirty` do react-hook-form
- Adicionar `useEffect` com `beforeunload` para refresh/fechar aba
- Criar função `handleNavigateBack` que verifica `isDirty` e mostra `window.confirm` antes de navegar
- Aplicar no botão "Cancelar" e no novo botão de voltar

### 2. EventForm.tsx — Botão de voltar no topo
- Adicionar botão com ícone `ArrowLeft` acima do card, navegando para `/dashboard/events`
- Usa a mesma função `handleNavigateBack` com dirty check

### 3. EventForm.tsx — Remover botão "Ver eventos da comunidade"
- Remover o `<Button>` com `CalendarRange` do header (linhas 246-253)
- Header fica apenas com o título "Criar Evento"

### 4. Events.tsx (listagem) — Adicionar botão "Ver eventos da comunidade"
- Adicionar `<Button variant="outline">` com ícone `CalendarRange` no header, ao lado do botão "Criar Evento", navegando para `/eventos`

