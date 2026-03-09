

## Criar `src/components/studios/StudioCard.tsx`

Componente card clicável seguindo o padrão do `ProfessionalCard`, adaptado para estúdios.

### Estrutura

- `<a>` externo com `href="/studio/{slug}"`, `target="_blank"`, `rel="noopener noreferrer"`
- `<Card>` com `hover:border-primary/50 transition-colors` (diferente do ProfessionalCard que usa `hover:border-border/80`)
- **Cabeçalho**: Avatar `rounded-lg w-12 h-12` + info (nome com `font-display font-semibold`, localização com `MapPin w-3.5 h-3.5`, website com `Globe` + `e.stopPropagation()`) + badge tamanho `variant="secondary"` no canto direito
- **Especialidades**: até 3 badges `variant="outline"` + badge `+N` se houver mais, separada por `border-t` como no ProfessionalCard
- Mapa de tamanho: `{ micro: "Micro", pequeno: "Pequeno", medio: "Médio", grande: "Grande" }`
- Imports: `MapPin`, `Globe` de lucide-react; `Card`, `Avatar*`, `Badge` de shadcn; `StudioCard` de types

Um único arquivo novo, zero alterações em arquivos existentes.

