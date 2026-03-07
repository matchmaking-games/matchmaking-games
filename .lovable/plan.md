

## Fix: Education Dates — Switch from MM/YYYY to Year-only (YYYY)

Three targeted changes across three files to fix the "undefined 2022" bug and standardize education dates to year-only format.

### Change 1 — `src/components/education/EducationModal.tsx`

- Remove `MonthYearPicker` import (line 16) and `currentMonth` variable (line 176)
- Update Zod schema: replace `inicio` and `fim` validation with a custom year validator that accepts empty string or 4-digit year between 1900 and current year, with error message "Informe um ano válido (ex: 2020)"
- In the `useEffect` that populates editing data (lines 109-110): change `.substring(0, 7)` to `.substring(0, 4)` for both `inicio` and `fim`
- Replace both `MonthYearPicker` usages (lines 262-267 and 282-287) with simple `<Input>` fields: `placeholder="Ex: 2020"`, `type="text"`, `maxLength={4}`

### Change 2 — `src/lib/formatters.ts`

Rewrite `formatEducationPeriod` to work with year-only strings:
- No `inicio` and no `fim`: return "Em andamento" or "Concluído" based on `concluido`
- Both present: show `startYear - endYear` (or just one year if equal)
- Only `inicio`: show `year - Em andamento` or `Concluído em year`
- Only `fim`: show the year
- Use `.substring(0, 4)` to handle legacy "YYYY-MM" values
- Remove the `date-fns` usage within this function (the `format`/`capitalize` calls)

### Change 3 — `src/components/ImportReviewDrawer.tsx`

Add defensive `.substring(0, 4)` in the `mappedEducation` construction (lines 469-470):
```ts
inicio: edu.start_year ? String(edu.start_year).substring(0, 4) : "",
fim: edu.end_year ? String(edu.end_year).substring(0, 4) : null,
```

No other files are touched.

