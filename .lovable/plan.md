
## Plano: Corrigir AlertDialogAction para Aceitar Variant

### Problema Identificado

O `AlertDialogAction` em `src/components/ui/alert-dialog.tsx` usa `buttonVariants()` **sem passar variant**, forcando sempre o estilo `default`. Quando classes sao passadas via `className`, o gradiente do `default` tem maior especificidade CSS e prevalece sobre as classes de override.

### Solucao

Modificar o `AlertDialogAction` para aceitar uma prop `variant` e passar para `buttonVariants({ variant })`. Isso permite que o `ProjectDeleteDialog` use `variant="destructive"` ao inves de tentar sobrescrever com classes.

After implementing the variant support, please also add a short comment above AlertDialogAction explaining:

Do not override colors via className for destructive actions.
Always use variant="destructive" for delete/irreversible actions.

Also, update one existing destructive dialog (ProjectDeleteDialog) as the canonical example.

This is to prevent future regressions when generating new dialogs/buttons.


---

### Arquivos a Modificar

| Arquivo | Acao |
|---------|------|
| `src/components/ui/alert-dialog.tsx` | Adicionar prop variant ao AlertDialogAction |
| `src/components/projects/ProjectDeleteDialog.tsx` | Usar variant="destructive" e remover className de override |

---

### Secao Tecnica

#### 1. Modificar AlertDialogAction (alert-dialog.tsx)

**Antes (linha 72-78):**
```tsx
const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants(), className)} {...props} />
));
```

**Depois:**
```tsx
const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action> & 
    VariantProps<typeof buttonVariants>
>(({ className, variant, size, ...props }, ref) => (
  <AlertDialogPrimitive.Action 
    ref={ref} 
    className={cn(buttonVariants({ variant, size }), className)} 
    {...props} 
  />
));
```

**Import adicional necessario:**
```tsx
import { buttonVariants } from "@/components/ui/button";
import { type VariantProps } from "class-variance-authority";
```

---

#### 2. Atualizar ProjectDeleteDialog.tsx

**Antes (linha 49-55):**
```tsx
<AlertDialogAction
  onClick={onConfirm}
  disabled={isDeleting}
  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
>
  {isDeleting ? "Excluindo..." : "Excluir"}
</AlertDialogAction>
```

**Depois:**
```tsx
<AlertDialogAction
  onClick={onConfirm}
  disabled={isDeleting}
  variant="destructive"
>
  {isDeleting ? "Excluindo..." : "Excluir"}
</AlertDialogAction>
```

---

### Resultado Esperado

| Componente | Comportamento |
|------------|---------------|
| Botoes primarios (default) | Gradiente verde-teal com glow |
| AlertDialogAction sem variant | Usa default (gradiente) |
| AlertDialogAction variant="destructive" | Usa estilo destructive (vermelho) |
| ProjectDeleteDialog "Excluir" | Botao vermelho destrutivo |

---

### Verificacao Pos-Implementacao

1. Abrir o dialogo "Excluir projeto" em `/dashboard/profile/projects`
2. Confirmar que o botao "Excluir" esta com fundo vermelho (destructive), nao verde
3. Confirmar que outros botoes primarios (ex: "Novo Projeto") continuam com gradiente verde
