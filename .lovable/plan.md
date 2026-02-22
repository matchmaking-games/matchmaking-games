

## Plano: TASK-811 — Salvar dados da importacao no banco de dados

### Resumo

Criar o hook `useImportSave` com a logica de deletar dados antigos e inserir dados revisados no banco. Conectar ao botao "Confirmar e Salvar" no ImportReviewDrawer. O edge function ja registra o historico de importacao com status "success", entao o hook nao precisa atualizar a tabela `import_history`.

---

### Arquivo 1: `src/hooks/useImportSave.ts` (criar)

**Assinatura do hook:**

```text
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ReviewedData } from "@/components/ImportReviewDrawer";

export function useImportSave() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveImportData = async (data: ReviewedData): Promise<void> => { ... };

  return { saveImportData, isSaving, saveError };
}
```

**Sequencia de operacoes dentro de `saveImportData`:**

Passo 1 -- Verificar autenticacao:
- Chamar `supabase.auth.getUser()`
- Se `user` nao existir, lancar erro "Usuario nao autenticado"

Passo 2 -- Deletar experiencias existentes:
- `await supabase.from("experiencia").delete().eq("user_id", user.id)`
- Verificar `error`, lancar excecao se existir

Passo 3 -- Deletar formacoes existentes:
- `await supabase.from("educacao").delete().eq("user_id", user.id)`
- Verificar `error`, lancar excecao se existir

Passo 4 -- Inserir novas experiencias (se array nao estiver vazio):
- Mapear cada item do array `data.experiences` para o formato da tabela:

```text
{
  user_id: user.id,
  empresa: exp.empresa,
  titulo_cargo: exp.titulo_cargo,
  tipo_emprego: exp.tipo_emprego,
  remoto: exp.modalidade,           // campo "modalidade" no estado -> coluna "remoto" no banco
  inicio: exp.inicio,
  fim: exp.fim || null,
  atualmente_trabalhando: !exp.fim, // true se fim for null/vazio
  descricao: exp.descricao || "",
  ordem: index,                     // indice no array
}
```

- `await supabase.from("experiencia").insert(mappedArray)`
- Verificar `error`, lancar excecao se existir

Passo 5 -- Inserir novas formacoes (se array nao estiver vazio):
- Mapear cada item do array `data.education` para o formato da tabela:

```text
{
  user_id: user.id,
  instituicao: edu.instituicao,
  tipo: edu.tipo,
  titulo: edu.titulo,
  area: null,                       // removido do fluxo de revisao
  inicio: edu.inicio,
  fim: edu.fim || null,
  concluido: !!edu.fim,             // true se fim tiver valor
  ordem: index,
}
```

- `await supabase.from("educacao").insert(mappedArray)`
- Verificar `error`, lancar excecao se existir

**Nota sobre import_history:** O edge function `process-linkedin-pdf` ja insere o registro com status "success" apos o processamento. Nao e necessario atualizar a tabela `import_history` no hook de salvamento. O parametro `importHistoryId` mencionado no prompt sera omitido da assinatura pois nao e necessario.

**Tratamento de erro:**
- Toda a sequencia envolvida em try/catch
- No catch: atualizar `saveError` com a mensagem, re-lancar a excecao
- No finally: setar `isSaving = false`

---

### Arquivo 2: `src/components/ImportReviewDrawer.tsx` (editar)

**Alteracoes:**

1. Importar o hook:
```text
import { useImportSave } from "@/hooks/useImportSave";
```

2. Dentro do componente, desestruturar:
```text
const { saveImportData, isSaving } = useImportSave();
```

3. Substituir a funcao `handleSave` (linha 395-397):

```text
const handleSave = async () => {
  try {
    await saveImportData({ experiences, education });
    toast({
      title: "Importacao concluida!",
      description: "Suas experiencias e formacoes foram atualizadas.",
    });
    handleClose();
  } catch {
    toast({
      title: "Erro ao salvar os dados",
      description: "Tente novamente.",
      variant: "destructive",
    });
  }
};
```

4. Atualizar o `handleOpenChange` para bloquear fechamento durante salvamento (adicionar `isSaving` na verificacao, mesma logica que `isProcessing`):
```text
if (isProcessing || isSaving) return;
```

5. Atualizar o botao "Confirmar e Salvar" no footer do review (linha 636-639):
- Adicionar `disabled={isSaving}`
- Quando `isSaving`, mostrar icone `Loader2` com `animate-spin` e texto "Salvando..."
- Quando nao, mostrar icone `Check` e texto "Confirmar e Salvar"

6. Desabilitar botao "Cancelar" durante salvamento.

---

### Mapeamento de campos criticos (resumo)

| Estado do componente | Coluna no banco | Observacao |
|---|---|---|
| `exp.modalidade` | `experiencia.remoto` | Nome da coluna e "remoto" mas armazena enum modalidade_trabalho |
| `exp.fim` (null/vazio) | `experiencia.atualmente_trabalhando` | Calculado: `!exp.fim` -> true/false |
| `edu.area` | `educacao.area` | Sempre `null` (removido do fluxo) |
| `edu.fim` (null/vazio) | `educacao.concluido` | Calculado: `!!edu.fim` -> true/false |
| index no array | `*.ordem` | Preserva a ordem visual do drawer |

---

### Arquivos tocados

| Arquivo | Acao |
|---|---|
| `src/hooks/useImportSave.ts` | Criar |
| `src/components/ImportReviewDrawer.tsx` | Editar (importar hook, handleSave, loading no botao) |

### O que NAO muda

- Hook `useImportLinkedIn`
- Edge Function
- `Profile.tsx`
- `ImportSection.tsx`
- Estado "instructions" do drawer
- Cards de revisao
- Nenhuma biblioteca nova

