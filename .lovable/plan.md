

## Criar `src/pages/Studios.tsx`

Réplica estrutural exata de `Professionals.tsx`, substituindo apenas o que é específico de profissionais por estúdios.

### Substituições diretas

| Professionals.tsx | Studios.tsx |
|---|---|
| `useProfessionalFilters` | `useStudioFilters` |
| `useProfessionals` | `useStudios` |
| `ProfessionalCard` | `StudioCard` |
| `ProfessionalsSidebar` | `StudiosSidebar` |
| `ProfessionalCardSkeletonGrid` | `StudioCardSkeletonGrid` |
| `ProfessionalCursor` | `StudioCursor` |
| `Users` icon | `Building2` icon |
| `onHabilidadesChange={setHabilidades}` | `onEspecialidadesChange={setEspecialidades}` |
| `filters.disponivel, tipoTrabalho, habilidades` no filtersKey | `filters.tamanho, especialidades` no filtersKey |
| Query params: disponivel, tipoTrabalho, habilidades | Query params: tamanho, especialidades |
| `professionals` array | `studios` array |

### Textos

- Hero: "Estúdios" / "Conheça os estúdios de games do Brasil"
- Search placeholder: "Buscar por nome ou descrição..."
- Toast erro: "Erro ao carregar estúdios" / "Não foi possível carregar os estúdios..."
- Empty com filtros: "Nenhum estúdio encontrado com esses filtros" / "Tente ajustar..."
- Empty sem filtros: "Nenhum estúdio cadastrado ainda" / "Volte em breve! Novos estúdios..."

### Estrutura idêntica

- Layout: Header + hero + sidebar(lg:w-64) + main com search + grid/skeleton/empty + pagination + Footer
- Paginação por cursor com array de cursors, mesma lógica
- Debounce 500ms, sync com URL, reset ao mudar filtros
- Grid: `grid gap-4 md:grid-cols-2 lg:grid-cols-2`
- EmptyState como função interna com `Building2` no lugar de `Users`

Um único arquivo novo, zero alterações em arquivos existentes.

