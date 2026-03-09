

## Diagnóstico: Overlay travando após ação

### Problema identificado

Após analisar o código de `Events.tsx`, `useDeleteEvento.ts` e os componentes de dialog, identifiquei a causa:

O `AlertDialogAction` do Radix tem comportamento padrão de **fechar o dialog automaticamente** ao ser clicado. Porém, o código também tenta fechar o dialog manualmente no `onSettled` da mutation. Isso cria uma **race condition**:

1. Usuário clica "Excluir"
2. `onClick` dispara `handleDeleteConfirm()` (mutation inicia)
3. Radix fecha o dialog automaticamente via `onOpenChange(false)`
4. O overlay começa animação de saída
5. `onSettled` tenta fechar novamente (`setDeleteDialogOpen(false)`)

Essa desincronização pode deixar o **overlay do AlertDialog (bg-black/80 fixed inset-0)** visível, bloqueando toda interação.

### Solução

Impedir o fechamento automático do Radix e controlar manualmente:

**Arquivo: `src/pages/dashboard/Events.tsx`**

```tsx
// Linha 286-291: Modificar AlertDialogAction
<AlertDialogAction
  onClick={(e) => {
    e.preventDefault(); // Impede fechamento automático
    handleDeleteConfirm();
  }}
  disabled={deleteEvento.isPending}
  variant="destructive"
>
```

Com `e.preventDefault()`, o dialog só fecha quando `onSettled` executa `setDeleteDialogOpen(false)`, garantindo sincronização correta.

### Detalhes técnicos

| Fluxo atual (bugado) | Fluxo corrigido |
|---|---|
| Click → mutation inicia → dialog fecha imediatamente → onSettled tenta fechar de novo | Click → mutation inicia → dialog permanece aberto → mutation termina → onSettled fecha dialog |

O dialog ficará visível com "Excluindo..." durante a requisição, e só fechará após conclusão.

