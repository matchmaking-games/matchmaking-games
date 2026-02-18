
# Envio Automatico de Email de Convite via Resend

## Resumo

Criar uma Edge Function `send-invite-email` que envia email automatico via Resend quando um convite de estudio e criado. O email complementa o link copiavel existente no modal (ambos coexistem como redundancia). Se o email falhar, o convite continua valido e o link manual funciona normalmente.

## Arquivos a criar/modificar

### 1. Criar `supabase/functions/send-invite-email/index.ts`

Edge Function que recebe `inviteId`, busca dados do convite no banco via service role key, e envia email via Resend API.

**Estrutura:**
- CORS headers (mesmo padrao das outras Edge Functions)
- Logging estruturado com prefixo `[SEND-INVITE-EMAIL]`
- Criar cliente Supabase com `SUPABASE_SERVICE_ROLE_KEY` (bypassa RLS)
- Query unica com JOIN: `estudio_convites` + `estudios` para obter token, email_convidado, role, estudio nome e logo
- Validar que convite existe (404 se nao)
- Validar que `RESEND_API_KEY` existe (500 se nao)
- Montar link: `https://matchmaking.games/invite/${token}`
- Traduzir role: `super_admin` -> "Super Administrador", outro -> "Membro"
- POST para `https://api.resend.com/emails` com template HTML inline
- From: `Matchmaking <convites@matchmaking.games>`
- Subject: `Convite para ${estudioNome}`
- Retornar `{ success: true, emailId }` ou erro estruturado

**Template HTML:**
- Dark mode (#1c1b1b fundo, #22e47a botao primario)
- Layout com tabelas HTML (compatibilidade maxima com clientes de email)
- Logo Matchmaking no topo (URL absoluta do Supabase Storage)
- Titulo "Voce recebeu um convite!"
- Corpo: "[Estudio] convidou voce para fazer parte da equipe como [Role]"
- Botao CTA verde "Aceitar convite" com link
- Link em texto puro como fallback
- Footer: "Este convite expira em 7 dias" + disclaimer

### 2. Adicionar configuracao em `supabase/config.toml`

Adicionar bloco para a nova funcao:

```text
[functions.send-invite-email]
verify_jwt = false
```

### 3. Modificar `src/components/studio/InviteMemberDialog.tsx`

**Novos estados:**
- `emailSent`: boolean para rastrear se email foi enviado

**Mudancas no `handleSubmit`:**
- Apos criar convite e gerar link (codigo existente, linhas 125-140)
- Adicionar bloco try/catch para chamar `supabase.functions.invoke('send-invite-email', { body: { inviteId: newInvite.id } })`
- A chamada precisa do `id` do convite, entao o `.select('token')` na linha 133 muda para `.select('id, token')`
- Se email enviado com sucesso: setar `emailSent = true`, toast "Email enviado para [email]!"
- Se email falhar: setar `emailSent = false`, toast warning "Convite criado! Compartilhe o link manualmente.", logar erro no console
- Nao bloquear: erro de email nunca impede o fluxo

**Mudancas na UI (estado de sucesso):**
- `DialogDescription` (linha 164-166): condicional
  - Se `emailSent`: "Email enviado com sucesso! Ou compartilhe o link abaixo:"
  - Se nao: "Compartilhe este link com a pessoa convidada:" (mensagem atual similar)

**Reset de estado:**
- Adicionar `setEmailSent(false)` no useEffect de reset (linha 43-53)

## Seguranca

- Edge Function usa `SUPABASE_SERVICE_ROLE_KEY` (acesso total ao banco, necessario para ler convites)
- Nao expoe token na resposta de erro
- RESEND_API_KEY ja esta configurada nos secrets do projeto
- Nao requer autenticacao do usuario (verify_jwt = false) - a funcao e chamada pelo frontend apos criar convite com sucesso

## O que NAO muda

- Link copiavel no modal continua funcionando identicamente
- Fluxo de criacao de convite no banco nao muda
- Pagina /invite/:token nao muda
- Nenhuma migracao de banco necessaria
- Nenhum novo secret necessario (RESEND_API_KEY ja existe)
