

## Plano: Correção cross-browser de parsing de datas `"YYYY-MM"`

### Problema
`new Date("2023-05")` retorna `Invalid Date` no Safari/mobile, causando `RangeError: Invalid time value` que derruba a página de experiências.

### Arquivos afetados (4 alterações + 1 criação de função)

**1. `src/lib/formatters.ts`** — Adicionar e exportar `parseDateSafe`:
```typescript
export function parseDateSafe(dateStr: string): Date {
  const safe = dateStr.length === 7 ? dateStr + "-01" : dateStr.substring(0, 10);
  const [year, month, day] = safe.split("-").map(Number);
  return new Date(year, month - 1, day);
}
```
Substituir `new Date(inicio)` e `new Date(fim)` por `parseDateSafe()` na função `formatDateRange`.

**2. `src/hooks/useExperiences.ts`** — Importar `parseDateSafe` e substituir 5 ocorrências:
- Linha 78: `new Date(newCargo.inicio)` → `parseDateSafe(newCargo.inicio)`
- Linha 79: `new Date(newCargo.fim)` → `parseDateSafe(newCargo.fim)`
- Linha 82: `new Date(existing.inicio)` → `parseDateSafe(existing.inicio)`
- Linha 83: `new Date(existing.fim)` → `parseDateSafe(existing.fim)`
- Linhas 158-159: `.sort()` — substituir ambos `new Date(...)` por `parseDateSafe(...)`

**3. `src/hooks/usePublicProfile.ts`** — Importar `parseDateSafe` e corrigir linha 216 no `.sort()`.

**4. `src/components/experience/ExperienceModal.tsx`** — No `onSubmit`, os modos `edit` e `create` (linhas 296 e 316) ainda gravam `data.inicio` e `data.fim` como `"YYYY-MM"`. Substituir por `inicioDate` e `fimDate` (que já existem nas linhas 267-268 com `-01` appendado) em todos os 3 modos.

### O que NÃO muda
- Schemas Zod, MonthYearPicker, componentes de UI, layout, estilos
- Campos ISO completo (`created_at`, `expira_em`, etc.) — já são seguros

