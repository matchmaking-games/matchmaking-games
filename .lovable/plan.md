

# Correcoes de Auth: LinkedIn, Login com Email e Tela de Confirmacao

## Arquivos a modificar
- `src/pages/Login.tsx`
- `src/pages/Signup.tsx`

Nenhum outro arquivo sera tocado.

---

## Correcao 1 — Remover LinkedIn de ambas as paginas

### Login.tsx
- Remover a funcao `handleLinkedInLogin` (linhas 86-102)
- Remover o botao "Continuar com LinkedIn" do JSX (linhas 180-191)

### Signup.tsx
- Remover a funcao `handleLinkedInSignup` (linhas 109-124)
- Remover o botao "Continuar com LinkedIn" do JSX (linhas 239-250)

Nenhum import precisa ser removido — todos os imports existentes (lucide icons, Button, supabase, etc.) continuam sendo usados por outras partes do codigo.

---

## Correcao 2 — Login com email verifica perfil antes de redirecionar

### Login.tsx — funcao `handleEmailLogin`

Apos o `signInWithPassword` retornar sem erro (linha 118), antes do `navigate`:

1. Extrair `data` do retorno do `signInWithPassword` (alterar destructuring para incluir `data`)
2. Consultar tabela `users` com `.select('id').eq('id', data.session.user.id).maybeSingle()`
3. Se encontrar perfil: `navigate(redirect || "/dashboard")`
4. Se nao encontrar: `navigate("/onboarding")`
5. Manter `setIsLoading(false)` implicito (o componente vai desmontar com o navigate)

---

## Correcao 3 — Tela de "Verifique seu email" no Signup

### Signup.tsx — Alteracoes

**Novo estado:**
- Adicionar `const [emailSent, setEmailSent] = useState(false)` junto aos outros estados

**Funcao `handleEmailSignup` (linhas 126-169):**
Apos o signup bem-sucedido (sem erro), substituir o bloco que faz navigate para onboarding por:
1. Se `slug` existir, salvar no localStorage como `pending_slug`
2. Se `redirect` existir, salvar no localStorage como `pending_redirect`
3. Chamar `setEmailSent(true)`
4. Nao chamar `navigate`

**JSX — Renderizacao condicional:**
No return do componente, dentro do card principal (apos o logo), adicionar condicional:
- Se `emailSent === true`: renderizar tela de confirmacao com:
  - Icone `Mail` centralizado (tamanho grande, cor primary)
  - Titulo "Verifique seu email" (font-display, text-2xl, font-bold)
  - Texto "Enviamos um link de confirmacao para **[email]**. Clique no link para ativar sua conta e continuar." (text-sm, text-muted-foreground)
  - Texto menor "Nao recebeu? Verifique a pasta de spam." (text-xs, text-muted-foreground)
  - Sem botoes adicionais, sem timer, sem reenvio
- Se `emailSent === false`: renderizar o formulario normalmente (codigo existente)

A tela de confirmacao fica dentro do mesmo card visual ja existente, mantendo logo no topo, mesma estrutura de layout.

---

## Ordem de implementacao

1. Editar `Login.tsx` — remover LinkedIn + corrigir handleEmailLogin
2. Editar `Signup.tsx` — remover LinkedIn + adicionar emailSent + tela de confirmacao

## O que NAO muda
- `AuthCallback.tsx`
- `Onboarding.tsx`
- `useAuth.ts`
- Qualquer outro arquivo
