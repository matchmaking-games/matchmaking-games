

## Plan: Add "Ver eventos" to sidebar + Event creation form

### Part 1 — Sidebar update

**File:** `src/components/dashboard/DashboardSidebar.tsx`

- Import `CalendarRange` from lucide-react
- Add "Ver eventos" item to `communityItems` array before "Meus eventos":

```ts
const communityItems = [
  { title: "Ver eventos", url: "/eventos", icon: CalendarRange },
  { title: "Meus eventos", url: "/dashboard/events", icon: CalendarDays },
];
```

No other sidebar changes.

---

### Part 2 — Hook: `src/hooks/useCreateEvento.ts`

- Uses `useMutation` from tanstack-query (following project patterns)
- Gets `auth.getUser()` to fill `criado_por`
- Inserts into `eventos` table via Supabase client
- Accepts processed data with `data_inicio` and `data_fim` as ISO strings
- Returns `{ mutateAsync, isPending }`

---

### Part 3 — Page: `src/pages/dashboard/EventForm.tsx`

Wrapped in `DashboardLayout`. Structure:

- Header row: "Criar Evento" title + outline button "Ver eventos da comunidade" (CalendarRange icon) linking to `/eventos`
- Form using react-hook-form + zodResolver with the schema described in the task
- Calendar in range mode (always visible, not in popover) for date selection
- Time inputs (grid 2-col) with "Horário de Brasília (BRT)" helper text
- Modalidade Select (presencial/hibrido/online)
- Conditional location fields (estado/cidade via `useIBGELocations`, endereco) when not online
- Link externo input with URL validation
- Footer: Cancel (ghost, navigates to /dashboard/events) + Submit (primary, disabled while loading with Loader2)
- On submit: combines date+time into ISO with `-03:00` offset, calls `useCreateEvento`, toast + navigate on success/error

Zod schema with `.superRefine()` for conditional estado/cidade validation and date range check.

---

### Part 4 — Route in `src/App.tsx`

Add protected route `/dashboard/events/new` pointing to `EventForm`, placed near other dashboard routes:

```tsx
<Route path="/dashboard/events/new" element={<ProtectedRoute><EventForm /></ProtectedRoute>} />
```

---

### Files created/modified

| File | Action |
|------|--------|
| `src/components/dashboard/DashboardSidebar.tsx` | Add CalendarRange import + "Ver eventos" item |
| `src/hooks/useCreateEvento.ts` | Create — mutation hook for evento insertion |
| `src/pages/dashboard/EventForm.tsx` | Create — full form page |
| `src/App.tsx` | Add route `/dashboard/events/new` |

