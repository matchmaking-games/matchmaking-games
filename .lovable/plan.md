

## Plano: Constants, Types e Hooks para busca de projetos

4 arquivos novos, nenhum arquivo existente alterado. O hook `useProjects.ts` existente (CRUD do dashboard) **não será tocado** — o novo hook de busca pública terá nome diferente.

### Arquivo 1: `src/constants/project-labels.ts`
Criar com 3 objetos `Record<string, string>` exportados: `ENGINE_LABELS`, `PLATAFORMA_LABELS`, `GENERO_LABELS` com todos os mapeamentos valor → label legível conforme especificado.

### Arquivo 2: `src/types/project-search.ts`
Criar com 3 interfaces exportadas: `ProjectCard`, `ProjectFilters`, `ProjectCursor` — campos conforme especificado na instrução.

### Arquivo 3: `src/hooks/useProjectFilters.ts`
Hook seguindo o padrão exato de `useStudioFilters`:
- Lê `q`, `engine`, `plataformas`, `genero` dos search params
- Expõe `filters`, `setFilter`, `setPlataformas`, `setGenero`, `clearAllFilters`, `activeFilterCount`, `hasActiveFilters`
- `activeFilterCount` soma: `searchText` (+1), `engine` (+1), `plataformas.length`, `genero.length`

### Arquivo 4: `src/hooks/useProjectSearch.ts`
Hook seguindo o padrão exato de `useStudios` (nome diferente de `useProjects` que já existe):
- Chama `supabase.rpc("search_projects", rpcParams)`
- Converte string vazia e arrays vazios para null antes de montar params
- Paginação: solicita `pageSize + 1`, detecta `hasNextPage`, monta `nextCursor`
- React Query com `staleTime: 30_000`, `retry: 2`, queryKey incluindo todos os parâmetros

**Nota sobre naming**: O hook existente `useProjects.ts` é o CRUD do dashboard. O novo hook de busca pública será nomeado `useProjectSearch.ts` para evitar conflito de nomes. Se preferir outro nome, me avise.

### Arquivos afetados
- `src/constants/project-labels.ts` (criar)
- `src/types/project-search.ts` (criar)
- `src/hooks/useProjectFilters.ts` (criar)
- `src/hooks/useProjectSearch.ts` (criar)

