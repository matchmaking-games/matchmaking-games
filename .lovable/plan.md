

## Prompt 03 — ProfessionalsSidebar

### 1 arquivo novo: `src/components/professionals/ProfessionalsSidebar.tsx`

Nenhum arquivo existente alterado.

---

### Props

```ts
interface ProfessionalsSidebarProps {
  filters: ProfessionalFilters;
  onFilterChange: (key: string, value: string | null) => void;
  onHabilidadesChange: (ids: string[]) => void;
  onEstadoChange: (uf: string | null) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}
```

### Estrutura visual (mesmo wrapper Card + spacing da JobsSidebar)

```
<Card className="p-4 space-y-6 lg:sticky lg:top-24">

  1. HEADER — "Filtros" + Badge com activeFilterCount (mesmo padrão JobsSidebar)

  2. LIMPAR FILTROS — Botão variant="outline" com ícone X, visível só se activeFilterCount > 0

  3. DISPONIBILIDADE — Checkbox "Apenas disponíveis para trabalho"
     checked = filters.disponivel === true
     onCheckedChange → onFilterChange("disponivel", checked ? "true" : null)

  4. MODALIDADE — Label "Modalidade" + 3 checkboxes (Remoto, Híbrido, Presencial)
     Estado vem de filters.tipoTrabalho (array)
     Ao marcar/desmarcar → recalcular array → onFilterChange("trabalho", arr.join(",") || null)

  5. ESTADO — Select com estados via useIBGELocations()
     Mesmo padrão da JobsSidebar (Select com __all__)
     onChange → onEstadoChange(uf | null)
     Sem cascade de cidade (profissionais não têm filtro de cidade)

  6. HABILIDADES — Seção mais complexa:
     - Query inline via useQuery: supabase.from("habilidades").select("id, nome, categoria").order("nome")
       queryKey: ["available-skills-sidebar"], staleTime: Infinity
     - Loading: 3x Skeleton h-4
     - Error: texto muted "Não foi possível carregar as habilidades"
     - Input de busca com ícone Search (client-side filter por nome, case-insensitive)
     - Contador "N selecionada(s)" se filters.habilidades?.length > 0
     - Lista agrupada por categoria ("HABILIDADES" e "SOFTWARES" como labels uppercase)
       Cada item = Checkbox + label nome
       Grupos vazios após filtro de busca não renderizam
     - max-h-64 overflow-y-auto na lista
     - onCheckedChange → toggle id no array → onHabilidadesChange(newArray)

</Card>
```

### Detalhes de implementação

- **Estados (IBGE)**: Reutiliza `useIBGELocations()` existente, sem buscar municípios (não há filtro de cidade)
- **Habilidades**: useQuery inline no componente (não hook separado), retorno `{ data, isLoading, isError }`
- **Modalidade checkboxes**: Estado local derivado de `filters.tipoTrabalho`. Ao toggle, monta novo array e serializa como `"remoto,hibrido"` para `onFilterChange("trabalho", ...)`. Se vazio, passa `null`.
- **Estilo**: Idêntico à JobsSidebar — Card, Label text-sm, space-y-6 entre seções, Badge secondary no header

