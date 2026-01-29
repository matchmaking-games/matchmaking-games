

## Plano Atualizado: Paginacao Cursor-Based na Pagina de Vagas (/jobs)

### Visao Geral

Implementar paginacao cursor-based na listagem de vagas para melhorar performance e UX. A paginacao usara um cursor composto por (tipo_publicacao, criada_em, id) para manter a ordenacao correta.

---

### Correcoes Incorporadas

| Correcao | Detalhes |
|----------|----------|
| Sintaxe do cursor | `.or()` recebe UMA string com `and()` para condicoes compostas |
| Contador de vagas | Remover completamente quando ha paginacao |
| Componente de UI | Usar Button diretamente (nao Pagination do shadcn) |

---

### Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/hooks/useJobs.ts` | Adicionar suporte a `pageSize` e `cursor`, retornar `hasNextPage` e `nextCursor` |
| `src/pages/Jobs.tsx` | Adicionar estados de paginacao, componente de navegacao, remover contador, resetar quando filtros mudam |

---

### Secao Tecnica

#### 1. Modificar useJobs.ts

**Novos tipos a adicionar:**

```typescript
export interface JobCursor {
  tipo_publicacao: string | null;
  criada_em: string;
  id: string;
}

export interface JobFiltersParams {
  nivel?: string | null;
  tipoContrato?: string | null;
  modeloTrabalho?: string | null;
  localizacao?: string | null;
  habilidades?: string[];
  searchText?: string | null;
  pageSize?: number;
  cursor?: JobCursor | null;
}

export interface JobsQueryResult {
  jobs: VagaListItem[];
  hasNextPage: boolean;
  nextCursor: JobCursor | null;
}
```

**Sintaxe CORRETA do filtro de cursor:**

```typescript
if (cursor) {
  // Construir filtro OR com condicoes AND aninhadas
  // Formato: .or('cond1,and(cond2,cond3),and(cond4,cond5,cond6)')
  
  const tipoCursor = cursor.tipo_publicacao || 'gratuita'; // fallback para null
  
  // Condição 1: tipo_publicacao menor (gratuita vem depois de destaque em DESC)
  // Condição 2: mesmo tipo_publicacao, mas criada_em mais antiga
  // Condição 3: mesmo tipo_publicacao e criada_em, mas ID menor (desempate)
  
  const cursorFilter = [
    `tipo_publicacao.lt.${tipoCursor}`,
    `and(tipo_publicacao.eq.${tipoCursor},criada_em.lt.${cursor.criada_em})`,
    `and(tipo_publicacao.eq.${tipoCursor},criada_em.eq.${cursor.criada_em},id.lt.${cursor.id})`
  ].join(',');
  
  query = query.or(cursorFilter);
}
```

**Logica completa da funcao fetchJobs atualizada:**

```typescript
async function fetchJobs(filters: JobFiltersParams): Promise<JobsQueryResult> {
  const now = new Date().toISOString();
  const pageSize = filters.pageSize || 20;
  const cursor = filters.cursor;

  // ... codigo existente para filtro de habilidades ...

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

  // ... filtros existentes (nivel, tipoContrato, etc.) ...

  // Aplicar cursor para paginacao
  if (cursor) {
    const tipoCursor = cursor.tipo_publicacao || 'gratuita';
    const cursorFilter = [
      `tipo_publicacao.lt.${tipoCursor}`,
      `and(tipo_publicacao.eq.${tipoCursor},criada_em.lt.${cursor.criada_em})`,
      `and(tipo_publicacao.eq.${tipoCursor},criada_em.eq.${cursor.criada_em},id.lt.${cursor.id})`
    ].join(',');
    
    query = query.or(cursorFilter);
  }

  // ... filtro de busca por texto existente ...

  // Ordenacao e limite (buscar pageSize + 1 para detectar proxima pagina)
  query = query
    .order("tipo_publicacao", { ascending: false })
    .order("criada_em", { ascending: false })
    .order("id", { ascending: false })
    .limit(pageSize + 1);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching jobs:", error);
    throw new Error("Nao foi possivel carregar as vagas.");
  }

  const allJobs = (data || []) as VagaListItem[];
  
  // Detectar se ha proxima pagina
  const hasNextPage = allJobs.length > pageSize;
  
  // Retornar apenas pageSize vagas (descartar a extra)
  const jobs = hasNextPage ? allJobs.slice(0, pageSize) : allJobs;
  
  // Construir cursor da ultima vaga para proxima pagina
  const lastJob = jobs[jobs.length - 1];
  const nextCursor: JobCursor | null = lastJob ? {
    tipo_publicacao: lastJob.tipo_publicacao,
    criada_em: lastJob.criada_em!,
    id: lastJob.id,
  } : null;

  return {
    jobs,
    hasNextPage,
    nextCursor,
  };
}
```

**Mudanca na assinatura do hook:**

```typescript
export function useJobs(filters: JobFiltersParams = {}) {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => fetchJobs(filters),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}
```

O retorno agora sera `data.jobs`, `data.hasNextPage`, `data.nextCursor` em vez de `data` diretamente.

---

#### 2. Modificar Jobs.tsx

**Adicionar imports:**

```typescript
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobCursor } from "@/hooks/useJobs";
```

**Adicionar estados de paginacao:**

```typescript
// Pagina atual (comeca em 1)
const [currentPage, setCurrentPage] = useState(1);

// Array de cursors - posicao 0 = null (primeira pagina)
const [cursors, setCursors] = useState<(JobCursor | null)[]>([null]);
```

**Atualizar queryFilters para incluir cursor:**

```typescript
const currentCursor = cursors[currentPage - 1] || null;

const queryFilters = {
  nivel: filters.nivel,
  tipoContrato: filters.tipoContrato,
  modeloTrabalho: filters.modeloTrabalho,
  localizacao: filters.localizacao,
  habilidades: filters.habilidades,
  searchText: debouncedSearch,
  pageSize: 20,
  cursor: currentCursor,
};
```

**Atualizar uso do hook (nova estrutura de retorno):**

```typescript
const { data, isLoading, error } = useJobs(queryFilters);
const jobs = data?.jobs || [];
const hasNextPage = data?.hasNextPage || false;
const nextCursor = data?.nextCursor || null;
```

**Adicionar funcoes de navegacao:**

```typescript
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
```

**Reset de paginacao quando filtros mudam:**

```typescript
// Chave que representa todos os filtros
const filtersKey = JSON.stringify({
  nivel: filters.nivel,
  tipoContrato: filters.tipoContrato,
  modeloTrabalho: filters.modeloTrabalho,
  localizacao: filters.localizacao,
  habilidades: filters.habilidades,
  searchText: debouncedSearch,
});

// Reset quando filtros mudam
useEffect(() => {
  setCurrentPage(1);
  setCursors([null]);
}, [filtersKey]);
```

**REMOVER contador de resultados (linhas 126-135):**

Deletar completamente este bloco:
```typescript
// REMOVER ESTE BLOCO
{!isLoading && (
  <p className="text-sm text-muted-foreground">
    {resultCount === 0
      ? "Nenhuma vaga encontrada"
      : resultCount === 1
      ? "1 vaga encontrada"
      : `${resultCount} vagas encontradas`}
  </p>
)}
```

Tambem remover a variavel `resultCount` que nao sera mais usada.

**Adicionar componente de paginacao (apos o grid de vagas):**

```tsx
{/* Paginacao */}
{jobs.length > 0 && (
  <div className="flex items-center justify-center gap-4 pt-6">
    <Button
      variant="outline"
      size="sm"
      onClick={goToPreviousPage}
      disabled={currentPage === 1 || isLoading}
    >
      <ChevronLeft className="h-4 w-4 mr-1" />
      Anterior
    </Button>
    
    <span className="text-sm text-muted-foreground">
      Pagina {currentPage}
    </span>
    
    <Button
      variant="outline"
      size="sm"
      onClick={goToNextPage}
      disabled={!hasNextPage || isLoading}
    >
      Proxima
      <ChevronRight className="h-4 w-4 ml-1" />
    </Button>
  </div>
)}
```

---

### Estrutura Final do Jobs.tsx (Secao Main)

```tsx
<main className="flex-1 space-y-4">
  {/* Campo de Busca */}
  <div className="relative">
    {/* ... campo de busca existente ... */}
  </div>

  {/* Grid de Vagas (SEM contador acima) */}
  {isLoading ? (
    <JobsSkeletonGrid />
  ) : jobs.length === 0 ? (
    <EmptyState hasFilters={hasActiveFilters} onClear={handleClearAll} />
  ) : (
    <>
      <div className="grid gap-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
      
      {/* Paginacao */}
      <div className="flex items-center justify-center gap-4 pt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousPage}
          disabled={currentPage === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        
        <span className="text-sm text-muted-foreground">
          Pagina {currentPage}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextPage}
          disabled={!hasNextPage || isLoading}
        >
          Proxima
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </>
  )}
</main>
```

---

### Ordem de Implementacao

| Ordem | Arquivo | Complexidade |
|-------|---------|--------------|
| 1 | `src/hooks/useJobs.ts` | Alta |
| 2 | `src/pages/Jobs.tsx` | Media |

---

### Tratamento de tipo_publicacao NULL

O campo `tipo_publicacao` pode ser NULL para vagas antigas. Para simplificar:

- Se o cursor tiver `tipo_publicacao: null`, usar `'gratuita'` como fallback na comparacao
- Vagas com NULL aparecerao naturalmente por ultimo no ORDER BY DESC
- Esta simplificacao funciona para o MVP

---

### Checklist de Validacoes

| Item | Implementacao |
|------|---------------|
| Primeira pagina carrega corretamente | cursor = null |
| Botao "Proxima" funciona | Salvar nextCursor, incrementar currentPage |
| Botao "Anterior" funciona | Decrementar currentPage, usar cursor salvo |
| Anterior desabilitado na pagina 1 | disabled={currentPage === 1} |
| Proxima desabilitado na ultima | disabled={!hasNextPage} |
| Reset ao mudar filtros | useEffect observa filtersKey |
| Loading state ao navegar | isLoading desabilita botoes |
| Destaque continua no topo | ORDER BY tipo_publicacao DESC |
| Sem vagas = sem paginacao | Condicional no render |
| Contador removido | Bloco deletado |
| Sintaxe .or() correta | String unica com and() |

