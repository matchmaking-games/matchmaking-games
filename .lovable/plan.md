

## Plano: Atualizar hook para extrair texto do PDF no browser

### Resumo

Atualizar `src/hooks/useImportLinkedIn.ts` para extrair o texto do PDF localmente no browser usando `pdfjs-dist`, e enviar o texto como JSON para a Edge Function em vez de FormData com o arquivo.

---

### Dependencia a instalar

- `pdfjs-dist` (sera adicionada ao package.json)

---

### Alteracoes em `src/hooks/useImportLinkedIn.ts`

**1. Imports (linhas 1-2)**

Adicionar import do `pdfjs-dist` e configurar o worker no nivel do modulo:

```typescript
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs`;
```

**2. Nova funcao `extractTextFromPDF` (dentro do hook, antes do return)**

Funcao assincrona que recebe `File`, le o `arrayBuffer`, usa `pdfjsLib.getDocument` para iterar paginas e extrair texto via `getTextContent()`. Retorna string com todas as paginas separadas por `\n`.

**3. Reescrever o fluxo de `uploadPdf` (linhas 15-96)**

Sequencia atualizada:

1. `isProcessing = true`, `error = null`, `progress = "Lendo arquivo PDF..."`
2. Chamar `extractTextFromPDF(file)` -- se texto < 100 chars, setar erro especifico e retornar null
3. `progress = "Analisando curriculo com IA... isso pode levar ate 30 segundos"`
4. Obter sessao -- se nao existir, setar erro e retornar null
5. Fetch com `AbortController` (35s timeout):
   - Method: POST
   - Headers: `Authorization: Bearer {token}`, `Content-Type: application/json`
   - Body: `JSON.stringify({ text: fullText, filename: file.name })`
6. Tratar status HTTP (429, 400, 500, outros)
7. Catch: verificar AbortError para timeout, senao erro generico
8. Finally: `isProcessing = false`, `progress = ""`

**4. Remover**

- `FormData` (linha 30-31)
- Mensagem inicial "Enviando PDF..." substituida por "Lendo arquivo PDF..."

---

### Mensagens de erro atualizadas

| Situacao | Mensagem |
|---|---|
| Texto extraido < 100 chars | "Nao foi possivel extrair texto do PDF. Certifique-se de usar o PDF gerado diretamente pelo LinkedIn." |
| Sem sessao | "Sessao expirada. Faca login novamente." |
| HTTP 429 | "Voce atingiu o limite de 3 importacoes este mes. Tente novamente no proximo mes." |
| HTTP 400 | "Nao foi possivel processar o PDF. Certifique-se de usar o PDF gerado diretamente pelo LinkedIn." |
| HTTP 500 | "Erro no processamento com IA. Tente novamente em alguns minutos." |
| Outro status | "Erro inesperado. Tente novamente." |
| Timeout (AbortError) | "O processamento demorou mais que o esperado. Tente novamente." |
| Erro generico | "Erro ao processar PDF. Verifique sua conexao e tente novamente." |

### Interface publica (sem mudanca)

`{ uploadPdf, isProcessing, progress, error, errorRef }`

### Arquivos tocados

| Arquivo | Acao |
|---|---|
| `src/hooks/useImportLinkedIn.ts` | Editar |
| `package.json` | Instalar `pdfjs-dist` |

### O que NAO muda

- Nenhum outro arquivo
- Interface publica do hook
- Logica do `errorRef`

