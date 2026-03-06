

## Fix: Stripe Payment Flow (multi-studio)

Five problems across four files. All navigations must preserve `?studio=UUID`.

### Change 1 — `src/hooks/useJobForm.ts`

**Problem 5 (guard):** When `studioIdFromUrl` is null/empty, the fallback query (lines 123-138) picks a random studio. Replace it: if `!studioIdFromUrl`, set `isAuthorized = false`, `error = "Estúdio não identificado. Volte e tente novamente."`, and return early. Remove the fallback query block entirely.

**Problem 1 (navigates):** The hook receives `studioIdFromUrl` but all four `navigate()` calls go to `/studio/manage/jobs` without `?studio=`. Build a helper URL inside the hook:

```ts
const jobsUrl = studioIdFromUrl
  ? `/studio/manage/jobs?studio=${studioIdFromUrl}`
  : "/studio/manage/jobs";
```

Replace all four `navigate("/studio/manage/jobs")` calls (lines 366, 440, 523, 662) with `navigate(jobsUrl)`. Add `studioIdFromUrl` to each `useCallback` dependency array.

### Change 2 — `src/pages/studio/Jobs.tsx`

**Problem 2 (handlePaymentSuccess):** In `handlePaymentSuccess`, the cleanup navigate uses `activeStudio?.estudio.id` which may be null. Change to read `searchParams.get("studio")`:

```ts
const studioParam = searchParams.get("studio");
const cleanUrl = studioParam
  ? `/studio/manage/jobs?studio=${studioParam}`
  : "/studio/manage/jobs";
navigate(cleanUrl, { replace: true });
```

Add `searchParams` to the `useCallback` deps. Same fix in the `useEffect` that detects invalid session_id (line 146).

### Change 3 — `src/pages/studio/Dashboard.tsx`

**Problem 3 (cancelled toast):** Add `useSearchParams`, `useEffect`, and `useToast`. Detect `?payment=cancelled`:

```ts
const [searchParams] = useSearchParams();

useEffect(() => {
  if (searchParams.get("payment") === "cancelled") {
    toast({
      title: "Pagamento não concluído",
      description: "Sua vaga foi salva e está aguardando pagamento. Acesse 'Minhas Vagas' para retomar.",
    });
    const studioParam = searchParams.get("studio");
    navigate(
      studioParam ? `/studio/manage/dashboard?studio=${studioParam}` : "/studio/manage/dashboard",
      { replace: true }
    );
  }
}, [searchParams, toast, navigate]);
```

### Change 4 — `src/pages/studio/JobForm.tsx`

**Problem 4a (dead code):** Remove the `useEffect` at lines 98-110 that detects `?payment=cancelled` — it never fires.

**Problem 4b (navigates without ?studio=):** Three navigate calls need fixing:
- `handleCancelClick` (line 166): `navigate("/studio/manage/jobs")` → use studio param
- Back arrow button (line 445): same fix
- AlertDialog "Descartar e sair" (line 1044): same fix

All three should read `searchParams.get("studio")` and build the URL defensively (no `?studio=undefined`).

### Files touched
- `src/hooks/useJobForm.ts`
- `src/pages/studio/Jobs.tsx`
- `src/pages/studio/JobForm.tsx`
- `src/pages/studio/Dashboard.tsx`

### Not touched
Edge Functions, polling logic, modals, UI components, membership checks, layout components, `useActiveStudio`.

