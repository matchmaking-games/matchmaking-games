
## Plan: Página pública de eventos `/events`

### Files to create/modify

1. **`src/components/dashboard/DashboardSidebar.tsx`** — line 65: change `url: "/eventos"` → `url: "/events"`

2. **`src/hooks/usePublicEvents.ts`** — create new hook:
   - Interface `PublicEventFilters { modalidade?, estado?, mostrarEncerrados? }`
   - Re-export the `Evento` type from `useEventos` (or redefine it locally — redefine to avoid coupling)
   - `useQuery` with key `["eventos", "public", filtros]`
   - No `enabled` guard — always runs
   - Conditional `.gte("data_fim", ...)` when `mostrarEncerrados` is false
   - Conditional `.eq("modalidade", ...)` when set and not "todos"
   - Conditional `.eq("estado", ...)` when set
   - `.order("data_inicio", { ascending: true })`
   - Returns `{ data, isLoading, error }`

3. **`src/pages/Events.tsx`** — create new page:
   - Uses `<Header />` + `<Footer />` (public layout, no ProtectedRoute)
   - State: `modalidade` (default "todos"), `estado` (default ""), `mostrarEncerrados` (default false)
   - Calls `usePublicEvents({ modalidade, estado, mostrarEncerrados })`
   - Calls `useIBGELocations()` for state list
   - Utility function `formatEventDate(inicio, fim)` inside the file
   - Filters bar: `Select` for modalidade + `Select` for estado (from IBGE) + `Switch` for mostrarEncerrados
   - Loading: 3 skeleton cards
   - Empty: `CalendarDays` icon + messages
   - Error: inline error text
   - Event cards: `Card` with click → opens `Sheet` detail drawer
   - Badge logic using plain `<span>` with Tailwind classes
   - Sheet: `side="right"`, `sm:max-w-md`, `ScrollArea` inside

4. **`src/App.tsx`** — add import + public route:
   ```tsx
   import Events from "./pages/Events";
   // ...
   <Route path="/events" element={<Events />} />
   ```
   Placed alongside `/jobs` (public routes section).

### Key implementation details

**`formatEventDate` utility:**
```ts
function formatEventDate(inicio: string, fim: string): string {
  const start = new Date(inicio);
  const end = new Date(fim);
  const opts = { timeZone: 'America/Sao_Paulo' };
  const startDate = start.toLocaleDateString('pt-BR', opts);
  const endDate = end.toLocaleDateString('pt-BR', opts);
  const startTime = start.toLocaleTimeString('pt-BR', { ...opts, hour: '2-digit', minute: '2-digit' });
  const endTime = end.toLocaleTimeString('pt-BR', { ...opts, hour: '2-digit', minute: '2-digit' });
  if (startDate === endDate) return `${startDate}, ${startTime} – ${endTime} (BRT)`;
  return `${startDate} ${startTime} – ${endDate} ${endTime} (BRT)`;
}
```

**Badge helper:**
```tsx
function ModalidadeBadge({ modalidade }: { modalidade: string }) {
  const map = {
    presencial: 'bg-green-950 text-green-300 border border-green-800',
    hibrido:    'bg-blue-950 text-blue-300 border border-blue-800',
    online:     'bg-purple-950 text-purple-300 border border-purple-800',
  };
  const labels = { presencial: 'Presencial', hibrido: 'Híbrido', online: 'Online' };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[modalidade] ?? ''}`}>{labels[modalidade] ?? modalidade}</span>;
}
```

**Encerrado badge:** `new Date(evento.data_fim) < new Date()` → `<span className="px-2 py-0.5 rounded text-xs font-medium bg-red-950 text-red-300 border border-red-800">Encerrado</span>`

**Sheet detail for same-day vs multi-day:** in the detail drawer, when same day show `"DD/MM/YYYY, HH:MM – HH:MM (BRT)"`, when different days show two lines "Início: ..." and "Fim: ...".

**Estado select:** first option `<SelectItem value="">Todos os estados</SelectItem>`, then map IBGE estados. When value is `""`, pass `estado: ""` to hook (hook skips `.eq` if empty).

### Files modified
- `src/components/dashboard/DashboardSidebar.tsx` (1 line change)
- `src/hooks/usePublicEvents.ts` (create)
- `src/pages/Events.tsx` (create)
- `src/App.tsx` (add import + route)
