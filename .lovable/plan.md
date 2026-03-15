

## Plan: Cache invalidation after event creation + Time selector simplification

### Changes

**File 1: `src/hooks/events/useCreateEvento.ts`**
- Add `useQueryClient` to the import from `@tanstack/react-query`
- Create `queryClient` instance inside the hook
- Add `onSuccess` callback that invalidates `["eventos", "meus"]` and `["eventos", "publicos"]` query keys

**File 2: `src/pages/dashboard/EventForm.tsx`**
- Remove `HOURS` and `MINUTES` constants (lines 86-87)
- Replace the entire `TimeSelect` component (lines 89-143) with the new single-select version using `TIME_OPTIONS` (48 options, 00:00 to 23:30 in 30-min intervals)
- The new component has the same `value`/`onChange` interface, so the two `FormField` usages remain unchanged

No other files are touched. Schema, submit logic, hooks, and layout stay as-is.

