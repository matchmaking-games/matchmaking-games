

## Substituir scrollbar nativo pelo ScrollArea do shadcn no CommandList

O scroll nativo vem do `CommandList` em `src/components/ui/command.tsx` (linha 63: `overflow-y-auto`). A solução é envolver o conteúdo do `CommandList` com o `ScrollArea` do shadcn e remover o overflow nativo.

### Arquivo: `src/components/ui/command.tsx`

**Mudança no `CommandList`:**
- Remover `overflow-y-auto overflow-x-hidden` do className
- Manter `max-h-[300px]` para limitar a altura
- Envolver o children internamente com `ScrollArea` + `ScrollBar`

```tsx
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const CommandList = React.forwardRef<...>(({ className, children, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-hidden", className)}
    {...props}
  >
    <ScrollArea className="h-full max-h-[inherit]">
      <div className="[&_[cmdk-list-sizer]]:contents">
        {children}
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  </CommandPrimitive.List>
));
```

**Risco:** O `CommandPrimitive.List` do cmdk gerencia internamente um `[cmdk-list-sizer]` div. Envolver com ScrollArea pode conflitar com a medição de altura do cmdk. Se isso acontecer, a alternativa segura é aplicar apenas CSS para estilizar o scrollbar nativo com aparência similar ao shadcn, sem trocar o mecanismo de scroll.

**Alternativa mais segura (CSS-only):** Adicionar classes utilitárias no `CommandList` para estilizar a scrollbar nativa com cores do tema, sem envolver com ScrollArea. Isso evita qualquer conflito com o cmdk.

### Escopo
- 1 arquivo alterado: `src/components/ui/command.tsx`
- Afeta todos os usos de `CommandList` (MultiSelectCombobox e qualquer outro combobox)
- Nenhum outro arquivo precisa ser alterado

