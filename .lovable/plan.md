

# Rebuild Completo da Landing Page (Index.tsx)

## Objetivo
Reescrever `src/pages/Index.tsx` criando uma landing page premium com 6 secoes + footer, animacoes Framer Motion, e design dark inspirado no Supabase.

## Dependencia
- Instalar `framer-motion`

## Arquivo alterado
- `src/pages/Index.tsx` (unico arquivo)

## Logica preservada (zero alteracoes)
- `validateUsername`, `handleUsernameChange`, `useEffect` com debounce, `handleSubmit`
- `renderStatusIcon`, `getStatusMessage`, `isButtonDisabled`
- Imports de `supabase`, `matchmakingLogo`, `Input`, `Link`, `useNavigate`

## Novos imports
- `motion` de `framer-motion`
- `User`, `Building2`, `Check` de `lucide-react`
- `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` de `@/components/ui/accordion`
- `DisplayCards` de `@/components/ui/display-cards`
- `SocialIcon` de `@/components/SocialIcon`

## Estrutura da pagina

```text
+--------------------------------------------------+
| HERO (min-h-screen)                              |
|   Grid pattern + fade radial                     |
|   Logo > Badge > Headline > Subline > Input      |
+--------------------------------------------------+
| SOCIAL PROOF STRIP                               |
|   Dots pattern + fade horizontal                 |
|   Imagem evento + Copy lado a lado               |
+--------------------------------------------------+
| PARA QUEM E (2 cards + DisplayCards)             |
|   Grid pattern + fade radial                     |
|   Card Profissionais | Card Estudios             |
|   DisplayCards (defaults)                         |
+--------------------------------------------------+
| COMO FUNCIONA (3 passos)                         |
|   Dots pattern + fade radial                     |
|   01 --- 02 --- 03                               |
+--------------------------------------------------+
| FAQ (accordion 3 itens)                          |
|   Grid pattern + fade horizontal                 |
+--------------------------------------------------+
| CTA FINAL                                        |
|   Headline + Botao scroll-to-hero                |
+--------------------------------------------------+
| FOOTER                                           |
|   Logo + Social Icons + Copyright                |
+--------------------------------------------------+
```

## Detalhes por secao

### Secao 1 -- Hero
- `min-h-screen`, flexbox centralizado, grid pattern absoluto com fade radial
- Logo `h-8 opacity-60`, `mb-12`
- Badge pill verde: "◆ O portal de games do Brasil"
- Headline `font-display` peso 800: "Seu lugar na" (#f0f0f0) + "industria de games" (#22e47a)
- Responsivo: `text-5xl` / `sm:text-6xl` / `lg:text-7xl`
- Subline Geist `text-lg`, cor `rgba(255,255,255,0.55)`
- Form `id="hero-input"` com input restyled: bg `#1a1a1a`, borda `rgba(255,255,255,0.10)`, `borderRadius: 12px`, `height: 56px`
- Prefixo `matchmaking.games/p/` em `font-mono`
- Botao submit circular verde `#22e47a`, 40x40px
- Animacoes sequenciais com delays 0.1s a 0.5s

### Secao 2 -- Social Proof Strip
- Faixa com bordas `rgba(255,255,255,0.06)`, bg `rgba(255,255,255,0.015)`
- Dots pattern com fade horizontal
- Flex: imagem (max 180px) + copy; empilha em mobile
- Titulo: "Presente nos maiores eventos de games do Brasil"

### Secao 3 -- Para Profissionais e Estudios
- Grid pattern + fade radial
- Label "PARA QUEM E" + headline "Dois lados. Uma conexao."
- Grid 2 colunas (1 mobile): Card Profissionais (icone User verde, 3 beneficios, badge verde) e Card Estudios (icone Building2 cinza, 3 beneficios, badge cinza)
- Cards bg `#161616`, borda `rgba(255,255,255,0.07)`, hover muda borda
- Animacao: entram de lados opostos (x:-40 e x:40)
- DisplayCards abaixo com label contextual, max-w 600px

### Secao 4 -- Como Funciona
- Dots pattern + fade radial
- Label "O CAMINHO" + headline "Tres passos. Uma carreira."
- Grid 3 colunas (1 mobile) com linha tracejada conectora (`hidden md:block`)
- 3 passos: "Reserve seu username", "Monte seu portfolio", "Seja descoberto"
- Animacao stagger nos passos

### Secao 5 -- FAQ
- Grid pattern + fade horizontal
- Label "DUVIDAS" + headline "Perguntas frequentes."
- Accordion shadcn `type="single" collapsible`, 3 itens
- Bordas customizadas, trigger `font-display`, content Geist
- Trigger open state: cor `#22e47a`

### Secao 6 -- CTA Final
- Bg `rgba(34,228,122,0.04)`, bordas verdes
- Dots pattern + fade radial
- Headline: "Sua carreira em games comeca com um username."
- Botao scroll-to `#hero-input`

### Footer
- Bg `#0a0a0a`, borda top
- Logo + 5 icones sociais via SocialIcon (linkedin, instagram, tiktok, youtube, linktree -- todos suportados pelo componente)
- Copyright: "(c) 2025 Matchmaking . Feito para quem vive de games"

## Paleta (inline styles)
- Background: `#0f0f0f`, Cards: `#161616`, Verde: `#22e47a`
- Texto primario: `#f0f0f0`, secundario: `rgba(255,255,255,0.55)`
- Labels: `rgba(255,255,255,0.35)`, bordas: `rgba(255,255,255,0.07)`

## Responsividade
- Mobile-first, grids colapsam para 1 coluna
- Headline hero minimo `text-5xl`
- Padding horizontal minimo `px-5`
- Wrapper geral `overflow-x-hidden`

