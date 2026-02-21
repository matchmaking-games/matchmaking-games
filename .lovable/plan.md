

## Plano de Implementacao - TASK-808

### Resumo

Criar o hook `useImportLinkedIn` que processa o PDF via Edge Function, conecta-lo na pagina de perfil substituindo o toast placeholder, e exibir estados de loading progressivo no `ImportSection`.

---

### 1. Criar `src/hooks/useImportLinkedIn.ts`

**Estados expostos:**
- `isProcessing: boolean`
- `progress: string` (mensagem atual do loading)
- `error: string | null`

**Funcao exposta:**
- `uploadPdf(file: File): Promise<{ extracted_data: Record<string, unknown>; raw_text: Record<string, unknown> } | null>`

**Fluxo interno de `uploadPdf`:**
1. Seta `isProcessing = true`, `error = null`, `progress = "Enviando PDF..."`
2. Obtem token via `supabase.auth.getSession()` -- se nao tiver sessao, seta erro e retorna null
3. Monta `FormData` com campo `"pdf"` contendo o arquivo
4. Atualiza `progress = "Analisando curriculo com IA... isso pode levar ate 30 segundos"`
5. Faz `Promise.race` entre o `fetch` e um `setTimeout` de 35s que rejeita com mensagem `"TIMEOUT"`
6. URL: `` `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-linkedin-pdf` ``
7. Headers: `Authorization: Bearer {token}`, sem `Content-Type` (o browser seta automaticamente para FormData)
8. Trata resposta por status HTTP:
   - 429 -> erro: "Voce atingiu o limite de 3 importacoes este mes..."
   - 400 -> erro: "PDF invalido ou corrompido..."
   - 500 -> erro: "Erro no processamento com IA..."
   - Outro nao-ok -> erro: "Erro inesperado..."
   - 200 -> parseia JSON, retorna `response.data`
9. Catch: se mensagem contem "TIMEOUT" -> erro especifico de timeout; senao -> erro generico de conexao
10. Finally: `isProcessing = false`, `progress = ""`

**Retorno:** `{ uploadPdf, isProcessing, progress, error }`

---

### 2. Modificar `src/pages/Profile.tsx`

**Mudancas:**
- Importar `useImportLinkedIn`
- Instanciar `const { uploadPdf, isProcessing, progress, error } = useImportLinkedIn()`
- Alterar o `onConfirm` do `ImportConfirmModal`:
  1. Fechar modal imediatamente (`setIsImportModalOpen(false)`)
  2. Chamar `uploadPdf(selectedPdfFile)` de forma async
  3. Se retornar dados: toast de sucesso "Curriculo processado com sucesso!" + `console.log` dos dados
  4. Se retornar null (erro): toast de erro usando `error` do hook
  5. Limpar `selectedPdfFile` apos chamar
- Passar `isProcessing` e `progress` como props para `ImportSection`

---

### 3. Modificar `src/components/ImportSection.tsx`

**Novas props adicionadas a interface:**
- `isProcessing?: boolean`
- `progress?: string`

**Mudancas no render:**
- Quando `isProcessing === true`:
  - Substituir o botao por: icone `Loader2` com `animate-spin` + texto do `progress` abaixo
  - O link "Ver historico" fica com `opacity-50 pointer-events-none`
- Quando `isProcessing === false`: manter comportamento atual sem mudancas

O estado de loading ocupa o mesmo espaco vertical que o botao para evitar salto visual.

---

### Arquivos tocados

| Arquivo | Acao |
|---|---|
| `src/hooks/useImportLinkedIn.ts` | Criar |
| `src/pages/Profile.tsx` | Editar (conectar hook, alterar onConfirm) |
| `src/components/ImportSection.tsx` | Editar (adicionar props de loading, render condicional) |

### O que NAO muda

- `useImportLimit` (intacto)
- `ImportConfirmModal` (intacto)
- Formularios de edicao de perfil
- Nenhuma biblioteca nova instalada
