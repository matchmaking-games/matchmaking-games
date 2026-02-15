
# Pagina de Detalhes do Projeto (/p/:slug/project/:projectSlug)

## Resumo

Criar a pagina completa de detalhes de um projeto individual, acessivel publicamente. Inclui criacao de um hook dedicado `useProjectDetail` para buscar dados do projeto com joins (habilidades, estudios colaboradores, dono do projeto), e a implementacao completa do componente `ProjectDetail.tsx` substituindo o placeholder atual.

## Arquivos a criar/modificar

### 1. Criar `src/hooks/useProjectDetail.ts` (novo arquivo)

Hook dedicado que recebe `userSlug` e `projectSlug` como parametros.

**Query Supabase:**
1. Buscar usuario pelo `userSlug` na tabela `users` para obter o `user_id` (campos: id, nome_completo, titulo_profissional, avatar_url, slug)
2. Buscar projeto na tabela `projetos` filtrando por `user_id` e por `slug = projectSlug` (com fallback para `id = projectSlug` caso slug seja null)
3. Join com `projeto_habilidades` -> `habilidades` para pegar skills (id, nome, categoria, icone_url)
4. Join com `projeto_estudios` -> `estudios` para pegar estudios colaboradores (id, nome, slug, logo_url)
5. Retornar objeto tipado com projeto + owner + skills + estudios

**Tipos exportados:**
```
ProjectDetailData {
  project: { todos os campos do projeto }
  owner: { id, nome_completo, titulo_profissional, avatar_url, slug }
  skills: { id, nome, categoria, icone_url }[]
  studios: { id, nome, slug, logo_url }[]
}
```

**Usar `useQuery` do TanStack** com queryKey `["project-detail", userSlug, projectSlug]` e staleTime de 5 minutos.

### 2. Reescrever `src/pages/ProjectDetail.tsx`

Substituir o placeholder atual pela pagina completa. Estrutura da pagina:

**Importacoes:** Header, Card, Badge, Button, Avatar, Skeleton, AspectRatio, Separator, useProjectDetail, formatters, lucide icons (ChevronLeft, Play, Code, Video, ExternalLink, Calendar, Briefcase), Link e useParams do react-router-dom.

**Loading state:** Skeleton similar ao JobDetail - hero skeleton + content skeletons.

**Error/404 state:** Card centralizado com mensagem "Projeto nao encontrado" e botao "Voltar ao perfil" linkando para `/p/:slug`.

**SEO:** useEffect para atualizar `document.title` com o nome do projeto.

**Layout da pagina (de cima para baixo):**

**a) Back button:**
- Botao ghost "Voltar ao perfil" com ChevronLeft, linkando para `/p/${userSlug}`

**b) Hero - Imagem de capa:**
- Se `imagem_capa_url` existir: imagem full-width com AspectRatio 16/9, rounded-lg, overflow-hidden
- Se nao existir: div com gradiente sutil e inicial do titulo centralizada (similar ao FeaturedProjectCard)

**c) Titulo + Badges + Owner (abaixo da imagem):**
- Titulo: `text-3xl md:text-4xl font-display font-bold`
- Linha de badges: Badge de tipo (com cores do ProjectsSection) + Badge de status (amarelo para em_andamento, verde para concluido)
- Owner card inline: flex row com Avatar pequeno (w-8 h-8) + nome + titulo profissional, clicavel para `/p/${owner.slug}`, com hover sutil

**d) Layout 2 colunas (desktop) / 1 coluna (mobile):**

Coluna principal (flex-[2]):

- **Secao "Sobre o Projeto":** descricao em `whitespace-pre-wrap text-muted-foreground`, dentro de um Card
- **Video embed (condicional):** Se `video_url` contem "youtube.com" ou "youtu.be", extrair video ID e renderizar iframe embed responsivo com AspectRatio 16/9. Se contem "vimeo.com", embed do Vimeo. Caso contrario, nao fazer embed (sera mostrado como link na secao de links)
- **Secao "Habilidades Utilizadas" (condicional):** Grid/flex-wrap de badges com nome da habilidade. Usar cores por categoria (similar ao perfil publico). Mostrar icone_url se existir (img pequena ao lado do nome no badge)

Sidebar (flex-1, order-first no mobile):

- **Card "Detalhes":** Lista key-value com:
  - Papel (se existir): icone Briefcase + valor
  - Periodo: icone Calendar + data formatada usando formatDateRange ou logica similar (inicio - fim, ou "Inicio - Ate o momento" se status em_andamento e sem fim)
  - Tipo: badge com label formatado (formatTipoProjeto)
  - Status: badge com cor (amarelo/verde)

- **Card "Links" (condicional - so se algum link existir):**
  - Botao primario para demo_url: icone Play + "Jogar / Ver Demo"
  - Botao secondary para codigo_url: icone Code + "Ver Codigo"
  - Botao secondary para video_url: icone Video + "Assistir Video" (link direto, complementar ao embed)
  - Todos com target="_blank"
  - Botoes em largura total (`w-full`) empilhados

- **Card "Estudios Colaboradores" (condicional):**
  - Lista de estudios com Avatar (logo) + nome
  - Cada item clicavel para `/studio/${studio.slug}` (se slug existir)
  - Hover sutil

### 3. Rota no `src/App.tsx`

Ja existe a rota `/p/:slug/project/:projectSlug` apontando para ProjectDetail. Nao precisa alterar.

## Funcao helper para YouTube embed

Criar funcao utilitaria dentro do ProjectDetail (ou em formatters.ts) para extrair YouTube video ID:
- Input: URL string
- Detectar padroes: `youtube.com/watch?v=ID`, `youtu.be/ID`, `youtube.com/embed/ID`
- Retornar ID ou null

## Detalhes de design

- Manter identidade visual consistente com JobDetail e perfil publico
- Cores de badge de tipo: reusar o mapeamento `typeColors` do ProjectsSection
- Badge de status: `em_andamento` -> `bg-yellow-500/10 text-yellow-500`, `concluido` -> `bg-green-500/10 text-green-500`
- Cards com `shadow-sm` ou `shadow-none` consistente com o resto
- Transicoes suaves em hovers
- Font display para titulos, font sans para corpo
