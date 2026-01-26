
## Plano: Pagina de Perfil Publico (/p/{slug})

### Visao Geral

Criar a pagina publica de perfil de profissionais acessivel em `/p/{slug}`, permitindo que qualquer pessoa (mesmo sem login) visualize o portfolio completo de um profissional. A pagina sera a principal ferramenta de marketing pessoal da plataforma.

---

### Pre-requisitos Verificados

| Item | Status |
|------|--------|
| Coluna `banner_url` na tabela `users` | Existe |
| Coluna `anos_experiencia` em `user_habilidades` | Existe |
| RLS permite leitura publica de `users` | Policy "Perfis sao publicos" ativa |
| RLS permite leitura publica de projetos/skills/etc | Todas as tabelas tem SELECT publico |

**Nenhuma migracao de banco necessaria.**

---

### Estrutura de Arquivos

| Acao | Arquivo | Descricao |
|------|---------|-----------|
| Criar | `src/pages/PublicProfile.tsx` | Pagina principal do perfil publico |
| Criar | `src/hooks/usePublicProfile.ts` | Hook para buscar dados publicos do perfil |
| Criar | `src/components/public-profile/ProfileHero.tsx` | Hero section com banner e foto |
| Criar | `src/components/public-profile/ProfileNav.tsx` | Navegacao sticky entre secoes |
| Criar | `src/components/public-profile/AboutSection.tsx` | Secao Sobre com bio e links |
| Criar | `src/components/public-profile/ProjectsSection.tsx` | Secao de projetos em destaque |
| Criar | `src/components/public-profile/SkillsSection.tsx` | Secao de habilidades agrupadas |
| Criar | `src/components/public-profile/ExperienceSection.tsx` | Timeline de experiencias |
| Criar | `src/components/public-profile/EducationSection.tsx` | Lista de educacao |
| Criar | `src/components/public-profile/ProfileNotFound.tsx` | Estado de erro 404 |
| Modificar | `src/App.tsx` | Adicionar rota `/p/:slug` |

---

### Hook usePublicProfile

**Arquivo:** `src/hooks/usePublicProfile.ts`

Query unica que busca todos os dados do perfil:

```typescript
// Tipos retornados
interface PublicProfileData {
  user: UserData | null;
  projects: ProjectData[];
  skills: SkillData[];
  experiences: ExperienceData[];
  educations: EducationData[];
}

// Busca por slug
const fetchPublicProfile = async (slug: string) => {
  // 1. Buscar usuario pelo slug
  const { data: user } = await supabase
    .from("users")
    .select(`
      id, nome_exibicao, nome_completo, titulo_profissional,
      bio_curta, sobre, localizacao, avatar_url, banner_url,
      disponivel_para_trabalho, website, linkedin_url, github_url,
      portfolio_url, email, telefone, mostrar_email, mostrar_telefone
    `)
    .eq("slug", slug)
    .single();

  if (!user) return { user: null, ... };

  // 2. Buscar projetos em destaque (nao arquivados)
  const { data: projects } = await supabase
    .from("projetos")
    .select(`*, projeto_habilidades(id, habilidade:habilidades(id, nome, categoria))`)
    .eq("user_id", user.id)
    .eq("destaque", true)
    .neq("status", "arquivado")
    .order("ordem");

  // 3. Buscar habilidades com join
  const { data: skills } = await supabase
    .from("user_habilidades")
    .select(`id, nivel, ordem, anos_experiencia, habilidade:habilidades(id, nome, categoria)`)
    .eq("user_id", user.id)
    .order("ordem");

  // 4. Buscar experiencias (mais recentes primeiro)
  const { data: experiences } = await supabase
    .from("experiencia")
    .select("*")
    .eq("user_id", user.id)
    .order("inicio", { ascending: false });

  // 5. Buscar educacao
  const { data: educations } = await supabase
    .from("educacao")
    .select("*")
    .eq("user_id", user.id)
    .order("ordem");

  return { user, projects, skills, experiences, educations };
};
```

---

### Componente ProfileHero

**Arquivo:** `src/components/public-profile/ProfileHero.tsx`

**Estrutura visual:**
```text
┌────────────────────────────────────────────────────────────┐
│                                                            │
│              BANNER (240px desktop / 160px mobile)         │
│                                                            │
│  ┌──────────┐                                              │
│  │          │                                              │
└──│  AVATAR  │──────────────────────────────────────────────┘
   │ (160px)  │
   └──────────┘
   Nome de Exibicao                            [Compartilhar]
   Titulo Profissional
   📍 Localizacao
   ┌─────────────────────────┐
   │ ✓ Disponivel p/ trabalho│  (badge verde se true)
   └─────────────────────────┘
```

**Implementacao:**
- Banner: `aspect-[4/1]` no desktop, `aspect-[3/1]` no mobile
- Se `banner_url` existir: `<img>` com `object-cover`
- Fallback: gradiente sutil `from-primary/10 to-primary/5`
- Avatar: posicionamento absoluto com `bottom: -60px` (metade fora)
- Borda branca grossa: `border-4 border-background`
- Botao compartilhar: copia `https://matchmaking.games/p/{slug}` e mostra toast

---

### Componente ProfileNav (Sticky)

**Arquivo:** `src/components/public-profile/ProfileNav.tsx`

**Comportamento:**
- `position: sticky; top: 0; z-index: 40`
- Links: Sobre | Projetos | Skills | Experiencia | Educacao
- Usa `IntersectionObserver` para destacar secao visivel
- Scroll suave com `scrollIntoView({ behavior: 'smooth' })`
- No mobile: `overflow-x-auto` + `scrollbar-hide`

**Visual:**
```typescript
<nav className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
  <div className="max-w-4xl mx-auto px-4">
    <div className="flex gap-6 overflow-x-auto scrollbar-hide py-4">
      {sections.map(section => (
        <button
          key={section.id}
          onClick={() => scrollTo(section.id)}
          className={cn(
            "whitespace-nowrap text-sm font-medium transition-colors",
            activeSection === section.id
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {section.label}
        </button>
      ))}
    </div>
  </div>
</nav>
```

---

### Componente AboutSection

**Arquivo:** `src/components/public-profile/AboutSection.tsx`

**Conteudo:**
- `bio_curta` em destaque (se existir)
- Links sociais em linha (icones clicaveis):
  - Globe (website), LinkedIn, GitHub, Briefcase (portfolio)
  - Cada link abre em nova aba
- Contato (condicional):
  - Email (se `mostrar_email = true`)
  - Telefone (se `mostrar_telefone = true`)

---

### Componente ProjectsSection

**Arquivo:** `src/components/public-profile/ProjectsSection.tsx`

**Grid responsivo:**
- Desktop: `grid-cols-3`
- Tablet: `grid-cols-2`
- Mobile: `grid-cols-1`

**Cada card mostra:**
- Imagem de capa (16:9, object-cover) ou placeholder
- Badge de tipo no canto superior
- Titulo
- `descricao_curta` (max 2 linhas com `line-clamp-2`)
- Footer com icones de links: Demo, Video, Codigo (se existirem)

**Estado vazio:**
```text
"Nenhum projeto em destaque ainda"
```

---

### Componente SkillsSection

**Arquivo:** `src/components/public-profile/SkillsSection.tsx`

**Agrupamento por categoria:**
```text
ENGINES
┌─────────────────┐ ┌─────────────────┐
│ Unity     ●●●●○ │ │ Unreal   ●●●○○ │
│ 5 anos          │ │ 2 anos          │
└─────────────────┘ └─────────────────┘

LINGUAGENS
┌─────────────────┐ ┌─────────────────┐
│ C#        ●●●●○ │ │ Python   ●●○○○ │
└─────────────────┘ └─────────────────┘
```

**Mapeamento de nivel para bolinhas:**
```typescript
const levelDots: Record<string, number> = {
  basico: 1,
  intermediario: 2,
  avancado: 3,
  expert: 4,
};
```

**Categoria headers:**
- engine: "Engines"
- linguagem: "Linguagens"
- ferramenta: "Ferramentas"
- soft_skill: "Soft Skills"

---

### Componente ExperienceSection

**Arquivo:** `src/components/public-profile/ExperienceSection.tsx`

**Timeline vertical:**
```text
│
├── ● Game Developer
│     Ubisoft · CLT
│     Jan 2022 - Atualmente (2 anos)
│     📍 Sao Paulo, SP · Remoto
│     Descricao truncada em 4 linhas...
│     [Ler mais]
│
├── ● Game Designer
│     Indie Studio · PJ
│     Mar 2020 - Dez 2021 (1 ano e 9 meses)
│
```

**Implementacao:**
- Linha vertical: `border-l-2 border-border ml-4`
- Ponto: `absolute -left-[9px] w-4 h-4 rounded-full bg-primary`
- Badges coloridos para tipo de emprego (reutilizar cores do ExperienceCard)
- Descricao com `line-clamp-4` + "Ler mais" toggle

---

### Componente EducationSection

**Arquivo:** `src/components/public-profile/EducationSection.tsx`

**Lista simples (sem timeline):**
```text
┌─────────────────────────────────────────────────┐
│ [Badge Graduacao]                               │
│ Ciencia da Computacao                           │
│ Universidade de Sao Paulo                       │
│ 2015 - 2019 · Concluido                         │
│ [Link credencial]                               │
└─────────────────────────────────────────────────┘
```

**Badges coloridos por tipo** (reutilizar cores do EducationCard)

---

### Componente ProfileNotFound

**Arquivo:** `src/components/public-profile/ProfileNotFound.tsx`

**Layout:**
```text
┌─────────────────────────────────────────┐
│                   404                   │
│                                         │
│       Perfil nao encontrado             │
│                                         │
│   O perfil que voce procura nao existe  │
│   ou foi removido.                      │
│                                         │
│          [Voltar para Home]             │
└─────────────────────────────────────────┘
```

---

### Pagina PublicProfile (Principal)

**Arquivo:** `src/pages/PublicProfile.tsx`

**Estrutura:**
```tsx
export default function PublicProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading, error } = usePublicProfile(slug);

  // SEO: Document title e meta tags
  useEffect(() => {
    if (data?.user) {
      document.title = `${data.user.nome_exibicao || data.user.nome_completo} - ${data.user.titulo_profissional || 'Profissional'} | Matchmaking`;
    }
  }, [data]);

  if (loading) return <LoadingState />;
  if (error || !data?.user) return <ProfileNotFound />;

  const { user, projects, skills, experiences, educations } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero com banner + avatar + info basica */}
      <ProfileHero user={user} />

      {/* Navegacao sticky */}
      <ProfileNav />

      {/* Secoes */}
      <main className="max-w-4xl mx-auto px-4 pb-16 space-y-16">
        <AboutSection id="sobre" user={user} />
        <ProjectsSection id="projetos" projects={projects} />
        <SkillsSection id="skills" skills={skills} />
        <ExperienceSection id="experiencia" experiences={experiences} />
        <EducationSection id="educacao" educations={educations} />
      </main>
    </div>
  );
}
```

---

### Modificar App.tsx

Adicionar rota publica (fora de ProtectedRoute):

```tsx
// Nova importacao
import PublicProfile from "./pages/PublicProfile";

// Adicionar antes do catch-all "*"
<Route path="/p/:slug" element={<PublicProfile />} />
```

**Posicao na lista de rotas:**
```tsx
<Route path="/onboarding" element={<Onboarding />} />
{/* ... rotas do dashboard ... */}
<Route path="/p/:slug" element={<PublicProfile />} />  {/* NOVA */}
{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
<Route path="*" element={<NotFound />} />
```

---

### SEO (Meta Tags Dinamicas)

No `PublicProfile.tsx`, usar `useEffect` para atualizar meta tags:

```typescript
useEffect(() => {
  if (!data?.user) return;

  const { user } = data;
  const name = user.nome_exibicao || user.nome_completo;
  const title = user.titulo_profissional || 'Profissional';
  const description = user.bio_curta?.slice(0, 160) || `Perfil de ${name}`;
  const image = user.banner_url || user.avatar_url;
  const url = `https://matchmaking.games/p/${slug}`;

  // Title
  document.title = `${name} - ${title} | Matchmaking`;

  // Meta description
  updateMetaTag('description', description);

  // Open Graph
  updateMetaTag('og:title', `${name} - ${title}`);
  updateMetaTag('og:description', description);
  updateMetaTag('og:image', image || '');
  updateMetaTag('og:url', url);
  updateMetaTag('og:type', 'profile');

  // Twitter Card
  updateMetaTag('twitter:card', 'summary_large_image');
  updateMetaTag('twitter:title', `${name} - ${title}`);
  updateMetaTag('twitter:description', description);
  updateMetaTag('twitter:image', image || '');

  // Canonical
  updateLinkTag('canonical', url);
}, [data, slug]);

function updateMetaTag(name: string, content: string) {
  let tag = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function updateLinkTag(rel: string, href: string) {
  let tag = document.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}
```

---

### Responsividade do Banner

| Breakpoint | Banner | Avatar |
|------------|--------|--------|
| Desktop (>1024px) | 240px altura | 160px |
| Tablet (768-1023px) | 200px altura | 140px |
| Mobile (<768px) | 160px altura | 120px |

**Classes Tailwind:**
```typescript
// Banner
className="h-40 md:h-[200px] lg:h-[240px]"

// Avatar
className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] lg:w-[160px] lg:h-[160px]"
```

---

### Ordem de Implementacao

| Ordem | Arquivo | Tipo |
|-------|---------|------|
| 1 | `src/hooks/usePublicProfile.ts` | Criar |
| 2 | `src/components/public-profile/ProfileNotFound.tsx` | Criar |
| 3 | `src/components/public-profile/ProfileHero.tsx` | Criar |
| 4 | `src/components/public-profile/ProfileNav.tsx` | Criar |
| 5 | `src/components/public-profile/AboutSection.tsx` | Criar |
| 6 | `src/components/public-profile/ProjectsSection.tsx` | Criar |
| 7 | `src/components/public-profile/SkillsSection.tsx` | Criar |
| 8 | `src/components/public-profile/ExperienceSection.tsx` | Criar |
| 9 | `src/components/public-profile/EducationSection.tsx` | Criar |
| 10 | `src/pages/PublicProfile.tsx` | Criar |
| 11 | `src/App.tsx` | Modificar |

---

### Checklist de Validacoes

| Regra | Implementacao |
|-------|---------------|
| NAO mostrar email se `mostrar_email = false` | Condicional em AboutSection |
| NAO mostrar telefone se `mostrar_telefone = false` | Condicional em AboutSection |
| NAO exigir autenticacao | Rota fora de ProtectedRoute |
| NAO mostrar projetos arquivados | Filtro `.neq("status", "arquivado")` |
| Slug inexistente = 404 | ProfileNotFound se user null |

---

### Resultado Esperado

| URL | Comportamento |
|-----|---------------|
| `/p/joaosilva` | Perfil publico do usuario com slug "joaosilva" |
| `/p/inexistente` | Tela 404 com "Perfil nao encontrado" |
| `/dashboard/profile` | Dashboard (nao alterado) |

