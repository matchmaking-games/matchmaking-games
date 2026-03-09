
## Prompt 01 — Types + Hooks: Busca de Profissionais

### 3 arquivos novos, nenhum arquivo existente alterado

---

### Arquivo 1 — `src/types/professional.ts`

Tipos puros, sem imports externos:

- **`ProfessionalSkill`** (inline nos campos de `ProfessionalCard`) → `{ id, nome, categoria }`
- **`ProfessionalCard`** → 14 campos conforme spec (id, nome_completo, slug, avatar_url, titulo_profissional, bio_curta, cidade, estado, disponivel_para_trabalho, tipo_trabalho_preferido, habilidades, total_habilidades, criado_em, rank)
- **`ProfessionalFilters`** → 5 campos: searchText, disponivel, estado, tipoTrabalho, habilidades
- **`ProfessionalCursor`** → criado_em + id

---

### Arquivo 2 — `src/hooks/useProfessionalFilters.ts`

Segue `useJobFilters.ts` exatamente. Mapeamento URL ↔ estado:

```
q           → searchText: string | null
disponivel  → disponivel: boolean | null   ("true" → true, ausente → null)
estado      → estado: string | null
trabalho    → tipoTrabalho: string[] | null (split por vírgula)
skills      → habilidades: string[] | null (split por vírgula)
```

Funções retornadas:
- `setFilter(key, value)` — genérico, deleta se null/vazio
- `setHabilidades(ids)` — escreve/deleta "skills"
- `setEstado(uf)` — escreve/deleta "estado" (sem cascade de cidade, profissionais não têm cidade no filtro)
- `clearAllFilters()` — limpa toda a URL
- `activeFilterCount` — conta: searchText, disponivel, estado, tipoTrabalho.length, habilidades.length
- `hasActiveFilters` — activeFilterCount > 0

---

### Arquivo 3 — `src/hooks/useProfessionals.ts`

Parâmetros de entrada: todos os campos de `ProfessionalFilters` + `pageSize` (padrão 20) + `cursor: ProfessionalCursor | null`.

**Montagem dos params RPC** (omitir quando null/vazio — nunca enviar string ou array vazio):

```
p_search          ← searchText (só se truthy)
p_disponivel      ← disponivel (só se não null)
p_estado          ← estado (só se não null)
p_tipo_trabalho   ← tipoTrabalho (só se length > 0)
p_habilidades     ← habilidades (só se length > 0)
p_limit           ← pageSize + 1 (sempre — para detectar hasNextPage)
p_cursor_criado_em ← cursor.criado_em (só se cursor não null)
p_cursor_id       ← cursor.id (só se cursor não null)
```

**Lógica de paginação** (igual a useJobs):
- RPC chamada com `p_limit = pageSize + 1`
- Se `result.length > pageSize` → `hasNextPage = true`, cortar o array no índice `pageSize`
- `nextCursor` = `{ criado_em, id }` do último item válido

**React Query:**
```ts
queryKey: ["professionals", { searchText, disponivel, estado, tipoTrabalho, habilidades, cursor }]
staleTime: 30_000
retry: 2
```

Retorno: `{ data: { professionals, hasNextPage, nextCursor }, isLoading, error }`

---

### O que NÃO muda
Nenhum arquivo existente é tocado. Sem componentes, sem páginas, sem rotas.
