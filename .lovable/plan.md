

## Criar arquivos de tipos e hooks para busca de estúdios

Tres arquivos novos, seguindo exatamente os padrões de `src/types/professional.ts`, `useProfessionalFilters.ts` e `useProfessionals.ts`.

### 1. `src/types/studio.ts`
- `StudioCard`: id, nome, slug, logo_url, sobre, cidade, estado, tamanho, especialidades, website, criado_em, rank
- `StudioFilters`: searchText, estado, tamanho, especialidades (string[])
- `StudioCursor`: criado_em, id

### 2. `src/hooks/useStudioFilters.ts`
- Mesmo padrão do `useProfessionalFilters` com `useSearchParams`
- Params: `q` → searchText, `estado` → estado, `tamanho` → tamanho, `especialidades` → especialidades (comma-separated)
- Exporta: filters, setFilter, setEspecialidades, setEstado, clearAllFilters, activeFilterCount, hasActiveFilters
- activeFilterCount: +1 para cada filtro preenchido; especialidades conta cada item individual

### 3. `src/hooks/useStudios.ts`
- Mesmo padrão do `useProfessionals` com React Query
- Chama `supabase.rpc("search_studios", {...})` com conversão de `""` → null e `[]` → null
- Paginação: request p_limit+1, detecta hasNextPage, monta nextCursor
- queryKey inclui todos os params, staleTime 30s

Nenhum arquivo existente será alterado.

