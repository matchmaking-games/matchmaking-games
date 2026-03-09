

## Criar `src/components/studios/StudiosSidebar.tsx`

Um único arquivo novo seguindo o padrão exato do `ProfessionalsSidebar` — mesma estrutura de Card, header, botão limpar, seções com Label + Select/MultiSelect.

### Estrutura

- Card `p-4 space-y-6 lg:sticky lg:top-24`
- Header: "Filtros" + Badge contador (ativo/ativos)
- Botão "Limpar filtros" condicional
- **Estado**: Select com `useIBGELocations()`, `__all__` → null (sem cidade)
- **Tamanho**: Select com 5 opções fixas: `__all__`/micro/pequeno/medio/grande
- **Especialidades**: `MultiSelectCombobox` com constante local `ESPECIALIDADES_OPTIONS` (Mobile, PC, Console, VR, Casual, Indie, AA, AAA, F2P)

### Props
```ts
filters: StudioFilters
onFilterChange: (key: string, value: string | null) => void
onEspecialidadesChange: (items: string[]) => void
onEstadoChange: (uf: string | null) => void
onClearAll: () => void
activeFilterCount: number
```

### Imports
- `X` from lucide-react
- `Card`, `Label`, `Button`, `Badge`, `Select*`, `MultiSelectCombobox`
- `useIBGELocations`
- `StudioFilters` from types

Zero alterações em arquivos existentes.

