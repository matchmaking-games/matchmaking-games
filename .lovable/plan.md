
# Termos de Uso e Politica de Privacidade

## Arquivos a criar
- `src/pages/Terms.tsx`
- `src/pages/Privacy.tsx`

## Arquivos a modificar
- `src/App.tsx` (adicionar 2 rotas)
- `src/pages/Index.tsx` (adicionar links no footer)
- `src/pages/Signup.tsx` (adicionar frase de consentimento)

---

## Passo 1 -- Criar `src/pages/Terms.tsx`

Pagina estatica na rota `/terms`. Reutiliza o `Header` de `@/components/layout/Header` no topo e replica o mesmo footer inline da `Index.tsx` (logo, socials, frase, e os novos links de termos/privacidade).

Conteudo dentro de um `Card` centralizado com `max-w-[800px] mx-auto`, fundo `bg-card` (levemente mais claro que o background), padding `p-8 md:p-12`, border-radius padrao do Card. Background da pagina usa o mesmo `#0f0f0f` da landing.

Estrutura do conteudo (extraido do PDF):
- Titulo principal "Termos de Uso" em `font-display font-bold text-3xl`
- Subtitulo "Matchmaking" 
- Texto introdutorio
- Secoes 1-11 cada uma com titulo em `font-display font-semibold text-xl` e texto em `text-base text-muted-foreground` com `leading-relaxed`
- Listas com marcadores onde aplicavel
- Espacamento `space-y-8` entre secoes

Todo o conteudo e hardcoded como JSX (nao carrega do banco).

---

## Passo 2 -- Criar `src/pages/Privacy.tsx`

Identico ao Passo 1, mas com o conteudo da Politica de Privacidade. Rota `/privacy`. Mesma estrutura visual.

Secoes extraidas do PDF:
- Titulo "Politica de Privacidade"
- Veracidade das Informacoes
- O que sao Dados Pessoais e Dados Sensiveis
- Empresa como Controladora
- Quais Tipos de Dados Pessoais sao Coletados
- Por que a Empresa Trata os Dados Pessoais
- Dados Pessoais Sensiveis
- Como a Empresa Armazena os Dados Pessoais
- Processamento Automatico
- Compartilhamento de Dados com Terceiros
- Duracao do Tratamento
- Seguranca das Informacoes
- Browsers Compativeis
- Cookies
- Marketing
- Compartilhamento com Terceiros (Google Analytics, Vercel, Supabase)
- Direito do Usuario
- Alteracao na Politica
- Encarregado da Empresa

---

## Passo 3 -- Adicionar rotas no `App.tsx`

Duas novas rotas publicas (sem ProtectedRoute):

```text
<Route path="/terms" element={<Terms />} />
<Route path="/privacy" element={<Privacy />} />
```

Adicionadas acima da rota catch-all `*`.

---

## Passo 4 -- Adicionar links no footer da `Index.tsx`

Abaixo da linha "Matchmaking . Feito para quem vive de games" (linha 760-762), adicionar uma nova `<p>` com dois `<Link>`:

```text
Termos de Uso · Politica de Privacidade
```

Estilo: `text-xs`, cor `rgba(255,255,255,0.35)`, sem underline por padrao, `hover:underline`. Separados por um ponto centralizado. `marginTop: 8`.

---

## Passo 5 -- Adicionar frase de consentimento no `Signup.tsx`

Abaixo do botao "Criar Perfil" (linha 304) e antes do fechamento do `</form>` (linha 305), adicionar:

```text
<p className="text-xs text-center text-muted-foreground mt-3">
  Ao criar uma conta, voce concorda com os{" "}
  <Link to="/terms" className="text-primary hover:underline">Termos de Uso</Link>
  {" "}e{" "}
  <Link to="/privacy" className="text-primary hover:underline">Politica de Privacidade</Link>
</p>
```

Fica dentro do `<form>`, logo apos o `<Button>`, antes do `</form>`. Nenhuma outra alteracao na pagina.

---

## O que NAO muda
- Nenhum componente existente alem dos listados
- Nenhuma logica de autenticacao
- Layout existente do footer (apenas adicao)
- Layout existente do signup (apenas adicao)
