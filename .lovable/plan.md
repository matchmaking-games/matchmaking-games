
## What needs to be built

3 files to touch:

1. **`src/hooks/useEventos.ts`** — new hook (does not exist yet)
2. **`src/pages/dashboard/Events.tsx`** — new page (does not exist yet)
3. **`src/App.tsx`** — add import + route for `/dashboard/events` pointing to the new page (currently only `/dashboard/events/new` exists)

---

## Technical plan

### `src/hooks/useEventos.ts`

```
useCurrentUser() → user.id
useQuery({
  queryKey: ["eventos", "meus"],
  enabled: !!user?.id,
  queryFn: supabase
    .from("eventos")
    .select("*")
    .eq("criado_por", user.id)
    .order("data_inicio", { ascending: true })
})
```

Returns `{ data, isLoading, error, refetch }`.

---

### `src/pages/dashboard/Events.tsx`

Wrapped in `DashboardLayout` (same as all other dashboard pages). Content inside a `Card` container (per project memory rule).

**Header row:**
```
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
  <h1 font-display text-3xl>Meus Eventos</h1>
  <Button onClick → /dashboard/events/new><Plus /> Criar Evento</Button>
</div>
```

**States:**

- `isLoading` → 3 skeleton cards (`animate-pulse`, `h-24 rounded-lg bg-muted`)
- `error` → error message + "Tentar novamente" button calling `refetch()`
- empty (`data.length === 0`) → centered `CalendarDays` icon + title + subtitle + CTA button
- list → sorted events (active first, then encerrados)

**Frontend sort logic:**
```ts
const now = new Date();
const sorted = [
  ...data.filter(e => new Date(e.data_fim) >= now),
  ...data.filter(e => new Date(e.data_fim) < now),
];
```

**Date formatting helper:**
```ts
function formatEventDate(inicio: string, fim: string): string {
  const tz = 'America/Sao_Paulo';
  const opts = { timeZone: tz, day:'2-digit', month:'2-digit', year:'numeric',
                 hour:'2-digit', minute:'2-digit' };
  const dInicio = new Date(inicio);
  const dFim = new Date(fim);
  const dayInicio = dInicio.toLocaleDateString('pt-BR', { timeZone: tz });
  const dayFim = dFim.toLocaleDateString('pt-BR', { timeZone: tz });
  const timeInicio = dInicio.toLocaleTimeString('pt-BR', { timeZone: tz, hour:'2-digit', minute:'2-digit' });
  const timeFim = dFim.toLocaleTimeString('pt-BR', { timeZone: tz, hour:'2-digit', minute:'2-digit' });
  if (dayInicio === dayFim) return `${dayInicio}, ${timeInicio} – ${timeFim} (BRT)`;
  return `${dayInicio} ${timeInicio} – ${dayFim} ${timeFim} (BRT)`;
}
```

**Card structure:**
```
<Card>
  <CardContent>
    Row 1: <span font-medium text-white>{nome}</span>  +  badges (modality + "Encerrado" if past)
    Row 2: <Clock icon> formatted date string (text-muted-foreground text-sm)
    Row 3 (conditional): <MapPin> cidade, estado
    Footer (conditional): <a href={link_externo} target="_blank">Ver mais detalhes →</a>
  </CardContent>
</Card>
```

**Badge colors:**
- Presencial: `bg-green-950 text-green-300 border-green-800`
- Híbrido: `bg-blue-950 text-blue-300 border-blue-800`
- Online: `bg-purple-950 text-purple-300 border-purple-800`
- Encerrado: `bg-red-950 text-red-300 border-red-800`

All badges use inline `className` strings (no shadcn Badge variant, just `<span>` with Tailwind).

---

### `src/App.tsx` change

Add one import and one route:

```tsx
import EventsPage from "./pages/dashboard/Events";
// ...
<Route path="/dashboard/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
```

The `/dashboard/events/new` route already exists and is untouched.

---

## Files to create/modify

| File | Action |
|------|--------|
| `src/hooks/useEventos.ts` | Create |
| `src/pages/dashboard/Events.tsx` | Create |
| `src/App.tsx` | Add 1 import + 1 route |

No database changes needed — `eventos` table and RLS policies already exist.
No sidebar changes — left untouched per spec.
