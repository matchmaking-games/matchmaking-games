

## Implementar edição de evento

### Abordagem

Reutilizar o `EventForm` existente para criar e editar, passando o ID do evento via rota. O formulário detecta se está em modo de edição pelo parâmetro `:id` na URL.

### Alterações

**1. Rota — `src/App.tsx`**
- Adicionar rota `/dashboard/events/:id/edit` apontando para `EventForm`

**2. Hook `useUpdateEvento` — `src/hooks/useUpdateEvento.ts`** (novo)
- `useMutation` que faz `supabase.from("eventos").update({...}).eq("id", id)`
- Invalida queries `["eventos", "meus"]` e `["eventos", "publicos"]`
- Toast de sucesso/erro

**3. Hook `useEventoById` — `src/hooks/useEventoById.ts`** (novo)
- `useQuery` que busca um evento por ID: `supabase.from("eventos").select("*").eq("id", id).single()`
- Habilitado apenas quando `id` existe

**4. `src/pages/dashboard/EventForm.tsx`**
- Importar `useParams` do react-router-dom para ler `:id`
- Importar `useEventoById` e `useUpdateEvento`
- Se `id` existe: buscar evento, popular o formulário com `form.reset()` quando os dados carregam
- Parsing dos dados existentes: extrair `dateRange` (from/to como Date), `horario_inicio`, `horario_fim` a partir de `data_inicio`/`data_fim`
- No `onSubmit`: se editando, chamar `updateEvento` ao invés de `createEvento`
- Título dinâmico: "Editar Evento" vs "Criar Evento"
- Botão dinâmico: "Salvar Alterações" vs "Criar Evento"
- Mostrar skeleton/loading enquanto carrega dados no modo edição

**5. `src/pages/dashboard/Events.tsx`**
- `handleEdit`: navegar para `/dashboard/events/${evento.id}/edit`

