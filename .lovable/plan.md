
# Atualizar Formulario de Perfil (/dashboard/profile)

## Resumo

Atualizar o formulario de edicao de perfil para refletir as mudancas no banco de dados: remover campo removido, adicionar novos campos (slug editavel, pronomes, disponibilidade), e reorganizar a ordem.

## Estado Atual do Banco

- `nome_exibicao` -- JA REMOVIDO do banco (ainda referenciado no codigo)
- `pronomes` -- JA EXISTE no banco (text, nullable)
- `disponivel_para_trabalho` -- JA EXISTE (boolean, default false)
- RPC `check_slug_availability` -- JA EXISTE para verificar slug de usuario

## Mudancas

### 1. Arquivo: `src/pages/Profile.tsx`

**Remover:**
- Estado `nomeExibicao` e todo o bloco do campo "Nome de exibicao" no JSX
- Referencia a `nome_exibicao` no schema Zod, no fetch, no submit

**Renomear:**
- Label "Nome completo" para "Nome"
- Placeholder "Seu nome completo" para "Seu nome"

**Adicionar estados:**
- `slug` (string) -- username editavel
- `originalSlug` (string) -- slug original para comparacao
- `slugStatus` (string) -- 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
- `pronomes` (string) -- campo de pronomes
- `disponivelParaTrabalho` (boolean) -- switch de disponibilidade

**Adicionar imports:**
- `useDebounce` hook (ja existe)
- Icones: `Check`, `X`, `AlertTriangle`, `Loader2` (lucide)

**Logica de validacao do slug:**
- Regex: `/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/` (minusculas, numeros, hifen, sem hifen nas pontas)
- Minimo 3, maximo 30 caracteres
- Debounce 500ms antes de verificar disponibilidade
- Se slug === originalSlug, marcar como disponivel sem consultar o banco
- Caso contrario, consultar via `supabase.from('users').select('id').eq('slug', slug).maybeSingle()` e comparar com userId
- Feedback visual: icone verde (disponivel), vermelho (em uso), amarelo (formato invalido), spinner (verificando)

**Campo slug no JSX (apos Nome, col-span-2):**
- Input com classe `lowercase`, maxLength 30
- onChange filtra caracteres invalidos automaticamente
- Preview da URL: `matchmaking.games/p/{slug}`
- Mensagem dinamica abaixo baseada no status

**Campo pronomes no JSX (apos slug):**
- Input simples, maxLength 30
- Placeholder: "Ex: ele/dele, ela/dela, elu/delu"
- Descricao: "Como voce prefere ser chamado(a)"

**Switch disponivel_para_trabalho (apos titulo profissional, col-span-2):**
- Componente Switch do shadcn/ui
- Texto dinamico baseado no estado on/off
- OFF: "Seu perfil nao indica que voce esta procurando oportunidades"
- ON: com check verde "Seu perfil mostra que voce esta aberto a oportunidades"

**Atualizar fetchUserData:**
- Adicionar `slug, pronomes, disponivel_para_trabalho` ao select
- Popular os novos estados

**Atualizar handleSubmit:**
- Remover `nome_exibicao` do update
- Adicionar `slug, pronomes, disponivel_para_trabalho`
- Bloquear submit se slug invalido ou em uso

**Atualizar schema Zod:**
- Remover `nome_exibicao`
- Adicionar `slug` com validacoes (min 3, max 30, regex)
- Adicionar `pronomes` (max 30, opcional)
- Manter `titulo_profissional` com max 150

### 2. Ordem final dos campos no JSX

1. Avatar (existente)
2. Nome (renomeado, 1 coluna)
3. Slug (novo, 1 coluna -- ao lado do Nome)
4. Pronomes (novo, 1 coluna)
5. Titulo profissional (existente, 1 coluna -- ao lado dos pronomes)
6. Disponivel para trabalho (novo, col-span-2, switch)
7. Bio curta (existente, col-span-2)
8. Estado + Cidade (existentes, 1 col cada)
9. Email + Telefone com toggles (existentes, 1 col cada)
10. Botao salvar (existente)

### 3. Desabilitar botao salvar

O botao "Salvar alteracoes" deve ficar desabilitado quando:
- `isSaving` esta true (ja existe)
- `slugStatus` e 'checking', 'taken' ou 'invalid'

## Nenhuma migracao necessaria

Todas as colunas necessarias ja existem no banco. A RPC `check_slug_availability` ja existe. Apenas mudancas no frontend.
