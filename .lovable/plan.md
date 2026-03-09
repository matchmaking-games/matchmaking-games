

## Correção: reverter ScrollArea e usar CSS custom scrollbar

### Problema
O `ScrollArea` do Radix conflita com o `cmdk` dentro de Popover — o Viewport do ScrollArea captura os eventos de scroll e impede o mouse wheel de funcionar. Isso é um bug conhecido (issues #542, #607 do shadcn/ui e #272 do cmdk).

### Solução: CSS-only custom scrollbar
Reverter o `CommandList` para usar o scroll nativo (`overflow-y-auto`) e estilizar a scrollbar via CSS para ter a mesma aparência do ScrollArea do shadcn (thumb arredondado, cor `bg-border`, largura fina).

### Arquivo 1: `src/components/ui/command.tsx`
- Remover import de `ScrollArea` e `ScrollBar`
- Restaurar `CommandList` com `overflow-y-auto` nativo
- Adicionar classe utilitária `scrollbar-thin` para estilização

### Arquivo 2: `src/index.css`
- Adicionar classe `.scrollbar-thin` com estilos para WebKit e Firefox:
  - Largura: 8px (similar ao ScrollBar do Radix)
  - Track: transparente
  - Thumb: `hsl(var(--border))` com `border-radius: 9999px`
  - Firefox: `scrollbar-width: thin; scrollbar-color: hsl(var(--border)) transparent`

### Resultado
- Scroll por mouse wheel, trackpad e touch funcionam normalmente
- Visual da scrollbar idêntico ao ScrollArea do shadcn
- Zero risco de conflito com cmdk ou Popover
- Funciona em desktop e mobile

