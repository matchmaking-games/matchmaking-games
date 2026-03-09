
## Prompt 04 — Página: Professionals.tsx

### 1 arquivo novo: `src/pages/Professionals.tsx`

Nenhum arquivo existente alterado.

---

### Estrutura (replica Jobs.tsx linha a linha)

```tsx
// Imports
- useState, useEffect from react
- Users, Search, X, ChevronLeft, ChevronRight from lucide-react
- Header, Footer
- Input, Button
- ProfessionalCard, ProfessionalCardSkeletonGrid
- ProfessionalsSidebar
- useProfessionals, useProfessionalFilters
- useDebounce, useToast
- ProfessionalCursor type

// Component
export default function Professionals() {
  // Hooks de filtros
  const { filters, setFilter, setHabilidades, setEstado, clearAllFilters, activeFilterCount, hasActiveFilters } = useProfessionalFilters()
  
  // Estado local de busca + debounce
  const [searchInput, setSearchInput] = useState(filters.searchText || "")
  const debouncedSearch = useDebounce(searchInput, 500)
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [cursors, setCursors] = useState<(ProfessionalCursor | null)[]>([null])
  
  // filtersKey para reset de paginação
  const filtersKey = JSON.stringify({
    disponivel: filters.disponivel,
    estado: filters.estado,
    tipoTrabalho: filters.tipoTrabalho,
    habilidades: filters.habilidades,
    searchText: debouncedSearch
  })
  
  // useEffects: reset paginação, sync debounce→URL, toast de erro
  
  // Query
  const { data, isLoading, error } = useProfessionals({
    searchText: debouncedSearch || null,
    disponivel: filters.disponivel,
    estado: filters.estado,
    tipoTrabalho: filters.tipoTrabalho,
    habilidades: filters.habilidades,
    pageSize: 20,
    cursor: currentCursor
  })
  
  // Extract: professionals, hasNextPage, nextCursor
  
  // Handlers: clearSearch, handleClearAll, goToNextPage, goToPreviousPage
}
```

---

### Layout JSX

```
<div className="min-h-screen bg-background">
  <Header />
  <div className="pt-16">
    
    {/* Hero Section */}
    <div className="bg-card border-b border-border py-8">
      <h1>Profissionais</h1>
      <p>Encontre talentos da indústria de games no Brasil</p>
    </div>
    
    {/* Content */}
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <ProfessionalsSidebar ... />
        </aside>
        
        {/* Main */}
        <main className="flex-1 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search /> <Input /> {searchInput && <X />}
          </div>
          
          {/* Grid */}
          {isLoading ? <ProfessionalCardSkeletonGrid /> 
           : professionals.length === 0 ? <EmptyState /> 
           : <>
               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                 {professionals.map(p => <ProfessionalCard key={p.id} professional={p} />)}
               </div>
               {/* Pagination */}
               <div className="flex items-center justify-center gap-4 pt-6">
                 <Button>Anterior</Button>
                 <span>Página {currentPage}</span>
                 <Button>Próxima</Button>
               </div>
             </>
          }
        </main>
      </div>
    </div>
  </div>
  <Footer />
</div>
```

---

### EmptyState local

```tsx
function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Users className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3>
        {hasFilters 
          ? "Nenhum profissional encontrado com esses filtros" 
          : "Nenhum profissional cadastrado ainda"}
      </h3>
      <p>
        {hasFilters 
          ? "Tente ajustar sua busca ou remover alguns filtros." 
          : "Volte em breve! Novos profissionais se cadastram regularmente."}
      </p>
      {hasFilters && <button onClick={onClear}>Limpar todos os filtros</button>}
    </div>
  )
}
```

---

### O que NÃO muda
Nenhum arquivo existente é tocado — App.tsx, hooks, componentes.

