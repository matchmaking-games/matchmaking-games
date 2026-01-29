import { useState, useEffect } from "react";
import { Briefcase, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/JobCard";
import { JobsSidebar } from "@/components/jobs/JobsSidebar";
import { JobsSkeletonGrid } from "@/components/jobs/JobCardSkeleton";
import { useJobs, JobCursor } from "@/hooks/useJobs";
import { useJobFilters } from "@/hooks/useJobFilters";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/use-toast";
export default function Jobs() {
  const {
    toast
  } = useToast();
  const {
    filters,
    setFilter,
    setHabilidades,
    clearAllFilters,
    activeFilterCount,
    hasActiveFilters
  } = useJobFilters();

  // Estado local para input de busca (antes do debounce)
  const [searchInput, setSearchInput] = useState(filters.searchText || "");

  // Debounce do texto de busca (500ms)
  const debouncedSearch = useDebounce(searchInput, 500);

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [cursors, setCursors] = useState<(JobCursor | null)[]>([null]);

  // Chave que representa todos os filtros (para reset de paginação)
  const filtersKey = JSON.stringify({
    nivel: filters.nivel,
    tipoContrato: filters.tipoContrato,
    modeloTrabalho: filters.modeloTrabalho,
    localizacao: filters.localizacao,
    habilidades: filters.habilidades,
    searchText: debouncedSearch
  });

  // Reset de paginação quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
    setCursors([null]);
  }, [filtersKey]);

  // Sincronizar debounced search com URL
  useEffect(() => {
    if (debouncedSearch !== filters.searchText) {
      setFilter("q", debouncedSearch || null);
    }
  }, [debouncedSearch, filters.searchText, setFilter]);

  // Cursor atual para a query
  const currentCursor = cursors[currentPage - 1] || null;

  // Preparar filtros para a query
  const queryFilters = {
    nivel: filters.nivel,
    tipoContrato: filters.tipoContrato,
    modeloTrabalho: filters.modeloTrabalho,
    localizacao: filters.localizacao,
    habilidades: filters.habilidades,
    searchText: debouncedSearch,
    pageSize: 20,
    cursor: currentCursor
  };
  const {
    data,
    isLoading,
    error
  } = useJobs(queryFilters);
  const jobs = data?.jobs || [];
  const hasNextPage = data?.hasNextPage || false;
  const nextCursor = data?.nextCursor || null;
  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar vagas",
        description: "Não foi possível carregar as vagas. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  }, [error, toast]);
  const clearSearch = () => {
    setSearchInput("");
    setFilter("q", null);
  };
  const handleClearAll = () => {
    setSearchInput("");
    clearAllFilters();
  };
  const goToNextPage = () => {
    if (hasNextPage && nextCursor) {
      setCursors(prev => {
        const next = [...prev];
        next[currentPage] = nextCursor;
        return next;
      });
      setCurrentPage(prev => prev + 1);
    }
  };
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  return <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-16">
        {/* Hero Section */}
        <div className="bg-card border-b border-border py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-display font-bold text-foreground text-center">
              Vagas
            </h1>
            <p className="text-muted-foreground mt-2 text-center">
              Encontre sua próxima oportunidade na indústria de games
            </p>
          </div>
        </div>

        {/* Content with Sidebar */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Filters */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <JobsSidebar filters={filters} onFilterChange={setFilter} onHabilidadesChange={setHabilidades} onClearAll={handleClearAll} activeFilterCount={activeFilterCount} />
            </aside>

            {/* Main Content */}
            <main className="flex-1 space-y-4">
              {/* Campo de Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="text" placeholder="Buscar vagas por título ou descrição..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="pl-10 pr-10" />
                {searchInput && <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>}
              </div>

              {/* Grid de Vagas */}
              {isLoading ? <JobsSkeletonGrid /> : jobs.length === 0 ? <EmptyState hasFilters={hasActiveFilters} onClear={handleClearAll} /> : <>
                  <div className="grid gap-4">
                    {jobs.map(job => <JobCard key={job.id} job={job} />)}
                  </div>

                  {/* Paginação */}
                  <div className="flex items-center justify-center gap-4 pt-6">
                    <Button variant="outline" size="sm" onClick={goToPreviousPage} disabled={currentPage === 1 || isLoading}>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>

                    <span className="text-sm text-muted-foreground">
                      Página {currentPage}
                    </span>

                    <Button variant="outline" size="sm" onClick={goToNextPage} disabled={!hasNextPage || isLoading}>
                      Próxima
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </>}
            </main>
          </div>
        </div>
      </div>
    </div>;
}
interface EmptyStateProps {
  hasFilters: boolean;
  onClear: () => void;
}
function EmptyState({
  hasFilters,
  onClear
}: EmptyStateProps) {
  return <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Briefcase className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        {hasFilters ? "Nenhuma vaga encontrada com esses filtros" : "Nenhuma vaga disponível no momento"}
      </h3>
      <p className="text-muted-foreground max-w-md mb-4">
        {hasFilters ? "Tente ajustar sua busca ou remover alguns filtros." : "Volte em breve! Novas oportunidades são publicadas regularmente."}
      </p>
      {hasFilters && <button onClick={onClear} className="text-primary hover:underline text-sm font-medium">
          Limpar todos os filtros
        </button>}
    </div>;
}