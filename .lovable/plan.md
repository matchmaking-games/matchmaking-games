

## Plano: Criar página Projects.tsx

Replicar a estrutura exata de `Studios.tsx`, adaptando para projetos. Diferenças: grid `lg:grid-cols-3` (em vez de 2), ícone `Gamepad2`, e hooks/componentes de projeto.

### Estrutura

Cópia fiel de Studios.tsx com estas substituições:

| Studios.tsx | Projects.tsx |
|---|---|
| `useStudioFilters` | `useProjectFilters` |
| `useStudios` | `useProjectSearch` |
| `StudiosSidebar` | `ProjectsSidebar` |
| `StudioCard` | `ProjectSearchCard` |
| `StudioCardSkeletonGrid` | `ProjectSearchCardSkeletonGrid` |
| `StudioCursor` | `ProjectCursor` |
| `Building2` | `Gamepad2` |
| `lg:grid-cols-2` | `lg:grid-cols-3` |

### Sidebar props
```
filters, setFilter, setPlataformas, setGenero, handleClearAll, activeFilterCount
```

### filtersKey
```typescript
JSON.stringify({ engine: filters.engine, plataformas: filters.plataformas, genero: filters.genero, searchText: debouncedSearch })
```

### Textos
- Hero: "Projetos" / "Conheça os projetos da comunidade de games do Brasil"
- Search placeholder: "Buscar por título ou descrição..."
- Empty com filtros: "Nenhum projeto encontrado com esses filtros"
- Empty sem filtros: "Nenhum projeto cadastrado ainda"
- Toast erro: "Erro ao carregar projetos"

### Arquivos afetados
- `src/pages/Projects.tsx` (criar)

