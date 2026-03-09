

## Plano: Criar componente ProjectCard para listagem pública

Criar `src/components/projects/ProjectCard.tsx` seguindo o padrão visual dos cards existentes (ProfessionalCard, StudioCard), com as adaptações para projetos.

**Nota**: O arquivo `src/components/projects/ProjectCard.tsx` já existe no projeto (é o card do dashboard com dropdown de editar/excluir). O novo componente para a listagem **pública** precisa de um nome diferente para não sobrescrever o existente.

Sugiro nomear como `src/components/projects/ProjectSearchCard.tsx` — ou, se preferir sobrescrever o card existente do dashboard, me avise.

### Estrutura do componente

- **Props**: `{ project: ProjectCard }` (tipo de `src/types/project-search.ts`)
- **Link wrapper**: `<a>` com `target="_blank"`, URL condicional baseada em `estudio_id` vs `user_id`
- **Card**: mesmas classes dos cards existentes (`bg-card/50 border-border/50 hover:border-primary/50 transition-colors`)

### Layout (3 seções verticais)

1. **Imagem de capa** — `aspect-video` (16:9), `object-cover` se houver imagem, fallback com `Gamepad2` centralizado em fundo `bg-muted`
2. **Info** (padding `p-4`):
   - Linha 1: título (`font-display font-semibold truncate`) + badge engine (`variant="secondary"`, texto de `ENGINE_LABELS`)
   - Linha 2: até 3 badges plataforma (`variant="outline"`) + overflow `+N`
   - Linha 3: até 2 badges gênero (`variant="outline"`) + overflow `+N`
3. **Rodapé** (`border-t border-border/50 pt-3 mt-3`):
   - Avatar 24px (logo estúdio ou avatar usuário)
   - Nome do dono (`text-muted-foreground text-sm`)
   - Badge `variant="secondary"` com "Estúdio" ou "Profissional" à direita (`ml-auto`)

### Imports
- `Card` de `ui/card`
- `Badge` de `ui/badge`
- `Avatar, AvatarImage, AvatarFallback` de `ui/avatar`
- `Gamepad2` de `lucide-react`
- `ENGINE_LABELS, PLATAFORMA_LABELS, GENERO_LABELS` de `constants/project-labels`
- `ProjectCard as ProjectCardType` de `types/project-search`

### Arquivos afetados
- `src/components/projects/ProjectSearchCard.tsx` (criar) — nenhum arquivo existente alterado

