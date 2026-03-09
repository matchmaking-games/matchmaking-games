

## Padronizar badges: remover hardcoded `rounded-full` e usar o componente `Badge`

### Problema
O `badge.tsx` foi alterado para `rounded-sm` (quadrado), mas vários componentes usam `<span>` hardcoded com `rounded-full` ou ignoram o componente `Badge` completamente, gerando inconsistência visual.

### Arquivos a corrigir

**1. `src/components/projects/ProjectCard.tsx`** (prioridade - é a página que o user apontou)
- Linhas 128-145: dois `<span>` com `rounded-full border` para tipo e status → substituir por `<Badge>` com as classes de cor
- Linhas 157-170: `<span>` com `rounded border` para skills → substituir por `<Badge variant="secondary">`
- Linha 168: `<span>` do "+X" overflow → substituir por `<Badge variant="secondary">`

**2. `src/components/education/EducationCard.tsx`**
- Linha 48: `<Badge>` com `rounded-full` no className → remover `rounded-full`

**3. `src/components/experience/ExperienceCard.tsx`**
- Linha 148: `<Badge>` com `rounded-full` no className → remover `rounded-full`

**4. `src/pages/Events.tsx`**
- Linhas 49-62: `<span>` hardcoded para ModalidadeBadge e EncerradoBadge → substituir por `<Badge>` com classes de cor

**5. `src/pages/dashboard/Events.tsx`**
- Linhas 62-71: `<span>` hardcoded para badges de status e encerrado → substituir por `<Badge>`

**6. `src/pages/ProjectDetail.tsx`**
- Linhas 177 e 193: `<span>` hardcoded para skills → substituir por `<Badge variant="secondary">`

### Regra aplicada
Todas as instâncias passam a usar o componente `<Badge>` do design system, herdando automaticamente o `rounded-sm` definido no `badgeVariants`. Classes de cor são passadas via `className` prop.

