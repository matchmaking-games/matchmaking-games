## Plano: Simplificar Edge Function para receber texto em vez de PDF

### Resumo

A Edge Function `process-linkedin-pdf` sera simplificada para receber texto pre-extraido via JSON em vez de um arquivo PDF via FormData. Isso resolve o problema de incompatibilidade de bibliotecas PDF no Deno.

---

### Alteracoes no arquivo `supabase/functions/process-linkedin-pdf/index.ts`

**Remover:**

- Linha 2: import do `pdfjs-dist`
- Linha 10: constante `MAX_FILE_SIZE`
- Linhas 17-32: funcao `extractTextFromPDF` inteira
- Linhas 34-46: funcao `decodePDFString` inteira
  &nbsp;

**Substituir bloco de leitura do body (linhas 234-266):**

O trecho atual que usa `req.formData()`, valida tipo/tamanho e chama `extractTextFromPDF` sera substituido por:

```typescript
// 3. Read text from JSON body
const { text, filename } = await req.json();

if (!text || typeof text !== "string") {
  return new Response(
    JSON.stringify({ success: false, error: "Texto do PDF é obrigatório" }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

logStep("Text received", { length: text.length, filename });

const fullText = text;
```

---

### O que NAO muda

- CORS headers
- Autenticacao (bloco 1)
- Rate limit (bloco 2)
- `buildPrompt`, `callAI`, `logStep`
- Interface Sections e funcao splitSections
- Chamada a splitSections e log associado
- Resposta de sucesso com raw_text.sections
- Registro em `import_history` (blocos 7 e catch)
- Tratamento de erros

### Arquivo tocado


| Arquivo                                            | Acao   |
| -------------------------------------------------- | ------ |
| `supabase/functions/process-linkedin-pdf/index.ts` | Editar |
