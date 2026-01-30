

## Plano Atualizado: Dropdown Funcional no Footer da Sidebar

### Visao Geral

Transformar o footer da sidebar em um botao clicavel que abre um dropdown menu com opcoes de navegacao e acoes. O conteudo do dropdown muda dependendo se o usuario tem ou nao um estudio criado.

---

### Correcoes Incorporadas

| Correcao | Detalhes |
|----------|----------|
| Hook useCurrentUser | Criar hook reutilizavel para buscar dados do usuario da tabela users |
| getInitials existente | Manter a funcao getInitials ja existente no componente (nao usar inline) |
| Classes disabled | Remover classes redundantes dos items disabled (shadcn ja aplica estilos) |

---

### Arquivos a Criar/Modificar

| Acao | Arquivo | Descricao |
|------|---------|-----------|
| Criar | `src/hooks/useCurrentUser.ts` | Hook reutilizavel para buscar dados do usuario logado |
| Criar | `src/hooks/useHasStudio.ts` | Hook para verificar se usuario tem estudio |
| Modificar | `src/components/dashboard/DashboardSidebar.tsx` | Adicionar dropdown no footer e item condicional "Meu Estudio" |

---

### Secao Tecnica

#### 1. Hook useCurrentUser.ts

Hook reutilizavel para buscar dados do usuario da tabela users:

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CurrentUser {
  id: string;
  nome_completo: string;
  avatar_url: string | null;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async (): Promise<CurrentUser | null> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from("users")
        .select("nome_completo, avatar_url")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching current user:", error);
        return null;
      }

      return {
        id: session.user.id,
        nome_completo: data.nome_completo,
        avatar_url: data.avatar_url,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
```

---

#### 2. Hook useHasStudio.ts

Hook que verifica se o usuario logado criou um estudio:

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useHasStudio() {
  return useQuery({
    queryKey: ["has-studio"],
    queryFn: async (): Promise<boolean> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const { data, error } = await supabase
        .from("estudios")
        .select("id")
        .eq("criado_por", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking studio:", error);
        return false;
      }

      return !!data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
```

---

#### 3. Modificacoes no DashboardSidebar.tsx

**Novos imports:**

```typescript
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  User,
  Building2,
  ChevronDown,
  Settings,
  CreditCard,
  Mail,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useHasStudio } from "@/hooks/useHasStudio";
```

**Remover useEffect e useState:**

O componente atual usa `useState` e `useEffect` para buscar o usuario. Substituir por:

```typescript
// REMOVER:
// const [user, setUser] = useState<UserData | null>(null);
// useEffect(() => { ... }, []);

// ADICIONAR:
const { data: user } = useCurrentUser();
const { data: hasStudio, isLoading: isLoadingStudio } = useHasStudio();
```

**Items de navegacao dinamicos:**

```typescript
// Items base da sidebar
const baseNavItems = [
  { title: "Visao Geral", url: "/dashboard", icon: LayoutDashboard },
  { title: "Vagas", url: "/dashboard/jobs", icon: Briefcase },
  { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
];

// Items com "Meu Estudio" condicional
const navItems = hasStudio
  ? [...baseNavItems, { title: "Meu Estudio", url: "/studio/dashboard", icon: Building2 }]
  : baseNavItems;
```

**Funcao de logout:**

```typescript
const navigate = useNavigate();
const { toast } = useToast();

const handleSignOut = async () => {
  await supabase.auth.signOut();
  toast({
    title: "Ate logo!",
    description: "Voce saiu com sucesso.",
  });
  navigate("/login");
};
```

**Manter funcao getInitials existente:**

```typescript
// JA EXISTE NO COMPONENTE - MANTER:
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};
```

**Footer com dropdown:**

```tsx
<SidebarFooter className="p-4 border-t border-sidebar-border">
  {user && (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar_url || undefined} alt={user.nome_completo} />
            <AvatarFallback className="bg-muted text-muted-foreground text-[15px]">
              {getInitials(user.nome_completo)}
            </AvatarFallback>
          </Avatar>
          <span className="text-[15px] font-medium text-sidebar-foreground truncate flex-1 text-left">
            {user.nome_completo}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="top" className="w-56">
        {/* Criar Estudio - so aparece se NAO tem estudio */}
        {!isLoadingStudio && !hasStudio && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/studio/new" className="cursor-pointer">
                <Building2 className="mr-2 h-4 w-4" />
                Criar Estudio
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Configuracoes - placeholder disabled (SEM classes extras) */}
        <DropdownMenuItem disabled>
          <Settings className="mr-2 h-4 w-4" />
          Configuracoes
        </DropdownMenuItem>

        {/* Faturamento - placeholder disabled (SEM classes extras) */}
        <DropdownMenuItem disabled>
          <CreditCard className="mr-2 h-4 w-4" />
          Faturamento
        </DropdownMenuItem>

        {/* Suporte - mailto */}
        <DropdownMenuItem asChild>
          <a href="mailto:lucas.pimenta@matchmaking.games" className="cursor-pointer">
            <Mail className="mr-2 h-4 w-4" />
            Suporte
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sair */}
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )}
</SidebarFooter>
```

---

### Estrutura Visual

**Footer da Sidebar (botao do dropdown):**

```text
+-------------------------------------------+
| [Avatar] Lucas Pimenta              [v]   |  <- botao clicavel
+-------------------------------------------+
```

**Dropdown - Usuario SEM estudio:**

```text
+-----------------------------+
| Building2 Criar Estudio     |
+-----------------------------+
| Settings Configuracoes      | (disabled)
| CreditCard Faturamento      | (disabled)
| Mail Suporte                |
+-----------------------------+
| LogOut Sair                 |
+-----------------------------+
```

**Dropdown - Usuario COM estudio:**

```text
+-----------------------------+
| Settings Configuracoes      | (disabled)
| CreditCard Faturamento      | (disabled)
| Mail Suporte                |
+-----------------------------+
| LogOut Sair                 |
+-----------------------------+
```

**Sidebar - Usuario COM estudio:**

```text
+-----------------------------+
| LayoutDashboard Visao Geral |
| Briefcase Vagas             |
| User Meu Perfil             |
| Building2 Meu Estudio       | <- aparece apenas com estudio
+-----------------------------+
```

---

### Ordem de Implementacao

| Ordem | Arquivo | Complexidade |
|-------|---------|--------------|
| 1 | `src/hooks/useCurrentUser.ts` | Baixa |
| 2 | `src/hooks/useHasStudio.ts` | Baixa |
| 3 | `src/components/dashboard/DashboardSidebar.tsx` | Media |

---

### Checklist de Validacoes

| Item | Implementacao |
|------|---------------|
| Usuario sem estudio ve "Criar Estudio" | Condicional `!hasStudio` |
| Usuario sem estudio NAO ve "Meu Estudio" | Array navItems dinamico |
| Usuario com estudio NAO ve "Criar Estudio" | Condicional `!hasStudio` |
| Usuario com estudio ve "Meu Estudio" | Array navItems dinamico |
| Botao "Sair" faz logout | `supabase.auth.signOut()` + navigate |
| Toast de confirmacao ao sair | `toast({ title: "Ate logo!" })` |
| Link "Suporte" abre email | `<a href="mailto:...">` |
| Configuracoes desabilitado | `disabled` prop (sem classes extras) |
| Faturamento desabilitado | `disabled` prop (sem classes extras) |
| Dropdown abre acima do footer | `side="top"` |
| Seta ChevronDown no botao | Icone no trigger |
| Hover state no botao | `hover:bg-sidebar-accent` |
| Dados usuario via hook | `useCurrentUser()` com react-query |
| getInitials mantida | Funcao existente preservada |

