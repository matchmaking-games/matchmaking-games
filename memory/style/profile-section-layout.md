# Memory: style/profile-section-layout
Updated: now

Todas as abas da seção "Meu Perfil" (/dashboard/profile/*) DEVEM seguir obrigatoriamente o mesmo padrão de layout:

1. **Estrutura obrigatória**: DashboardLayout → div.max-w-xl/4xl → Card → CardContent
2. **Título fixo**: h1 "Meu Perfil" (font-display text-3xl font-bold) no topo do CardContent
3. **Navegação**: ProfileNavigation logo abaixo do título, DENTRO do Card
4. **Descrição**: Parágrafo muted explicando a seção (text-muted-foreground mb-8)
5. **Conteúdo**: Formulário ou grid de itens abaixo da descrição

Esse padrão garante consistência visual entre Perfil, Portfólio, Habilidades e futuras abas. A navegação por tabs NUNCA deve ficar fora do Card principal.
