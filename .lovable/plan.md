# Pagina Publica do Estudio (/studio/:slug)

## Resumo

Criar uma pagina publica para exibir informacoes de um estudio de games, acessivel em `/studio/:slug`. A pagina busca dados do estudio pelo slug na URL e exibe header, sobre, e vagas ativas usando Cards do shadcn/ui.

## Arquivos a criar

### 1. `src/hooks/usePublicStudio.ts`

Hook com `useQuery` do TanStack que:

- Busca o estudio na tabela `estudios` pelo slug (select de todos os campos publicos: id, nome, slug, logo_url, sobre, cidade, estado, tamanho, website, fundado_em, especialidades)
- Em paralelo, busca vagas ativas do estudio com a mesma estrutura do `useJobs` para compatibilidade com `JobCard`:
  - Tabela `vagas` com select de: id, titulo, slug, nivel, remoto, tipo_contrato, tipo_publicacao, tipo_funcao, estado, cidade, criada_em
  - Join com `estudio:estudios(nome, slug, logo_url, estado, cidade)`
  - Join com `vaga_habilidades(id, obrigatoria, habilidade:habilidades(id, nome, categoria))`
  - Filtros: `estudio_id = estudio.id`, `ativa = true`, `expira_em > now()`
  - Ordenacao: tipo_publicacao DESC, criada_em DESC
- Retorna `{ studio, vagas }` tipados
- `staleTime: 5 minutos`
- `enabled: !!slug`

### 2. `src/pages/StudioPublicProfile.tsx`

Pagina com 3 cards:

**Card 1 - Header do Estudio:**

- Avatar com logo ou iniciais (usando Avatar do shadcn)
- Nome do estudio (font-display, text-3xl, font-bold)
- Localizacao (icone MapPin + cidade, estado) -- condicional
- Tamanho (icone Users + texto formatado via `formatTamanhoEstudio`) -- condicional
- Website (icone Globe + link externo clicavel, target _blank) -- condicional
- Ano de fundacao (icone Calendar + "Fundado em YYYY") -- condicional
- Especialidades como Badges (variant secondary) -- condicional

**Card 2 - Sobre o Estudio:**

- Titulo "Sobre o Estudio" (font-display, text-xl, font-semibold)
- Texto do campo `sobre` com `whitespace-pre-line` para preservar quebras de linha
- Nao renderizar este card se `sobre` estiver vazio/null

**Card 3 - Vagas Ativas:**

- Titulo "Vagas Ativas" (font-display, text-xl, font-semibold)
- Lista de vagas usando o componente `JobCard` existente, passando cada vaga como `VagaListItem`
- Se nao houver vagas: mensagem "Este estudio nao possui vagas abertas no momento" em texto muted

**Estados:**

- Loading: skeleton similar ao usado em PublicProfile.tsx
- Estudio nao encontrado: reutilizar padrao do ProfileNotFound com texto adaptado ("Estudio nao encontrado")

**Layout:**

- `max-w-4xl mx-auto px-4 py-12`
- `space-y-6` entre os cards
- Header global fixo (componente Header) com pt-16 para compensar

## Arquivo a modificar

### 3. `src/App.tsx`

- Importar `StudioPublicProfile` de `src/pages/StudioPublicProfile`
- Adicionar rota `/studio/:slug` (publica, sem ProtectedRoute)

## Detalhes tecnicos

- Reutilizar `formatTamanhoEstudio` de `src/lib/formatters.ts` para formatar o tamanho
- Reutilizar `VagaListItem` de `src/hooks/useJobs` como tipo para as vagas
- Reutilizar `JobCard` de `src/components/jobs/JobCard.tsx` para renderizar cada vaga
- Reutilizar `Header` de `src/components/layout/Header.tsx`
- Icones do lucide-react: MapPin, Users, Globe, Calendar
- Nenhuma migracao de banco necessaria -- todos os dados ja existem