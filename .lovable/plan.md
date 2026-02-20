
## Criar `src/hooks/useImportLimit.ts`

### Contexto e padrão identificado

Após analisar os hooks existentes (`useAuth.ts`, `usePagamentos.ts`, `useSkills.ts`, `useProjects.ts`), o padrão do projeto é:

- `useState` + `useEffect` nativos (sem React Query)
- `supabase.auth.getSession()` para obter o usuário autenticado
- `userId` em estado local como dependência do `useEffect` de busca
- Erros tratados com `console.error` e fallback silencioso quando necessário

O hook `useCurrentUser.ts` é a exceção — usa React Query — mas a memória do projeto registra que o padrão obrigatório é `useState`/`useEffect`. O hook de `usePagamentos.ts` é o mais próximo do que será implementado: simples, com `isLoading`, estado central e tratamento de erro.

---

### O que será criado

**Único arquivo:** `src/hooks/useImportLimit.ts`

---

### Lógica do hook

```
LIMIT = 3 importações por 30 dias corridos
```

**Estados internos:**
- `remainingImports: number` — começa em `3` (valor otimista para não bloquear durante o carregamento)
- `isLoading: boolean` — começa em `true`
- `userId: string | null` — obtido via `supabase.auth.getSession()`

**Fluxo:**

```
1. useEffect #1: busca a sessão → seta userId
2. useEffect #2: quando userId muda → chama supabase.rpc('count_recent_imports', { p_user_id: userId })
   - Em sucesso: remainingImports = Math.max(0, 3 - data)
   - Em erro: console.error + remainingImports permanece 3 (falha silenciosa, canImport = true)
   - Em ambos: isLoading = false
```

**Retorno do hook:**

| Propriedade | Tipo | Descrição |
|---|---|---|
| `remainingImports` | `number` | Quantas importações restam (0–3) |
| `canImport` | `boolean` | `remainingImports > 0` |
| `isLoading` | `boolean` | `true` enquanto a query está em andamento |

---

### Comportamento de falha silenciosa

Se a chamada RPC falhar (erro de rede, timeout, etc.), o hook:
- Loga o erro com `console.error`
- Mantém `remainingImports = 3` e `canImport = true`
- Seta `isLoading = false` normalmente

Isso garante que nenhum usuário seja bloqueado indevidamente por instabilidade de rede.

---

### Implementação técnica

```typescript
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const IMPORT_LIMIT = 3;

export function useImportLimit() {
  const [userId, setUserId] = useState<string | null>(null);
  const [remainingImports, setRemainingImports] = useState(IMPORT_LIMIT);
  const [isLoading, setIsLoading] = useState(true);

  // Passo 1: obtém o usuário da sessão
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id ?? null);
      if (!session) setIsLoading(false); // sem usuário, não há nada a carregar
    };
    getUser();
  }, []);

  // Passo 2: consulta o limite quando userId estiver disponível
  useEffect(() => {
    if (!userId) return;

    const fetchImportCount = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc("count_recent_imports", {
          p_user_id: userId,
        });

        if (error) throw error;

        const count = typeof data === "number" ? data : 0;
        setRemainingImports(Math.max(0, IMPORT_LIMIT - count));
      } catch (err) {
        console.error("useImportLimit: erro ao buscar contagem de importações:", err);
        // Falha silenciosa — não bloqueia o usuário
        setRemainingImports(IMPORT_LIMIT);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImportCount();
  }, [userId]);

  return {
    remainingImports,
    canImport: remainingImports > 0,
    isLoading,
  };
}
```

---

### O que NÃO será alterado

- Nenhuma página existente
- Nenhum outro hook
- Nenhum componente visual
- Nenhuma rota ou layout
