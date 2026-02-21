

## Plano: TASK-809 - Backup automatico antes de sobrescrever dados

### Resumo

Adicionar a funcao `createBackup` dentro do hook `useImportLinkedIn` que salva um snapshot dos dados atuais do usuario na tabela `import_backups` antes de retornar os dados do Gemini. Se o backup falhar, a importacao e abortada.

---

### Correcao necessaria no prompt original

O prompt menciona a tabela `skills_profissional`, que nao existe no banco. A tabela correta para habilidades do usuario e `user_habilidades`. O backup usara essa tabela.

---

### Alteracoes em `src/hooks/useImportLinkedIn.ts`

**1. Nova funcao `createBackup` (antes do return, linha ~127)**

Funcao assincrona interna (nao exposta) que recebe `userId: string`:

- Busca em paralelo com `Promise.all`:
  - `supabase.from('experiencia').select('*').eq('user_id', userId)`
  - `supabase.from('educacao').select('*').eq('user_id', userId)`
  - `supabase.from('user_habilidades').select('*').eq('user_id', userId)`
- Monta objeto de backup:
  ```text
  {
    experiences: experienciaData ?? [],
    education: educacaoData ?? [],
    skills: habilidadesData ?? [],
    metadata: {
      backed_up_at: new Date().toISOString(),
      total_items: soma dos lengths
    }
  }
  ```
- Insere na tabela `import_backups` com `user_id`, `backup_data` e `expires_at` (7 dias)
- Se o insert retornar erro, lanca `Error("Falha ao criar backup. Importacao abortada por seguranca.")`
- Retorna `true`

**2. Chamar `createBackup` dentro de `uploadPdf` (apos linha 114)**

Apos o JSON ser parseado com sucesso (linha 114), antes do `return json.data`:

1. Obter `userId` via `session.user.id` (sessao ja disponivel no escopo)
2. Setar `progress = "Criando backup dos dados atuais..."`
3. Chamar `await createBackup(userId)` dentro de try/catch:
   - Se falhar: setar `error` e `errorRef.current` com `"Falha ao criar backup. Seus dados nao foram alterados."`, retornar `null`
4. Se sucesso: retornar `json.data` normalmente

---

### O que NAO muda

- Interface publica do hook
- Fluxo de extracao de texto do PDF
- Fluxo de envio para a Edge Function
- Tratamento de erros HTTP
- Estados `isProcessing` e `progress` no `finally`
- Nenhum outro arquivo

### Arquivo tocado

| Arquivo | Acao |
|---|---|
| `src/hooks/useImportLinkedIn.ts` | Editar |

