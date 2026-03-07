

## Fix: Multi-studio Navigation Safety

Two files, no other changes.

### Change 1 — `src/hooks/useActiveStudio.ts`

Remove the `|| studios[0]` fallback on line 17-18. Replace with:

```ts
const activeStudio = studioId
  ? studios.find((s) => s.estudio.id === studioId) ?? null
  : null;
```

No other changes to this file.

### Change 2 — `src/components/studio/StudioDashboardLayout.tsx`

Add `useSearchParams` import and `Building2` icon. Read `studioId` from search params directly.

Add a `useEffect` for auto-redirect when studios exist but no `?studio=` param:

```ts
useEffect(() => {
  if (!isLoading && studios.length > 0 && !searchParams.get("studio")) {
    setActiveStudio(studios[0].estudio.id);
  }
}, [isLoading, studios, searchParams, setActiveStudio]);
```

Update the rendering logic after the loading spinner, in this order:

1. `studios.length === 0` → redirect to `/studio/manage/new` (existing)
2. `!searchParams.get("studio")` → show spinner (auto-redirect useEffect will fire)
3. `!activeStudio && studios.length > 0` → render layout with sidebar using `studios[0]` as membership, main content shows "Estúdio não encontrado" with Building2 icon, title, and description centered
4. `activeStudio` exists → render normally (existing)

The "not found" state reuses the full layout shell (SidebarProvider, sidebar, mobile header) but replaces `{children}` with the informational message.

