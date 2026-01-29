

## Plano Atualizado: Filtros e Busca na Pagina de Vagas (/jobs)

### Visao Geral

Adicionar funcionalidade completa de filtros e busca por texto na pagina de listagem de vagas. Os filtros serao sincronizados com a URL (query params) permitindo compartilhar links filtrados. A busca por texto tera debounce de 500ms.

---

### Estado Atual do Codigo

| Arquivo | Status |
|---------|--------|
| `src/hooks/useAvailableSkills.ts` | Ja existe e funciona |
| `src/components/jobs/JobCardSkeleton.tsx` | Ja existe com JobsSkeletonGrid |
| `src/hooks/useJobs.ts` | Existe, precisa aceitar filtros |
| `src/components/jobs/JobsSidebar.tsx` | Existe, filtros estao disabled |
| `src/pages/Jobs.tsx` | Existe, precisa de campo de busca |
| `src/hooks/useDebounce.ts` | Nao existe, precisa criar |
| `src/hooks/useJobFilters.ts` | Nao existe, precisa criar |

---

### Estrutura de Arquivos

| Acao | Arquivo | Descricao |
|------|---------|-----------|
| Criar | `src/hooks/useDebounce.ts` | Hook reutilizavel para debounce |
| Criar | `src/hooks/useJobFilters.ts` | Hook para gerenciar filtros via URL |
| Modificar | `src/hooks/useJobs.ts` | Adicionar parametros de filtro na query |
| Modificar | `src/components/jobs/JobsSidebar.tsx` | Ativar filtros + multi-select de habilidades |
| Modificar | `src/pages/Jobs.tsx` | Campo de busca + contador de resultados |

---

### Secao Tecnica

#### 1. Hook useDebounce.ts (Novo)

Hook reutilizavel para aplicar debounce em valores:

```typescript
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

---

#### 2. Hook useJobFilters.ts (Novo)

Gerencia estado dos filtros sincronizado com URL query params:

```typescript
import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback } from "react";

export interface JobFilters {
  nivel: string | null;
  tipoContrato: string | null;
  modeloTrabalho: string | null;
  localizacao: string | null;
  habilidades: string[];
  searchText: string | null;
}

export function useJobFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: JobFilters = useMemo(() => ({
    nivel: searchParams.get("nivel"),
    tipoContrato: searchParams.get("contrato"),
    modeloTrabalho: searchParams.get("modelo"),
    localizacao: searchParams.get("local"),
    habilidades: searchParams.get("skills")?.split(",").filter(Boolean) || [],
    searchText: searchParams.get("q"),
  }), [searchParams]);

  const setFilter = useCallback((key: string, value: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setHabilidades = useCallback((ids: string[]) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (ids.length === 0) {
        next.delete("skills");
      } else {
        next.set("skills", ids.join(","));
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const clearAllFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.nivel) count++;
    if (filters.tipoContrato) count++;
    if (filters.modeloTrabalho) count++;
    if (filters.localizacao) count++;
    if (filters.habilidades.length > 0) count++;
    if (filters.searchText) count++;
    return count;
  }, [filters]);

  return {
    filters,
    setFilter,
    setHabilidades,
    clearAllFilters,
    activeFilterCount,
    hasActiveFilters: activeFilterCount > 0,
  };
}
```

---

#### 3. Modificar useJobs.ts

Atualizar para aceitar parametros de filtro. **Inclui correcoes dos Problemas 3 e 4:**

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// ... tipos existentes mantidos ...

export interface JobFiltersParams {
  nivel?: string | null;
  tipoContrato?: string | null;
  modeloTrabalho?: string | null;
  localizacao?: string | null;
  habilidades?: string[];
  searchText?: string | null;
}

async function fetchJobs(filters: JobFiltersParams): Promise<VagaListItem[]> {
  const now = new Date().toISOString();

  // PROBLEMA 3 CORRIGIDO: Usar optional chaining para evitar edge case de array vazio
  // filters.habilidades?.length retorna undefined se null/undefined, 0 se [], N se tem IDs
  let vagaIdsWithSkills: string[] | null = null;
  
  if (filters.habilidades?.length) {
    const { data: vagaHabilidades, error: skillsError } = await supabase
      .from("vaga_habilidades")
      .select("vaga_id")
      .in("habilidade_id", filters.habilidades);
    
    if (skillsError) {
      console.error("Error fetching vaga_habilidades:", skillsError);
      throw new Error("Erro ao filtrar por habilidades.");
    }
    
    vagaIdsWithSkills = [...new Set(vagaHabilidades?.map(vh => vh.vaga_id) || [])];
    
    if (vagaIdsWithSkills.length === 0) {
      return [];
    }
  }

  let query = supabase
    .from("vagas")
    .select(`
      id,
      titulo,
      slug,
      nivel,
      remoto,
      tipo_contrato,
      tipo_publicacao,
      tipo_funcao,
      localizacao,
      criada_em,
      estudio:estudios(nome, slug, logo_url, localizacao),
      vaga_habilidades(
        id,
        obrigatoria,
        habilidade:habilidades(id, nome, categoria)
      )
    `)
    .eq("ativa", true)
    .gt("expira_em", now);

  if (filters.nivel) {
    query = query.eq("nivel", filters.nivel);
  }
  
  if (filters.tipoContrato) {
    query = query.eq("tipo_contrato", filters.tipoContrato);
  }
  
  if (filters.modeloTrabalho) {
    query = query.eq("remoto", filters.modeloTrabalho);
  }
  
  if (filters.localizacao) {
    query = query.ilike("localizacao", `%${filters.localizacao}%`);
  }
  
  if (vagaIdsWithSkills) {
    query = query.in("id", vagaIdsWithSkills);
  }
  
  // PROBLEMA 4: Comentario de performance para busca por texto
  // PERFORMANCE: Busca por texto usando .ilike() faz sequential scan.
  // Para MVP (<500 vagas) e aceitavel (~50-100ms com debounce de 500ms).
  // 
  // Se queries ficarem lentas (>500ms) no futuro:
  // 1. Adicionar indice GIN full-text search
  // 2. Ou limitar busca apenas ao campo 'titulo'
  // 3. Ou considerar Algolia quando passar de 5000 vagas
  if (filters.searchText) {
    const searchTerm = `%${filters.searchText}%`;
    query = query.or(`titulo.ilike.${searchTerm},descricao.ilike.${searchTerm}`);
  }

  query = query
    .order("tipo_publicacao", { ascending: false })
    .order("criada_em", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching jobs:", error);
    throw new Error("Nao foi possivel carregar as vagas.");
  }

  return (data || []) as VagaListItem[];
}

export function useJobs(filters: JobFiltersParams = {}) {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => fetchJobs(filters),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}
```

---

#### 4. Modificar JobsSidebar.tsx

Transformar filtros visuais em funcionais. Usar hook `useAvailableSkills` que ja existe:

```typescript
import { X, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAvailableSkills, Habilidade } from "@/hooks/useAvailableSkills";
import { JobFilters } from "@/hooks/useJobFilters";

interface JobsSidebarProps {
  filters: JobFilters;
  onFilterChange: (key: string, value: string | null) => void;
  onHabilidadesChange: (ids: string[]) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}

function groupSkillsByCategory(skills: Habilidade[]) {
  return {
    engine: skills.filter(s => s.categoria === "engine"),
    linguagem: skills.filter(s => s.categoria === "linguagem"),
    ferramenta: skills.filter(s => s.categoria === "ferramenta"),
    soft_skill: skills.filter(s => s.categoria === "soft_skill"),
  };
}

export function JobsSidebar({
  filters,
  onFilterChange,
  onHabilidadesChange,
  onClearAll,
  activeFilterCount,
}: JobsSidebarProps) {
  const { availableSkills, loading: loadingSkills } = useAvailableSkills();
  const groupedSkills = groupSkillsByCategory(availableSkills);

  const handleSkillToggle = (skillId: string, checked: boolean) => {
    const current = filters.habilidades || [];
    const next = checked
      ? [...current, skillId]
      : current.filter(id => id !== skillId);
    onHabilidadesChange(next);
  };

  const removeSkill = (skillId: string) => {
    const next = (filters.habilidades || []).filter(id => id !== skillId);
    onHabilidadesChange(next);
  };

  const selectedSkillNames = (filters.habilidades || [])
    .map(id => availableSkills.find(s => s.id === id))
    .filter(Boolean) as Habilidade[];

  return (
    <Card className="p-4 space-y-6 lg:sticky lg:top-24">
      {/* Header com contador */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Filtros</h2>
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeFilterCount} {activeFilterCount === 1 ? "ativo" : "ativos"}
          </Badge>
        )}
      </div>

      {/* Nivel - AGORA FUNCIONAL */}
      <div className="space-y-2">
        <Label className="text-sm">Nivel</Label>
        <Select
          value={filters.nivel || ""}
          onValueChange={(v) => onFilterChange("nivel", v || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os niveis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os niveis</SelectItem>
            <SelectItem value="iniciante">Iniciante</SelectItem>
            <SelectItem value="junior">Junior</SelectItem>
            <SelectItem value="pleno">Pleno</SelectItem>
            <SelectItem value="senior">Senior</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tipo de Contrato - AGORA FUNCIONAL */}
      <div className="space-y-2">
        <Label className="text-sm">Tipo de Contrato</Label>
        <Select
          value={filters.tipoContrato || ""}
          onValueChange={(v) => onFilterChange("contrato", v || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os tipos</SelectItem>
            <SelectItem value="clt">CLT</SelectItem>
            <SelectItem value="pj">PJ</SelectItem>
            <SelectItem value="freelance">Freelance</SelectItem>
            <SelectItem value="estagio">Estagio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Modelo de Trabalho - AGORA FUNCIONAL */}
      <div className="space-y-2">
        <Label className="text-sm">Modelo de Trabalho</Label>
        <Select
          value={filters.modeloTrabalho || ""}
          onValueChange={(v) => onFilterChange("modelo", v || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os modelos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os modelos</SelectItem>
            <SelectItem value="presencial">Presencial</SelectItem>
            <SelectItem value="hibrido">Hibrido</SelectItem>
            <SelectItem value="remoto">Remoto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Localizacao - AGORA FUNCIONAL */}
      <div className="space-y-2">
        <Label className="text-sm">Localizacao</Label>
        <Input
          placeholder="Ex: Sao Paulo"
          value={filters.localizacao || ""}
          onChange={(e) => onFilterChange("local", e.target.value || null)}
        />
      </div>

      {/* Habilidades com Collapsible por categoria */}
      <div className="space-y-3">
        <Label className="text-sm">Habilidades</Label>
        
        {/* Badges das habilidades selecionadas */}
        {selectedSkillNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pb-2">
            {selectedSkillNames.map((skill) => (
              <Badge key={skill.id} variant="secondary" className="text-xs gap-1 pr-1">
                {skill.nome}
                <button
                  type="button"
                  onClick={() => removeSkill(skill.id)}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {loadingSkills ? (
          <p className="text-xs text-muted-foreground">Carregando...</p>
        ) : (
          <div className="space-y-2">
            <SkillCategoryCollapsible
              label="Engines"
              skills={groupedSkills.engine}
              selectedIds={filters.habilidades || []}
              onToggle={handleSkillToggle}
            />
            <SkillCategoryCollapsible
              label="Linguagens"
              skills={groupedSkills.linguagem}
              selectedIds={filters.habilidades || []}
              onToggle={handleSkillToggle}
            />
            <SkillCategoryCollapsible
              label="Ferramentas"
              skills={groupedSkills.ferramenta}
              selectedIds={filters.habilidades || []}
              onToggle={handleSkillToggle}
            />
            <SkillCategoryCollapsible
              label="Soft Skills"
              skills={groupedSkills.soft_skill}
              selectedIds={filters.habilidades || []}
              onToggle={handleSkillToggle}
            />
          </div>
        )}
      </div>

      {/* Botao Limpar Filtros */}
      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={onClearAll}>
          <X className="w-4 h-4 mr-2" />
          Limpar filtros
        </Button>
      )}
    </Card>
  );
}

function SkillCategoryCollapsible({
  label,
  skills,
  selectedIds,
  onToggle,
}: {
  label: string;
  skills: Habilidade[];
  selectedIds: string[];
  onToggle: (id: string, checked: boolean) => void;
}) {
  const selectedCount = skills.filter(s => selectedIds.includes(s.id)).length;

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm text-left hover:bg-muted/50 rounded px-2 -mx-2">
        <span className="text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <Badge variant="secondary" className="text-xs h-5 px-1.5">
              {selectedCount}
            </Badge>
          )}
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pt-2 pb-1">
        {skills.map((skill) => (
          <label
            key={skill.id}
            className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/30 rounded px-2 py-1 -mx-2"
          >
            <Checkbox
              checked={selectedIds.includes(skill.id)}
              onCheckedChange={(checked) => onToggle(skill.id, !!checked)}
            />
            <span>{skill.nome}</span>
          </label>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
```

---

#### 5. Modificar Jobs.tsx

Adicionar campo de busca, integrar filtros e mostrar contador de resultados:

```typescript
import { useState, useEffect } from "react";
import { Briefcase, Search, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { JobCard } from "@/components/jobs/JobCard";
import { JobsSidebar } from "@/components/jobs/JobsSidebar";
import { JobsSkeletonGrid } from "@/components/jobs/JobCardSkeleton";
import { useJobs } from "@/hooks/useJobs";
import { useJobFilters } from "@/hooks/useJobFilters";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/use-toast";

export default function Jobs() {
  const { toast } = useToast();
  const {
    filters,
    setFilter,
    setHabilidades,
    clearAllFilters,
    activeFilterCount,
    hasActiveFilters,
  } = useJobFilters();

  // Estado local para input de busca (antes do debounce)
  const [searchInput, setSearchInput] = useState(filters.searchText || "");
  
  // Debounce do texto de busca (500ms)
  const debouncedSearch = useDebounce(searchInput, 500);

  // Sincronizar debounced search com URL
  useEffect(() => {
    if (debouncedSearch !== filters.searchText) {
      setFilter("q", debouncedSearch || null);
    }
  }, [debouncedSearch, filters.searchText, setFilter]);

  // Preparar filtros para a query
  const queryFilters = {
    nivel: filters.nivel,
    tipoContrato: filters.tipoContrato,
    modeloTrabalho: filters.modeloTrabalho,
    localizacao: filters.localizacao,
    habilidades: filters.habilidades,
    searchText: debouncedSearch,
  };

  const { data: jobs, isLoading, error } = useJobs(queryFilters);

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar vagas",
        description: "Nao foi possivel carregar as vagas. Tente novamente mais tarde.",
        variant: "destructive",
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

  const resultCount = jobs?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-16">
        {/* Hero Section */}
        <div className="bg-card border-b border-border py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Vagas
            </h1>
            <p className="text-muted-foreground mt-2">
              Encontre sua proxima oportunidade na industria de games
            </p>
          </div>
        </div>

        {/* Content with Sidebar */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Filters */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <JobsSidebar
                filters={filters}
                onFilterChange={setFilter}
                onHabilidadesChange={setHabilidades}
                onClearAll={handleClearAll}
                activeFilterCount={activeFilterCount}
              />
            </aside>

            {/* Main Content */}
            <main className="flex-1 space-y-4">
              {/* Campo de Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar vagas por titulo ou descricao..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Contador de Resultados */}
              {!isLoading && (
                <p className="text-sm text-muted-foreground">
                  {resultCount === 0
                    ? "Nenhuma vaga encontrada"
                    : resultCount === 1
                    ? "1 vaga encontrada"
                    : `${resultCount} vagas encontradas`}
                </p>
              )}

              {/* Grid de Vagas */}
              {isLoading ? (
                <JobsSkeletonGrid />
              ) : !jobs || jobs.length === 0 ? (
                <EmptyState hasFilters={hasActiveFilters} onClear={handleClearAll} />
              ) : (
                <div className="grid gap-4">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  hasFilters: boolean;
  onClear: () => void;
}

function EmptyState({ hasFilters, onClear }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Briefcase className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        {hasFilters
          ? "Nenhuma vaga encontrada com esses filtros"
          : "Nenhuma vaga disponivel no momento"}
      </h3>
      <p className="text-muted-foreground max-w-md mb-4">
        {hasFilters
          ? "Tente ajustar sua busca ou remover alguns filtros."
          : "Volte em breve! Novas oportunidades sao publicadas regularmente."}
      </p>
      {hasFilters && (
        <button
          onClick={onClear}
          className="text-primary hover:underline text-sm font-medium"
        >
          Limpar todos os filtros
        </button>
      )}
    </div>
  );
}
```

---

### Ordem de Implementacao

| Ordem | Arquivo | Acao |
|-------|---------|------|
| 1 | `src/hooks/useDebounce.ts` | Criar |
| 2 | `src/hooks/useJobFilters.ts` | Criar |
| 3 | `src/hooks/useJobs.ts` | Modificar |
| 4 | `src/components/jobs/JobsSidebar.tsx` | Modificar |
| 5 | `src/pages/Jobs.tsx` | Modificar |

---

### Correcoes Incorporadas

| Problema | Solucao |
|----------|---------|
| Problema 1: useAvailableSkills | Ja existe no projeto - nenhuma acao necessaria |
| Problema 2: JobsSkeletonGrid | Ja existe no projeto - nenhuma acao necessaria |
| Problema 3: Edge case array vazio | Usar `filters.habilidades?.length` para verificacao segura |
| Problema 4: Performance busca texto | Comentario explicativo adicionado no codigo |

---

### Checklist de Validacoes

| Item | Implementacao |
|------|---------------|
| Filtros sincronizados com URL | useSearchParams |
| Debounce de 500ms na busca | useDebounce hook |
| Query unica para filtros simples | Supabase query builder |
| Filtro de habilidades com .in() | Query em vaga_habilidades + .in("id", ids) |
| Busca case-insensitive | .ilike() |
| Contador de resultados | jobs.length |
| Contador de filtros ativos | activeFilterCount |
| Botao limpar filtros | clearAllFilters() |
| Multi-select de habilidades | Collapsible + Checkbox |
| Badges removiveis | Badge com botao X |
| Estado vazio com filtros | Mensagem diferenciada |
| Loading state | JobsSkeletonGrid (ja existe) |
| Hook de habilidades | useAvailableSkills (ja existe) |

