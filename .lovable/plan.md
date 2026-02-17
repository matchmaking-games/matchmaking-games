

# Pagina de Aceitacao de Convites de Estudio

## Resumo

Criar a pagina publica `/invite/:token` que permite usuarios aceitarem convites para estudios. Requer resolver problemas de RLS (policies atuais bloqueiam leitura e escrita por usuarios comuns) atraves de funcoes `security definer` no banco.

## Problema de RLS (Critico)

As policies atuais de `estudio_convites` e `estudio_membros` so permitem acesso a super admins. Um usuario convidado (que nao e membro do estudio) nao consegue:
- Ler o convite por token (SELECT bloqueado)
- Inserir-se como membro (INSERT bloqueado)
- Marcar convite como aceito (UPDATE bloqueado)

### Solucao: 2 funcoes security definer

**Funcao 1: `get_invite_by_token(invite_token text)`**
- Retorna dados do convite + nome/logo do estudio
- Acessivel por qualquer usuario autenticado ou anonimo
- Nao expoe dados sensiveis (so nome do estudio, email convidado, role, expira_em, aceito)

**Funcao 2: `accept_studio_invite(invite_token text)`**
- Valida: token existe, nao expirado, nao aceito, email do usuario logado bate com email_convidado
- Insere em `estudio_membros` (ou detecta se ja e membro)
- Marca `aceito = true`
- Retorna status de sucesso/erro
- Usa `security definer` para bypassar RLS

## Arquivos e mudancas

### 1. Migracao SQL (nova)

Criar as duas funcoes no banco:

```text
-- Funcao 1: Buscar convite por token (publica)
CREATE OR REPLACE FUNCTION get_invite_by_token(invite_token text)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', c.id,
    'estudio_id', c.estudio_id,
    'email_convidado', c.email_convidado,
    'role', c.role,
    'aceito', c.aceito,
    'expira_em', c.expira_em,
    'estudio_nome', e.nome,
    'estudio_logo_url', e.logo_url
  ) INTO result
  FROM estudio_convites c
  JOIN estudios e ON e.id = c.estudio_id
  WHERE c.token = invite_token;

  RETURN result;
END;
$$;

-- Funcao 2: Aceitar convite (autenticado)
CREATE OR REPLACE FUNCTION accept_studio_invite(invite_token text)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_invite RECORD;
  v_user_email TEXT;
  v_user_id UUID;
  v_existing_member UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  -- Buscar convite
  SELECT * INTO v_invite FROM estudio_convites WHERE token = invite_token;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'not_found');
  END IF;

  -- Verificar expirado
  IF v_invite.expira_em < now() THEN
    RETURN json_build_object('success', false, 'error', 'expired');
  END IF;

  -- Verificar ja aceito
  IF v_invite.aceito THEN
    RETURN json_build_object('success', false, 'error', 'already_accepted');
  END IF;

  -- Buscar email do usuario na tabela users
  SELECT email INTO v_user_email FROM users WHERE id = v_user_id;
  IF v_user_email IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'no_profile');
  END IF;

  -- Verificar email bate
  IF lower(v_user_email) != lower(v_invite.email_convidado) THEN
    RETURN json_build_object('success', false, 'error', 'email_mismatch');
  END IF;

  -- Verificar se ja e membro
  SELECT id INTO v_existing_member
  FROM estudio_membros
  WHERE user_id = v_user_id AND estudio_id = v_invite.estudio_id AND ativo = true;

  IF v_existing_member IS NOT NULL THEN
    -- Ja e membro, apenas marcar aceito
    UPDATE estudio_convites SET aceito = true WHERE id = v_invite.id;
    RETURN json_build_object('success', true, 'already_member', true);
  END IF;

  -- Inserir como membro
  INSERT INTO estudio_membros (estudio_id, user_id, role, adicionado_por, ativo)
  VALUES (v_invite.estudio_id, v_user_id, v_invite.role, v_invite.convidado_por, true);

  -- Marcar convite como aceito
  UPDATE estudio_convites SET aceito = true WHERE id = v_invite.id;

  RETURN json_build_object('success', true, 'already_member', false);
END;
$$;
```

### 2. Criar `src/pages/AcceptInvite.tsx` (novo)

Pagina publica que processa convites.

**Estados:**
- `loading`: boolean (carregando dados do convite)
- `processing`: boolean (aceitando convite)
- `invite`: dados do convite ou null
- `error`: string com tipo de erro ('not_found', 'expired', 'email_mismatch', 'already_used')

**useEffect 1 - Buscar convite:**
- Chamar `supabase.rpc('get_invite_by_token', { invite_token: token })`
- Setar dados do convite ou erro

**useEffect 2 - Auto-processar se usuario logado com email correto:**
- Se convite valido + usuario logado + email bate + convite nao aceito
- Chamar `supabase.rpc('accept_studio_invite', { invite_token: token })`
- Redirecionar para `/studio/manage/dashboard?studio=estudioId` com toast

**Estados da UI:**

1. **Loading**: Spinner + "Validando convite..."
2. **Convite nao encontrado**: Card com icone AlertCircle, titulo "Convite nao encontrado", botao "Voltar para Home"
3. **Convite expirado**: Card com icone Clock, titulo "Convite expirado", data formatada, sugestao de solicitar novo
4. **Convite ja aceito (sem ser membro)**: Card com erro "Este convite ja foi usado"
5. **Usuario nao logado**: Card mostrando logo/nome do estudio, role, e botoes para Login/Signup com redirect
6. **Email incorreto**: Card mostrando email esperado vs email logado, botoes Cancelar e Fazer Logout
7. **Processando**: Spinner + "Adicionando voce ao estudio..."

**Verificacao de usuario existente (para decidir Login vs Signup):**
- Buscar na tabela `users` por `email = invite.email_convidado`
- Se existir: mostrar botao "Fazer Login"
- Se nao existir: mostrar botao "Criar Conta"

**Obter email do usuario logado:**
- Buscar via `supabase.auth.getSession()` -> `session.user.email`
- Nao depender do hook `useAuth` que nao retorna email

### 3. Modificar `src/pages/Login.tsx`

Adicionar suporte a `?redirect=` query param.

**Mudancas:**
- Ler `redirect` de `useSearchParams` ou `URLSearchParams`
- No `handleEmailLogin` apos sucesso: `navigate(redirect || '/dashboard')`
- No redirect de usuario ja autenticado: se tem redirect, navegar para redirect ao inves de dashboard
- Nos handlers OAuth (Google/LinkedIn): salvar redirect no `localStorage` como `pending_redirect` antes do OAuth redirect
- Preservar redirect no link "Criar conta" do footer: `<Link to={redirect ? \`/signup?redirect=${encodeURIComponent(redirect)}\` : '/signup'}>`

### 4. Modificar `src/pages/Signup.tsx`

Adicionar suporte a `?redirect=` e `?email=` query params.

**Mudancas:**
- Ler `redirect` e `emailParam` de searchParams (emailParam ja parcialmente suportado via slug)
- Inicializar campo email com `emailParam` se presente: `useState(emailParam || '')`
- No `handleEmailSignup` apos sucesso: `navigate(redirect ? \`/onboarding?redirect=${encodeURIComponent(redirect)}\` : slug ? \`/onboarding?slug=${slug}\` : '/onboarding')`
- Nos handlers OAuth: salvar redirect no localStorage como `pending_redirect`
- Preservar redirect no link "Entrar" do footer

### 5. Modificar `src/pages/Onboarding.tsx`

Adicionar suporte a `?redirect=` query param.

**Mudancas:**
- Ler `redirect` de searchParams (alem do `slug` existente)
- No `handleSubmit` apos sucesso: `navigate(redirect || '/dashboard')`

### 6. Modificar `src/pages/AuthCallback.tsx`

Adicionar suporte a redirect apos OAuth.

**Mudancas:**
- Apos obter sessao, verificar se existe perfil na tabela `users`
- Ler `pending_redirect` do localStorage
- Se perfil existe e tem redirect: navegar para redirect
- Se perfil existe e sem redirect: navegar para `/dashboard`
- Se perfil nao existe: navegar para `/onboarding` (com redirect se houver, e slug se houver)
- Limpar `pending_redirect` do localStorage

### 7. Modificar `src/App.tsx`

Adicionar rota publica:

```text
<Route path="/invite/:token" element={<AcceptInvite />} />
```

Importar AcceptInvite de `src/pages/AcceptInvite`.
Rota NAO usa ProtectedRoute (pagina publica que lida com ambos os casos).

## Fluxo completo por cenario

**Usuario com conta e logado (email correto):**
1. Acessa `/invite/abc123`
2. Pagina busca convite via RPC
3. Detecta usuario logado com email correto
4. Chama `accept_studio_invite` via RPC
5. Redireciona para dashboard do estudio com toast de sucesso

**Usuario com conta mas nao logado:**
1. Acessa `/invite/abc123`
2. Pagina busca convite, detecta que nao esta logado
3. Verifica se email ja tem conta -> sim
4. Mostra botao "Fazer Login"
5. Redireciona para `/login?redirect=/invite/abc123`
6. Apos login, volta para `/invite/abc123` e auto-processa

**Usuario sem conta:**
1. Acessa `/invite/abc123`
2. Pagina busca convite, detecta que nao esta logado
3. Verifica se email ja tem conta -> nao
4. Mostra botao "Criar Conta"
5. Redireciona para `/signup?redirect=/invite/abc123&email=convidado@email.com`
6. Apos signup -> onboarding -> volta para `/invite/abc123` e auto-processa

## Seguranca

- Funcoes `security definer` bypassam RLS mas validam internamente
- `accept_studio_invite` valida email match no servidor (nao confia no client)
- Token nao e exposto alem do que ja esta na URL
- Nao permite aceitar convite com email diferente
- Funcoes usam `SET search_path = 'public'` para evitar injection

## O que NAO muda

- Tabelas existentes (nenhuma migracao de schema)
- RLS policies existentes
- Hook useAuth (usa sessao diretamente na pagina)
- Funcionalidade de criar convites (task 512)
- Navegacao entre estudios (task anterior)
