

## Melhorar legibilidade das badges no ProjectSkillsSelect

### Correção
Duas ocorrências de `text-muted-foreground` precisam mudar para `text-foreground/80` — ambas dentro do `CategorySelector`, que é reutilizado tanto para Habilidades quanto para Softwares:

1. **Linha 106** — badges no dropdown (popover): `text-muted-foreground` → `text-foreground/80`
2. **Linha 129** — badges selecionadas (abaixo do selector): `text-muted-foreground` → `text-foreground/80`

Ambas as categorias (Habilidades e Softwares) usam o mesmo componente `CategorySelector`, então a correção se aplica automaticamente às duas.

