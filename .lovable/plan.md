

## EventForm Visual Refactor

3 visual changes, no logic changes.

### 1. Wrap form in Card

- Import `Card`, `CardContent` from `@/components/ui/card`
- Header (title + "Ver eventos da comunidade" button) stays outside, above the Card
- The `<Form>` with `<form>` goes inside `<Card><CardContent className="pt-6">...</CardContent></Card>`

### 2. Fix Calendar centering

- Wrap `<Calendar>` in `<div className="flex justify-center">`
- Add `className="w-fit rounded-md border border-border"` to Calendar (move existing classes)

### 3. Replace time inputs with Select dropdowns

Each time field (`horario_inicio`, `horario_fim`) gets replaced:

- Remove `<Input type="time" />`
- Add two `Select` components side by side in `<div className="flex gap-2">`
  - Hour select: options "00"–"23", placeholder "HH"
  - Minute select: options "00","05","10"..."55", placeholder "MM"
- Use `useState` for `selectedHour`/`selectedMinute` inside each field's render
- `useEffect` to sync from `field.value` (parse existing "HH:MM" back into states)
- On either select change, combine and call `field.onChange(hour + ":" + minute)`
- Import `useState` alongside existing `useEffect`

**Hour options:** `Array.from({length: 24}, (_, i) => String(i).padStart(2, '0'))`
**Minute options:** `Array.from({length: 12}, (_, i) => String(i * 5).padStart(2, '0'))`

### Files modified

| File | Change |
|------|--------|
| `src/pages/dashboard/EventForm.tsx` | All 3 changes above |

No other files touched.

