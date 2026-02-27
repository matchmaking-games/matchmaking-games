

# Plano: Migracao de tipo_funcao + Fixes de UX (revisado) — IMPLEMENTADO ✅

## Resumo das alterações

### Arquivos criados
- `src/hooks/useTiposFuncao.ts` — Hook que busca tipos de função ativos do Supabase

### Arquivos modificados
- `src/components/studio/JobSkillsSelector.tsx` — ScrollArea: `max-h-[200px]` → `h-[200px]`
- `src/hooks/useJobForm.ts` — Interfaces atualizadas, `insertTiposFuncao` adicionado, todos os fluxos de save/load migrados
- `src/pages/studio/JobForm.tsx` — Constante hardcoded removida, hook integrado, form adaptado para UUIDs, scroll do CommandList corrigido
