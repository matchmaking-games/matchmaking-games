

## Plano: Pagina de Listagem de Vagas (/jobs)

### Visao Geral

Criar uma pagina publica para listar todas as vagas ativas da plataforma. A pagina tera uma sidebar com filtros visuais (nao funcionais nesta fase) e uma area principal com cards de vagas. Vagas pagas (tipo_publicacao = 'destaque') aparecem no topo com destaque visual.

---

### Correcoes Incorporadas ao Plano Original

| Correcao | Status |
|----------|--------|
| tipo_funcao incluido na query | Incorporado |
| Mostrar TODAS habilidades (nao so obrigatorias) | Incorporado |
| Sidebar sticky apenas no desktop (lg:sticky lg:top-24) | Incorporado |
| Sidebar expandida por padrao no mobile | Incorporado |

---

### Estrutura de Arquivos

| Acao | Arquivo | Descricao |
|------|---------|-----------|
| Modificar | `src/lib/formatters.ts` | Adicionar formatadores para vagas |
| Criar | `src/hooks/useJobs.ts` | Hook para buscar vagas com relacionamentos |
| Criar | `src/components/jobs/JobCardSkeleton.tsx` | Skeleton para loading state |
| Criar | `src/components/jobs/JobCard.tsx` | Card individual de vaga |
| Criar | `src/components/jobs/JobsSidebar.tsx` | Sidebar com filtros visuais |
| Criar | `src/pages/Jobs.tsx` | Pagina principal de listagem |
| Modificar | `src/App.tsx` | Adicionar rota /jobs |
| Modificar | `src/components/layout/Header.tsx` | Atualizar link de /vagas para /jobs |

---

### Secao Tecnica

#### 1. Formatadores (src/lib/formatters.ts)

Adicionar ao arquivo existente:

```typescript
/**
 * Converts job level enum to readable text
 * iniciante → "Iniciante", junior → "Junior", etc.
 */
export function formatNivelVaga(nivel: string): string {
  const map: Record<string, string> = {
    iniciante: "Iniciante",
    junior: "Junior",
    pleno: "Pleno",
    senior: "Senior",
    lead: "Lead",
  };
  return map[nivel] || nivel;
}

/**
 * Converts contract type enum to readable text
 * clt → "CLT", pj → "PJ", freelance → "Freelance", estagio → "Estagio"
 */
export function formatTipoContrato(tipo: string): string {
  const map: Record<string, string> = {
    clt: "CLT",
    pj: "PJ",
    freelance: "Freelance",
    estagio: "Estagio",
  };
  return map[tipo] || tipo;
}

/**
 * Converts work model enum to readable text
 * presencial → "Presencial", hibrido → "Hibrido", remoto → "Remoto"
 */
export function formatTipoTrabalho(tipo: string): string {
  const map: Record<string, string> = {
    presencial: "Presencial",
    hibrido: "Hibrido",
    remoto: "Remoto",
  };
  return map[tipo] || tipo;
}
```

---

#### 2. Hook useJobs.ts

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type NivelVaga = Database["public"]["Enums"]["nivel_vaga"];
type TipoContrato = Database["public"]["Enums"]["tipo_contrato"];
type TipoTrabalho = Database["public"]["Enums"]["tipo_trabalho"];
type TipoPublicacaoVaga = Database["public"]["Enums"]["tipo_publicacao_vaga"];
type CategoriaHabilidade = Database["public"]["Enums"]["categoria_habilidade"];

export interface VagaHabilidadeData {
  id: string;
  obrigatoria: boolean | null;
  habilidade: {
    id: string;
    nome: string;
    categoria: CategoriaHabilidade;
  } | null;
}

export interface VagaEstudioData {
  nome: string;
  slug: string;
  logo_url: string | null;
  localizacao: string | null;
}

export interface VagaListItem {
  id: string;
  titulo: string;
  slug: string;
  nivel: NivelVaga;
  remoto: TipoTrabalho;
  tipo_contrato: TipoContrato;
  tipo_publicacao: TipoPublicacaoVaga | null;
  tipo_funcao: string[];  // IMPORTANTE: incluido para exibir tipo de funcao
  localizacao: string | null;
  criada_em: string | null;
  estudio: VagaEstudioData | null;
  vaga_habilidades: VagaHabilidadeData[];
}

async function fetchJobs(): Promise<VagaListItem[]> {
  const now = new Date().toISOString();

  // IMPORTANTE: tipo_funcao esta incluido para exibir o tipo de funcao da vaga
  const { data, error } = await supabase
    .from("vagas")
    .select(`
      id,
      titulo,
      slug,
      nivel,
      remoto,
      tipo_contrato,
      tipo_publicacao,
      tipo_funcao,
      localizacao,
      criada_em,
      estudio:estudios(nome, slug, logo_url, localizacao),
      vaga_habilidades(
        id,
        obrigatoria,
        habilidade:habilidades(id, nome, categoria)
      )
    `)
    .eq("ativa", true)
    .gt("expira_em", now)
    .order("tipo_publicacao", { ascending: false })
    .order("criada_em", { ascending: false });

  if (error) {
    console.error("Error fetching jobs:", error);
    throw new Error("Nao foi possivel carregar as vagas.");
  }

  return (data || []) as VagaListItem[];
}

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
```

---

#### 3. Componente JobCardSkeleton.tsx

```typescript
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function JobCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex gap-4">
        <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-5 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-14" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-14" />
            <Skeleton className="h-5 w-10" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function JobsSkeletonGrid() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

---

#### 4. Componente JobCard.tsx

```typescript
import { Sparkles, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatNivelVaga, formatTipoContrato, formatTipoTrabalho } from "@/lib/formatters";
import { VagaListItem } from "@/hooks/useJobs";

interface JobCardProps {
  job: VagaListItem;
}

export function JobCard({ job }: JobCardProps) {
  const isDestaque = job.tipo_publicacao === "destaque";

  // Mostrar TODAS as habilidades (obrigatorias + desejaveis)
  // NAO filtrar apenas obrigatorias
  const allSkills = job.vaga_habilidades
    .filter((vh) => vh.habilidade !== null)
    .map((vh) => vh.habilidade!);

  const visibleSkills = allSkills.slice(0, 5);
  const extraCount = allSkills.length - 5;

  const studioName = job.estudio?.nome || "Estudio";
  const studioLocation = job.estudio?.localizacao || job.localizacao;

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <a
      href={`/jobs/${job.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <Card
        className={cn(
          "p-4 cursor-pointer transition-all duration-200",
          isDestaque
            ? "bg-muted/50 border-border hover:border-primary/40 hover:shadow-[0_0_20px_rgba(34,228,122,0.15)]"
            : "bg-card hover:border-border/80 hover:bg-muted/30"
        )}
      >
        <div className="flex gap-4">
          {/* Studio Logo 48x48 */}
          <Avatar className="w-12 h-12 rounded-lg flex-shrink-0">
            <AvatarImage src={job.estudio?.logo_url || undefined} alt={studioName} />
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-sm">
              {getInitials(studioName)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header: Studio name + Destaque badge */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="font-medium text-foreground truncate">
                  {studioName}
                </span>
                {studioLocation && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{studioLocation}</span>
                  </p>
                )}
              </div>
              {isDestaque && (
                <Badge className="bg-primary/10 text-primary border-0 flex-shrink-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Destaque
                </Badge>
              )}
            </div>

            {/* Job Title */}
            <h3 className="font-semibold text-lg text-foreground leading-tight">
              {job.titulo}
            </h3>

            {/* Badges: Contract, Level, Work Model */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                {formatTipoContrato(job.tipo_contrato)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {formatNivelVaga(job.nivel)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {formatTipoTrabalho(job.remoto)}
              </Badge>
            </div>

            {/* Skills - mostra ate 5 + badge "+X" para restantes */}
            {allSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {visibleSkills.map((skill, index) => (
                  <Badge
                    key={skill.id || index}
                    variant="secondary"
                    className="text-xs bg-muted/80"
                  >
                    {skill.nome}
                  </Badge>
                ))}
                {extraCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-muted text-muted-foreground"
                  >
                    +{extraCount}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </a>
  );
}
```

---

#### 5. Componente JobsSidebar.tsx

```typescript
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function JobsSidebar() {
  return (
    // CORRECAO: sticky apenas no desktop (lg:sticky lg:top-24)
    // No mobile, sidebar fica estatica e expandida por padrao
    <Card className="p-4 space-y-6 lg:sticky lg:top-24">
      <h2 className="font-semibold text-lg">Filtros</h2>

      {/* Nivel */}
      <div className="space-y-2">
        <Label className="text-sm">Nivel</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Todos os niveis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="iniciante">Iniciante</SelectItem>
            <SelectItem value="junior">Junior</SelectItem>
            <SelectItem value="pleno">Pleno</SelectItem>
            <SelectItem value="senior">Senior</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tipo de Contrato */}
      <div className="space-y-2">
        <Label className="text-sm">Tipo de Contrato</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clt">CLT</SelectItem>
            <SelectItem value="pj">PJ</SelectItem>
            <SelectItem value="freelance">Freelance</SelectItem>
            <SelectItem value="estagio">Estagio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Modelo de Trabalho */}
      <div className="space-y-2">
        <Label className="text-sm">Modelo de Trabalho</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Todos os modelos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="presencial">Presencial</SelectItem>
            <SelectItem value="hibrido">Hibrido</SelectItem>
            <SelectItem value="remoto">Remoto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Localizacao */}
      <div className="space-y-2">
        <Label className="text-sm">Localizacao</Label>
        <Input placeholder="Ex: Sao Paulo" disabled />
      </div>

      {/* Habilidades por categoria */}
      <div className="space-y-4">
        <Label className="text-sm">Habilidades</Label>
        <div className="space-y-3">
          {/* Engines */}
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Engines</span>
            <Select disabled>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecionar..." />
              </SelectTrigger>
            </Select>
          </div>
          {/* Linguagens */}
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Linguagens</span>
            <Select disabled>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecionar..." />
              </SelectTrigger>
            </Select>
          </div>
          {/* Ferramentas */}
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Ferramentas</span>
            <Select disabled>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecionar..." />
              </SelectTrigger>
            </Select>
          </div>
          {/* Soft Skills */}
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Soft Skills</span>
            <Select disabled>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecionar..." />
              </SelectTrigger>
            </Select>
          </div>
        </div>
      </div>

      {/* Nota visual */}
      <p className="text-xs text-muted-foreground italic pt-2 border-t border-border">
        Filtros em breve disponiveis
      </p>
    </Card>
  );
}
```

---

#### 6. Pagina Jobs.tsx

```typescript
import { Briefcase } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { JobCard } from "@/components/jobs/JobCard";
import { JobsSidebar } from "@/components/jobs/JobsSidebar";
import { JobsSkeletonGrid } from "@/components/jobs/JobCardSkeleton";
import { useJobs } from "@/hooks/useJobs";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function Jobs() {
  const { data: jobs, isLoading, error } = useJobs();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar vagas",
        description: "Nao foi possivel carregar as vagas. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-16">
        {/* Hero Section */}
        <div className="bg-card border-b border-border py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Vagas
            </h1>
            <p className="text-muted-foreground mt-2">
              Encontre sua proxima oportunidade na industria de games
            </p>
          </div>
        </div>

        {/* Content with Sidebar */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Filters (expandida por padrao no mobile) */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <JobsSidebar />
            </aside>

            {/* Grid of Jobs */}
            <main className="flex-1">
              {isLoading ? (
                <JobsSkeletonGrid />
              ) : !jobs || jobs.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-4">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Briefcase className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        Nenhuma vaga disponivel no momento
      </h3>
      <p className="text-muted-foreground max-w-md">
        Volte em breve! Novas oportunidades sao publicadas regularmente.
      </p>
    </div>
  );
}
```

---

#### 7. Atualizacao em App.tsx

Adicionar rota /jobs antes do catch-all:

```typescript
import Jobs from "./pages/Jobs";

// Na lista de Routes, antes do "*"
<Route path="/jobs" element={<Jobs />} />
```

---

#### 8. Atualizacao em Header.tsx

Alterar links de `/vagas` para `/jobs`:

```typescript
// Desktop nav (linha ~143)
<Link
  to="/jobs"
  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
>
  Vagas
</Link>

// Mobile nav (linha ~61)
<Link
  to="/jobs"
  onClick={() => setMobileMenuOpen(false)}
  className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
>
  Vagas
</Link>
```

---

### Responsividade

| Breakpoint | Layout |
|------------|--------|
| Mobile (<1024px) | Sidebar empilhada acima do grid, expandida por padrao |
| Desktop (>=1024px) | Sidebar fixa a esquerda (w-64, lg:sticky lg:top-24), grid a direita |

---

### Estados da Pagina

| Estado | Comportamento |
|--------|---------------|
| Loading | Grid de 6 skeleton cards |
| Vazio | Mensagem "Nenhuma vaga disponivel no momento. Volte em breve!" |
| Erro | Toast com mensagem amigavel + estado vazio |
| Sucesso | Grid de cards ordenados por destaque + data |

---

### Estilo dos Cards

| Tipo | Background | Border Hover | Shadow Hover |
|------|------------|--------------|--------------|
| Destaque | `bg-muted/50` | `border-primary/40` | Glow verde suave |
| Gratuita | `bg-card` | `border-border/80` | Nenhuma |

---

### Ordem de Implementacao

| Ordem | Arquivo | Complexidade |
|-------|---------|--------------|
| 1 | `src/lib/formatters.ts` | Baixa |
| 2 | `src/hooks/useJobs.ts` | Media |
| 3 | `src/components/jobs/JobCardSkeleton.tsx` | Baixa |
| 4 | `src/components/jobs/JobCard.tsx` | Media |
| 5 | `src/components/jobs/JobsSidebar.tsx` | Baixa |
| 6 | `src/pages/Jobs.tsx` | Media |
| 7 | `src/App.tsx` | Baixa |
| 8 | `src/components/layout/Header.tsx` | Baixa |

---

### Checklist de Validacoes

| Item | Implementacao |
|------|---------------|
| Query unica com JOIN | Supabase select com relacionamentos |
| tipo_funcao incluido na query | Campo adicionado ao select |
| Filtro vagas ativas | `.eq("ativa", true)` |
| Filtro nao expiradas | `.gt("expira_em", new Date().toISOString())` |
| Ordenacao destaque primeiro | `.order("tipo_publicacao", { ascending: false })` |
| Ordenacao por data | `.order("criada_em", { ascending: false })` |
| Logo 48x48 | Avatar com `w-12 h-12` |
| 3 badges (contrato, nivel, remoto) | Flex row com 3 Badge components |
| Limite 5 habilidades | `.slice(0, 5)` + badge "+X" |
| Todas habilidades visiveis | NAO filtrar apenas obrigatorias, mostrar todas |
| Card inteiro clicavel | Wrapper `<a>` com `href` |
| Nova aba | `target="_blank"` |
| Destaque visual | Background diferente + glow verde no hover |
| Filtros apenas visuais | Selects com `disabled` |
| Sidebar sticky apenas desktop | `lg:sticky lg:top-24` |
| Sidebar expandida no mobile | Sem collapse |
| Loading skeletons | Grid de 6 JobCardSkeleton |
| Estado vazio | Mensagem centralizada |
| Sem salario | NAO mostrar salario em nenhum lugar |
| Sem "publicada ha X dias" | NAO mostrar data relativa |
| Sem paginacao | Lista completa |
| Sem busca por texto | NAO implementar nesta fase |

