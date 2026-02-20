## Criar Edge Function `process-linkedin-pdf`

### Arquivos

- **Criar:** `supabase/functions/process-linkedin-pdf/index.ts`
- **Modificar:** `supabase/config.toml` -- adicionar `[functions.process-linkedin-pdf]` com `verify_jwt = false`

---

### Fluxo da funcao

```text
Request (FormData com PDF)
  |
  v
1. Validar auth header -> extrair user via getUser()
  |
  v
2. Rate limit check -> supabase.rpc('count_recent_imports') >= 3 ? 429
  |
  v
3. Extrair PDF do FormData -> validar tipo e tamanho (max 10MB)
  |
  v
4. Extrair texto do PDF via pdf-parse (npm:pdf-parse/lib/pdf-parse.js)
  |
  v
5. Separar texto em secoes (experiences, education, skills)
  |
  v
6. Chamar Lovable AI Gateway (google/gemini-2.5-flash) com o prompt definido
  |  - Se JSON invalido na resposta: retry 1x
  |
  v
7. Registrar em import_history usando o MESMO cliente autenticado do passo 1
  |
  v
8. Retornar JSON estruturado com extracted_data + raw_text
```

---

### Correcao aplicada: passo 7

Usar o **mesmo cliente Supabase autenticado** (criado no passo 1 com o token do header Authorization) para inserir em `import_history`. A tabela ja possui a RLS policy `"Users can insert own import history"` com `WITH CHECK (auth.uid() = user_id)`, que permite o INSERT diretamente.

Nao sera criado nenhum cliente `service_role`. Toda a funcao opera com um unico cliente autenticado, seguindo o principio de menor privilegio.

---

### Detalhes tecnicos

**Extracao de texto do PDF**

Usar `import pdf from "npm:pdf-parse/lib/pdf-parse.js"` (importacao direta do subpath, sem depender de `fs.readFileSync`).

**Chamada de IA**

Lovable AI Gateway em `https://ai.gateway.lovable.dev/v1/chat/completions` com `LOVABLE_API_KEY`. Modelo: `google/gemini-2.5-flash`, temperature: 0.1. Chamada sincrona (sem streaming). Retry 1x se `JSON.parse` falhar.

**Separacao de secoes**

Funcao auxiliar `splitSections(text)` que busca por titulos em PT e EN:

- "Experiencia" / "Experience"
- "Formacao academica" / "Education"
- "Principais competencias" / "Skills" / "Top Skills"

**CORS**

Mesmo padrao das outras edge functions do projeto.

**Auth**

`verify_jwt = false` no config.toml, validacao manual via `supabase.auth.getUser()`.

---

### Estrutura da resposta de sucesso

```text
{
  "success": true,
  "data": {
    "extracted_data": { "basic_info": {}, "experiences": [], "education": [], "skills": [] },
    "raw_text": {
      "full": "texto completo",
      "sections": { "experiences": "...", "education": "...", "skills": "..." }
    }
  }
}
```

### Estrutura da resposta de erro

```text
{
  "success": false,
  "error": "descricao do erro"
}
```

---

### O que NAO sera alterado

- Nenhuma pagina, componente ou hook
- Nenhuma outra edge function
- Nenhuma tabela do banco de dados