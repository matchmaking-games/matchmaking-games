

## Plano: Criar arquivos de enums e schemas Zod para projetos

Como os arquivos `src/types/enums.ts` e `src/schemas/enums.ts` não existem, serão criados do zero seguindo o padrão descrito.

### Arquivo 1: `src/types/enums.ts`

Criar com 4 enums (objetos `as const` + tipos exportados):

- **StatusProjeto** — `em_andamento`, `concluido`, `pausado`
- **EngineProjeto** — 25 valores (unity, unreal, godot, etc.)
- **PlataformaProjeto** — 20 valores (pc_windows, mobile_android, etc.)
- **GeneroProjeto** — 67 valores (acao, aventura, rpg, etc.) com `QUATRO_X: '4x'` para o caso especial

Padrão: chaves UPPER_SNAKE_CASE, valores snake_case.

### Arquivo 2: `src/schemas/enums.ts`

Criar com 4 schemas Zod (`z.enum([...])` exportados):

- **statusProjetoSchema** — 3 valores
- **engineProjetoSchema** — 25 valores
- **plataformaProjetoSchema** — 20 valores
- **generoProjetoSchema** — 67 valores

### Correção complementar: `src/lib/formatters.ts`

Adicionar `pausado: "Pausado"` ao map de `formatStatusProjeto` (linha 148), que atualmente só tem `em_andamento` e `concluido`.

### Arquivos afetados
- `src/types/enums.ts` (criar)
- `src/schemas/enums.ts` (criar)
- `src/lib/formatters.ts` (corrigir map do StatusProjeto)

