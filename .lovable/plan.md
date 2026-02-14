# Melhorias no Perfil Publico /p/:slug

## Resumo

Seis melhorias na pagina publica do perfil: adicionar pronomes, simplificar icones sociais, reagrupar botao de copiar URL, dividir projetos em destaque/outros, tornar cards de projeto clicaveis, e criar rota placeholder para pagina de projeto.

## Arquivos a modificar

### 1. `src/hooks/usePublicProfile.ts`

**Mudancas:**

- Adicionar `pronomes` ao select da query de usuario (linha 122)
- Adicionar `pronomes: string | null` ao tipo `PublicUserData`
- Adicionar `slug` ao select da query de projetos (linha 145)
- Adicionar `slug` ao tipo `PublicProjectData`
- Remover o filtro `.eq("destaque", true)` (linha 150) para buscar TODOS os projetos nao-arquivados
- Separar os projetos retornados em dois arrays: `featuredProjects` (destaque === true) e `otherProjects` (destaque !== true)
- Adicionar `destaque` ao select e ao tipo `PublicProjectData`
- Atualizar `PublicProfileData` para incluir `featuredProjects` e `otherProjects` em vez de um unico `projects`

### 2. `src/components/public-profile/ProfileHero.tsx`

**Mudanca 1 - Pronomes:**

- Ao lado do nome (h1), se `user.pronomes` existir, adicionar: `<span className="text-lg text-muted-foreground font-normal ml-2">({user.pronomes})</span>` inline com o nome, ou na mesma linha usando um separador visual como `·`
- Formato: "Lucas Pimenta · Ele/dele" onde o pronome tem cor `text-muted-foreground` e peso `font-normal`

**Mudanca 2 - Remover botao Compartilhar:**

- Remover completamente o botao "Compartilhar" e a funcao `handleShare` do Hero (linhas 14-31, 69-75)
- A logica de copiar URL sera movida para o AboutSection

### 3. `src/components/public-profile/AboutSection.tsx`

**Mudanca 1 - Icones sociais apenas com icones + tooltip:**

- Remover o `<span>` com o texto do label de cada link social (linha 54)
- Manter apenas o icone dentro do `<a>`
- Reduzir padding do link para `p-2.5` (era `px-4 py-2`)
- Envolver cada link com `<Tooltip>` do shadcn/ui para mostrar o label no hover

**Mudanca 2 - Botao copiar URL agrupado com links sociais:**

- Adicionar um botao de copiar URL (icone `Copy` do lucide-react) na mesma linha dos links sociais
- O botao tera o mesmo estilo visual dos icones sociais (`p-2.5 rounded-lg bg-muted/50 hover:bg-muted`)
- Mover a logica de `handleShare` do ProfileHero para ca (copiar URL + toast)
- Usar `<Tooltip>` com label "Copiar link do perfil"
- O botao deve aparecer SEMPRE (mesmo sem links sociais), entao ajustar a condicao de renderizacao

**Mudanca 3 - Receber `slug` como prop:**

- A prop `user` ja contem `slug`, entao usar `user.slug` para construir a URL

### 4. `src/components/public-profile/ProjectsSection.tsx`

**Mudanca completa - Dividir em duas subsecoes:**

Props: Receber `featuredProjects` e `otherProjects` separadamente, alem do `userSlug` (string do slug do usuario para construir URLs).

**Subsecao "Projetos em Destaque":**

- Grid `grid-cols-1 md:grid-cols-2` (2 colunas no desktop, cards maiores)
- Cards clicaveis: envolver cada card com `<a href={/p/${userSlug}/project/${project.slug}} target="_blank" rel="noopener noreferrer">` abrindo em nova aba (a rota sera criada)
- Remover icones de acao (demo, video, codigo) dos cards
- Adicionar `cursor-pointer` e hover sutil (`hover:border-border hover:shadow-lg`)
- Manter: imagem, badge de tipo, titulo, descricao curta

**Subsecao "Outros Projetos":**

- Titulo "Outros Projetos" com `text-lg font-display font-semibold`
- Grid `grid-cols-1 sm:grid-cols-2 md:grid-cols-3` (3 colunas desktop, cards mais compactos)
- Cards menores: sem imagem de capa, apenas titulo + descricao + badge de tipo
- Tambem clicaveis com `<a href={/p/${userSlug}/project/${project.slug}} target="_blank" rel="noopener noreferrer">`
- So renderizar esta subsecao se `otherProjects.length > 0`

**Card de projeto vazio:** Se ambos arrays estiverem vazios, mostrar mensagem "Nenhum projeto adicionado ainda."

### 5. `src/pages/PublicProfile.tsx`

- Atualizar destructuring de `data` para usar `featuredProjects` e `otherProjects` em vez de `projects`
- Passar `featuredProjects`, `otherProjects` e `user.slug` como props para `ProjectsSection`

### 6. `src/App.tsx`

- Criar uma rota `/p/:slug/project/:projectSlug` apontando para um novo componente placeholder

### 7. `src/pages/ProjectDetail.tsx` (novo arquivo)

- Pagina placeholder simples com Header, um Card centralizado e mensagem "Pagina em construcao"
- Importar e usar o componente `Header`
- Layout: `max-w-4xl mx-auto px-4 py-12 pt-16`

## Detalhes tecnicos

- Importar `Tooltip, TooltipTrigger, TooltipContent` do shadcn/ui no AboutSection
- Importar `Copy` do lucide-react no AboutSection
- Importar `useToast` no AboutSection para o toast de copia
- O campo `projetos.slug` pode ser `null` - usar fallback para `project.id` se slug nao existir na URL
- Nenhuma migracao de banco necessaria