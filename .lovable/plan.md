

## Criar `src/components/studios/StudioCardSkeleton.tsx`

Um arquivo, dois exports, espelhando o padrão do `ProfessionalCardSkeleton` adaptado ao layout do `StudioCard`.

### `StudioCardSkeleton`
- `Card` com `p-4`
- Header: flex gap-4 items-start
  - Skeleton `w-12 h-12 rounded-lg` (avatar — rounded-lg, não rounded-full, para espelhar o StudioCard)
  - Coluna flex-1 com flex items-start justify-between gap-2:
    - Esquerda: 3 skeletons empilhados (h-4 w-40, h-3 w-24, h-3 w-16)
    - Direita: Skeleton h-5 w-20 (badge tamanho)
- Especialidades: div com border-t border-border/50 mt-3 pt-3, flex gap-1.5
  - 3 skeletons: h-5 w-[70px], h-5 w-[60px], h-5 w-20

### `StudioCardSkeletonGrid`
- Grid `gap-4 md:grid-cols-2 lg:grid-cols-2` com 6 instâncias

Imports: `Card`, `Skeleton`. Zero alterações em arquivos existentes.

