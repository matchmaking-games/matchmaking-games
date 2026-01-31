
## Plano Atualizado: Dashboard do Estudio com Sidebar e Navegacao

### Resumo

Criar um dashboard completo para estudios em `/studio/dashboard` com:
- Hook de membership para buscar dados do estudio e role do usuario
- Layout wrapper similar ao dashboard de profissionais
- Sidebar de navegacao com itens especificos para estudios
- Pagina inicial com boas-vindas simples
- Protecao de rota com verificacao de membership ativo

---

### Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/hooks/useStudioMembership.ts` | Hook para buscar membership + dados do estudio |
| `src/components/studio/StudioSidebar.tsx` | Sidebar de navegacao do estudio |
| `src/components/studio/StudioDashboardLayout.tsx` | Layout wrapper com sidebar |
| `src/pages/studio/Dashboard.tsx` | Pagina principal do dashboard |

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/App.tsx` | Adicionar rota `/studio/dashboard` com ProtectedRoute |

---

### Secao Tecnica

#### 1. Hook useStudioMembership

Busca o membership do usuario e dados do estudio via join com sintaxe correta:

```typescript
// src/hooks/useStudioMembership.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StudioMembership {
  estudio: {
    id: string;
    nome: string;
    slug: string;
    logo_url: string | null;
  };
  role: "super_admin" | "member"; // CORRIGIDO: Apenas essas duas roles existem
  ativo: boolean;
}

export function useStudioMembership() {
  return useQuery({
    queryKey: ["studio-membership"],
    queryFn: async (): Promise<StudioMembership | null> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      // CORRIGIDO: Sintaxe com ! para join explicito via FK
      const { data, error } = await supabase
        .from("estudio_membros")
        .select(`
          role,
          ativo,
          estudios!estudio_id (
            id,
            nome,
            slug,
            logo_url
          )
        `)
        .eq("user_id", session.user.id)
        .eq("ativo", true)
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      return {
        estudio: data.estudios as StudioMembership["estudio"],
        role: data.role as StudioMembership["role"],
        ativo: data.ativo ?? true,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}
```

---

#### 2. StudioSidebar

Inspirado no `DashboardSidebar.tsx`, adaptado para contexto de estudio com dropdown completo:

**Estrutura de navegacao:**
```typescript
const mainNavItems = [
  { title: "Dashboard", url: "/studio/dashboard", icon: LayoutDashboard },
  { title: "Vagas", url: "/studio/jobs", icon: Briefcase },
];

const settingsNavItems = [
  { title: "Perfil do Estúdio", url: "/studio/profile", icon: Building2 },
  { title: "Equipe", url: "/studio/team", icon: UserPlus },
];
```

**Footer da Sidebar - Dropdown Completo (CORRIGIDO):**

Baseado no print e no dropdown do dashboard de profissionais:

```typescript
<SidebarFooter className="p-4 border-t border-sidebar-border">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer">
        <Avatar className="h-10 w-10">
          <AvatarImage src={membership.estudio.logo_url || undefined} alt={membership.estudio.nome} />
          <AvatarFallback className="bg-muted text-muted-foreground text-[15px]">
            {getInitials(membership.estudio.nome)}
          </AvatarFallback>
        </Avatar>
        <span className="text-[15px] font-medium text-sidebar-foreground truncate flex-1 text-left">
          {membership.estudio.nome}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" side="top" className="w-56">
      {/* Opcoes do menu como no dashboard de profissionais */}
      <DropdownMenuItem disabled>
        <Settings className="mr-2 h-4 w-4" />
        Configuracoes
      </DropdownMenuItem>

      <DropdownMenuItem disabled>
        <CreditCard className="mr-2 h-4 w-4" />
        Faturas
      </DropdownMenuItem>

      <DropdownMenuItem asChild>
        <a href="mailto:lucas.pimenta@matchmaking.games" className="cursor-pointer">
          <Mail className="mr-2 h-4 w-4" />
          Suporte
        </a>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      {/* NOVO: Ver pagina publica do estudio */}
      <DropdownMenuItem asChild>
        <a 
          href={`/studio/${membership.estudio.slug}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="cursor-pointer"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Ver pagina publica
        </a>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
        <LogOut className="mr-2 h-4 w-4" />
        Sair
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</SidebarFooter>
```

**Icones necessarios:**
```typescript
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  UserPlus,
  ChevronDown,
  Settings,
  CreditCard,
  Mail,
  ExternalLink,
  LogOut,
} from "lucide-react";
```

---

#### 3. StudioDashboardLayout

Estrutura identica ao `DashboardLayout.tsx`:

```typescript
// src/components/studio/StudioDashboardLayout.tsx
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Menu, Loader2 } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { StudioSidebar } from "./StudioSidebar";
import { useStudioMembership } from "@/hooks/useStudioMembership";

interface StudioDashboardLayoutProps {
  children: ReactNode;
}

export function StudioDashboardLayout({ children }: StudioDashboardLayoutProps) {
  const navigate = useNavigate();
  const { data: membership, isLoading, error } = useStudioMembership();

  // Redirecionar se nao for membro de nenhum estudio
  useEffect(() => {
    if (!isLoading && !membership) {
      navigate("/studio/new");
    }
  }, [isLoading, membership, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se nao tem membership, nao renderiza (ja foi redirecionado)
  if (!membership) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0" 
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 65%)",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 65%)"
          }} 
        />

        <div className="relative z-10 flex w-full min-w-0">
          <StudioSidebar membership={membership} />

          <div className="flex-1 min-w-0 flex flex-col">
            {/* Mobile header */}
            <header className="md:hidden h-14 flex items-center border-b border-border px-4 bg-secondary">
              <SidebarTrigger className="text-foreground">
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
            </header>

            <main className="flex-1 w-full min-w-0 px-4 py-6 sm:p-6 overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
```

---

#### 4. Pagina Dashboard

Conteudo simples de boas-vindas:

```typescript
// src/pages/studio/Dashboard.tsx
import { StudioDashboardLayout } from "@/components/studio/StudioDashboardLayout";
import { useStudioMembership } from "@/hooks/useStudioMembership";

export default function StudioDashboard() {
  const { data: membership } = useStudioMembership();

  return (
    <StudioDashboardLayout>
      <div className="max-w-4xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Dashboard
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Bem-vindo ao painel do {membership?.estudio.nome}
        </p>
        <p className="text-muted-foreground">
          Gerencie suas vagas, equipe e perfil do estudio atraves do menu lateral.
        </p>
      </div>
    </StudioDashboardLayout>
  );
}
```

---

#### 5. Atualizar App.tsx

Adicionar nova rota:

```typescript
import StudioDashboard from "./pages/studio/Dashboard";

// Dentro de <Routes>:
<Route
  path="/studio/dashboard"
  element={
    <ProtectedRoute>
      <StudioDashboard />
    </ProtectedRoute>
  }
/>
```

---

### Verificacoes Confirmadas

| Item | Status |
|------|--------|
| RLS permite leitura de estudio_membros | Confirmado - policy "Membros de estudios sao publicos" permite SELECT |
| RLS permite join com estudios | Confirmado - policy "Estudios sao publicos" permite SELECT |
| Query testada no banco | Confirmado - retornou dados corretamente |
| Enum user_role | Confirmado - apenas `super_admin` e `member` |

---

### Fluxo de Verificacao

```text
Usuario acessa /studio/dashboard
        |
        v
ProtectedRoute verifica autenticacao + perfil
        |
        v
StudioDashboardLayout verifica membership via useStudioMembership
        |
    [Carregando?] --> Mostra Loader2
        |
    [Sem membership?] --> Redireciona para /studio/new
        |
    [Com membership] --> Renderiza sidebar + conteudo
```

---

### Estados Especiais

| Estado | Comportamento |
|--------|---------------|
| Carregando | Loader centralizado na tela |
| Erro na query | Toast de erro + fallback gracioso |
| Sem membership | Redireciona para /studio/new |
| Multiplos estudios | Usa o primeiro encontrado (v2 tera seletor) |

---

### O que NAO sera implementado

- Paginas de vagas (/studio/jobs)
- Pagina de perfil do estudio (/studio/profile)
- Pagina de equipe (/studio/team)
- Cards de metricas ou graficos
- Seletor de multiplos estudios
