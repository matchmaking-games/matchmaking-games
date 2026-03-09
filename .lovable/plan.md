

## Plano: Criar componente ProjectsSidebar

Criar `src/components/projects/ProjectsSidebar.tsx` seguindo a estrutura exata de `StudiosSidebar.tsx` — mesma Card, header, botão limpar, e seções com Label + controle.

### Estrutura

```
Card (p-4 space-y-6 lg:sticky lg:top-24)
├── Header: "Filtros" + Badge count (idêntico às outras sidebars)
├── Botão "Limpar filtros" (condicional, idêntico)
├── Seção Engine: Label + Select com "__all__" + Object.entries(ENGINE_LABELS)
├── Seção Plataformas: Label + MultiSelectCombobox com PLATAFORMA_LABELS
└── Seção Gênero: Label + MultiSelectCombobox com GENERO_LABELS
```

### Props

```typescript
interface ProjectsSidebarProps {
  filters: ProjectFilters;
  onFilterChange: (key: string, value: string | null) => void;
  onPlataformasChange: (items: string[]) => void;
  onGeneroChange: (items: string[]) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}
```

### Detalhes

- Options para MultiSelectCombobox geradas via `Object.entries(LABELS).map(([value, label]) => ({ value, label }))`
- Engine Select: `value={filters.engine || "__all__"}`, onChange converte `"__all__"` para `null`
- Imports de labels de `@/constants/project-labels`
- Nenhum arquivo existente alterado

### Arquivos afetados
- `src/components/projects/ProjectsSidebar.tsx` (criar)

