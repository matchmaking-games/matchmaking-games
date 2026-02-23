

## Plano: Pagina de Suporte com Formulario de Contato via Resend

### Resumo

Criar uma pagina protegida `/support` com formulario de contato, uma Edge Function para envio via Resend, um hook dedicado, e atualizar os links "Suporte" existentes nas sidebars.

---

### 1. Edge Function `send-support-email`

**Arquivo:** `supabase/functions/send-support-email/index.ts`

- Recebe `FormData` (nao JSON) com campos: `tipo`, `mensagem`, `nome`, `email`, `user_id`, `origem`, `user_agent`, e opcionalmente `imagem` (arquivo)
- Valida presenca de `tipo` e `mensagem`
- Se houver imagem, converte para base64 e inclui como attachment no Resend
- Envia email via Resend API:
  - From: `noreply@matchmaking.games`
  - To: `lucas.pimenta@matchmaking.games`
  - Reply-To: email do usuario
  - Subject: `[{tipo}] Novo ticket de suporte -- {nome}`
  - HTML formatado com secoes: Tipo, Remetente (nome, email, user_id), Mensagem, Contexto Tecnico (data/hora em Brasilia DD/MM/YYYY as HH:MM, origem, user_agent)
- CORS headers padrao do projeto
- `verify_jwt = false` no config.toml (validacao manual via auth header)

**Arquivo:** `supabase/config.toml` -- adicionar entrada:
```
[functions.send-support-email]
verify_jwt = false
```

---

### 2. Hook `useSupportForm`

**Arquivo:** `src/hooks/useSupportForm.ts`

- Schema Zod:
  - `tipo`: enum obrigatorio ("Bugs", "Sugestoes", "Duvidas", "Parcerias", "Outros")
  - `mensagem`: string, min 20, max 2000
  - `imagem`: File opcional (validacao de tipo e tamanho no componente)
- Busca dados do usuario autenticado via `useCurrentUser()`
- Coleta automatica de `window.location.href` e `navigator.userAgent`
- Funcao `submitForm` que:
  - Monta um `FormData` com todos os campos
  - Chama `supabase.functions.invoke("send-support-email", { body: formData })` -- nota: como e FormData, nao passa headers content-type manualmente
  - Gerencia estados: `isSubmitting`, `isSuccess`, `error`
- Funcao `resetForm` para limpar apos sucesso

---

### 3. Pagina `Support`

**Arquivo:** `src/pages/Support.tsx`

- Usa `DashboardLayout` como wrapper (consistente com outras paginas do dashboard)
- Titulo da pagina: "Suporte" com subtitulo descritivo
- Formulario com:
  - **Tipo** (Select com opcoes: Bugs, Sugestoes, Duvidas, Parcerias, Outros)
  - **Mensagem** (Textarea com placeholder especificado, contador de caracteres)
  - **Imagem** (input file oculto + botao visual, aceita image/jpeg, image/png, image/gif, image/webp, max 3MB)
    - Preview thumbnail apos selecao com botao X para remover
    - Mensagem de erro se tipo ou tamanho invalido
  - Botao "Enviar mensagem" com estado de loading (Loader2 spinner)
- Apos sucesso: limpa formulario, exibe toast de sucesso
- Apos erro: exibe toast de erro

**Arquivo:** `src/App.tsx` -- adicionar rota protegida:
```
<Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
```

---

### 4. Atualizar links "Suporte"

Dois locais com `mailto:` que serao substituidos por `navigate("/support")`:

| Arquivo | Linha | De | Para |
|---|---|---|---|
| `src/components/dashboard/DashboardSidebar.tsx` | 191-196 | `<a href="mailto:...">` | `<Link to="/support">` |
| `src/components/studio/StudioSidebar.tsx` | 252-257 | `<a href="mailto:...">` | `<Link to="/support">` |

---

### Arquivos criados/modificados

| Arquivo | Acao |
|---|---|
| `supabase/functions/send-support-email/index.ts` | Criar |
| `supabase/config.toml` | Adicionar entrada |
| `src/hooks/useSupportForm.ts` | Criar |
| `src/pages/Support.tsx` | Criar |
| `src/App.tsx` | Adicionar rota |
| `src/components/dashboard/DashboardSidebar.tsx` | Alterar link Suporte |
| `src/components/studio/StudioSidebar.tsx` | Alterar link Suporte |

### O que NAO muda

- Nenhuma outra pagina, rota ou componente existente
- Nenhuma tabela, RLS ou schema do banco
- Header.tsx nao tem link de suporte, nao sera alterado
- Hooks, queries e logica de autenticacao existentes permanecem intactos

