

# Plano Final: Pagina de Lista de Vagas do Estudio

## Objetivo
Criar a pagina `/studio/jobs` que lista todas as vagas publicadas pelo estudio, com filtros, acoes de gerenciamento e visual profissional.

Este plano incorpora as 5 correcoes adicionais solicitadas.

---

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/hooks/useStudioJobs.ts` | Hook para gerenciar vagas do estudio |
| `src/pages/studio/Jobs.tsx` | Pagina principal de listagem |
| `src/components/studio/JobsTable.tsx` | Tabela de vagas (desktop) |
| `src/components/studio/JobsMobileCard.tsx` | Cards de vagas (mobile) |
| `src/components/studio/JobsDeleteDialog.tsx` | Modal de confirmacao de exclusao |

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/App.tsx` | Adicionar rota `/studio/jobs` |

---

## Secao Tecnica

### 1. Hook useStudioJobs.ts

Seguindo o padrao do `useEducations.ts`, mas com duas correcoes criticas:

**Correcao 1: Dois useEffect separados**
- Efeito 1: Verificar permissao e obter estudioId
- Efeito 2: Buscar vagas SOMENTE se autorizado e tiver estudioId

**Correcao 2: try/catch/finally em toda verificacao**
- Garantir que isLoading nunca fique travado

**Correcao 4: Tratar estudioId null explicitamente**
- Mensagem de erro clara quando nao associado a estudio

```typescript
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type NivelVaga = Database["public"]["Enums"]["nivel_vaga"];
type TipoContrato = Database["public"]["Enums"]["tipo_contrato"];
type TipoPublicacaoVaga = Database["public"]["Enums"]["tipo_publicacao_vaga"];

export interface StudioVaga {
  id: string;
  titulo: string;
  slug: string;
  nivel: NivelVaga;
  tipo_contrato: TipoContrato;
  ativa: boolean | null;
  tipo_publicacao: TipoPublicacaoVaga | null;
  criada_em: string | null;
  expira_em: string | null;
  estudio_id: string;
}

interface UseStudioJobsReturn {
  vagas: StudioVaga[];
  isLoading: boolean;
  error: string | null;
  isAuthorized: boolean;
  estudioId: string | null;
  refetch: () => Promise<void>;
  toggleAtiva: (id: string, currentValue: boolean) => Promise<void>;
  deleteVaga: (id: string) => Promise<void>;
}

export function useStudioJobs(): UseStudioJobsReturn {
  const [vagas, setVagas] = useState<StudioVaga[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [estudioId, setEstudioId] = useState<string | null>(null);

  // EFEITO 1: Verificar permissao (Correcao 1)
  useEffect(() => {
    const checkMembership = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsAuthorized(false);
          return;
        }

        const { data: membership, error: membershipError } = await supabase
          .from("estudio_membros")
          .select("role, estudio_id")
          .eq("user_id", session.user.id)
          .eq("ativo", true)
          .maybeSingle();

        if (membershipError) {
          console.error("Error checking membership:", membershipError);
          setError("Erro ao verificar permissoes.");
          setIsAuthorized(false);
          return;
        }

        if (!membership) {
          setIsAuthorized(false);
          setError("Voce nao esta associado a nenhum estudio.");
          return;
        }

        if (membership.role !== "super_admin") {
          setIsAuthorized(false);
          setError("Apenas administradores podem gerenciar vagas.");
          return;
        }

        setIsAuthorized(true);
        setEstudioId(membership.estudio_id);
      } catch (err) {
        console.error("Error checking membership:", err);
        setError("Erro ao verificar permissoes.");
        setIsAuthorized(false);
      } finally {
        // Correcao 2: Garantir que loading para aqui se nao autorizado
        // Se autorizado, loading continua ate fetchVagas terminar
      }
    };

    checkMembership();
  }, []);

  // EFEITO 2: Buscar vagas SOMENTE se autorizado (Correcao 1)
  const fetchVagas = useCallback(async () => {
    // Correcao 4: Tratar estudioId null explicitamente
    if (!estudioId) {
      setError("Voce nao esta associado a nenhum estudio.");
      setVagas([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Query com estudio_id incluido
      const { data, error: fetchError } = await supabase
        .from("vagas")
        .select("id, titulo, slug, nivel, tipo_contrato, ativa, tipo_publicacao, criada_em, expira_em, estudio_id")
        .order("ativa", { ascending: false })
        .order("criada_em", { ascending: false });

      if (fetchError) throw fetchError;

      setVagas(data || []);
    } catch (err) {
      console.error("Error fetching vagas:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar vagas");
    } finally {
      setIsLoading(false); // Correcao 2: Sempre reseta loading
    }
  }, [estudioId]);

  useEffect(() => {
    if (isAuthorized && estudioId) {
      fetchVagas();
    } else if (!isAuthorized && estudioId === null) {
      // Se verificacao de membership terminou mas nao autorizado
      setIsLoading(false);
    }
  }, [isAuthorized, estudioId, fetchVagas]);

  const toggleAtiva = useCallback(async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("vagas")
      .update({ ativa: !currentValue })
      .eq("id", id);

    if (error) throw error;
  }, []);

  const deleteVaga = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("vagas")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }, []);

  return {
    vagas,
    isLoading,
    error,
    isAuthorized,
    estudioId,
    refetch: fetchVagas,
    toggleAtiva,
    deleteVaga,
  };
}
```

---

### 2. Componente JobsTable.tsx

Inclui as correcoes 3 e 5:

**Correcao 3: Badge destaque com cor amarela**
```typescript
{vaga.tipo_publicacao === "destaque" && (
  <Badge className="ml-2 bg-amber-500/10 text-amber-600 border-amber-500/30">
    <Sparkles className="h-3 w-3 mr-1" />
    DESTAQUE
  </Badge>
)}
```

**Correcao 5: Warning para vagas inconsistentes**
```typescript
function renderExpiraEm(vaga: StudioVaga) {
  const expiraEm = new Date(vaga.expira_em!);
  const formattedDate = format(expiraEm, "dd/MM/yyyy", { locale: ptBR });
  
  const diasRestantes = differenceInDays(expiraEm, new Date());
  const isExpired = isPast(expiraEm);
  const isAtiva = vaga.ativa;

  // Correcao 5: Warning se dados inconsistentes
  if (diasRestantes < 0 && !isExpired) {
    console.warn(`Vaga ${vaga.id} deveria estar expirada mas status nao foi atualizado`);
  }

  // Mostrar contador SOMENTE se todas condicoes forem verdadeiras
  const showCounter = isAtiva && !isExpired && diasRestantes < 7 && diasRestantes >= 0;

  return (
    <div className="flex flex-col">
      <span>{formattedDate}</span>
      {showCounter && (
        <span className="text-xs text-yellow-600 dark:text-yellow-400">
          {diasRestantes === 0 ? "Expira hoje" : `${diasRestantes} dias restantes`}
        </span>
      )}
    </div>
  );
}
```

**Badges de Nivel (usando classes Tailwind padrao):**
```typescript
const nivelConfig: Record<string, { label: string; className: string }> = {
  iniciante: { label: "Iniciante", className: "bg-muted text-muted-foreground" },
  junior: { label: "Junior", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  pleno: { label: "Pleno", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  senior: { label: "Senior", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
  lead: { label: "Lead", className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
};
```

**Badges de Status:**
```typescript
const statusConfig: Record<string, { label: string; className: string }> = {
  ativa: { label: "Ativa", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  inativa: { label: "Inativa", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
  expirada: { label: "Expirada", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
};
```

**Toggle dinamico no menu:**
```typescript
<DropdownMenuItem 
  onClick={() => handleToggleAtiva(vaga)}
  disabled={isToggling}
>
  {vaga.ativa ? "Desativar vaga" : "Ativar vaga"}
</DropdownMenuItem>
```

---

### 3. Estrutura Visual

```text
+----------------------------------------------------------+
| [StudioDashboardLayout com Sidebar]                       |
+----------------------------------------------------------+
| [Area de Conteudo]                                        |
|                                                           |
|   Minhas Vagas                    [+ Nova Vaga]           |
|                                                           |
|   [Todas] [Ativas] [Inativas] [Expiradas] [Destaque]      |
|                                                           |
|   +-----------------------------------------------------+ |
|   | Titulo        | Nivel  | Contrato | Status | ... |   |
|   +-----------------------------------------------------+ |
|   | Unity Dev DESTAQUE | Senior | CLT | Ativa  | ... |   |
|   | Game Designer     | Pleno  | PJ  | Inativa | ... |   |
|   +-----------------------------------------------------+ |
|                                                           |
+----------------------------------------------------------+
```

---

### 4. Pagina Jobs.tsx

**Verificacao de permissao na UI:**
```typescript
if (!isLoading && !isAuthorized) {
  return (
    <StudioDashboardLayout>
      <div className="flex flex-col items-center justify-center py-16">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acesso negado</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => navigate("/dashboard")}>
          Voltar ao Dashboard
        </Button>
      </div>
    </StudioDashboardLayout>
  );
}
```

**Filtros (Tabs) com filtragem client-side:**
```typescript
const [activeTab, setActiveTab] = useState<"todas" | "ativas" | "inativas" | "expiradas" | "destaque">("todas");

const filteredVagas = useMemo(() => {
  const now = new Date();
  
  switch (activeTab) {
    case "ativas":
      return vagas.filter(v => v.ativa && new Date(v.expira_em!) > now);
    case "inativas":
      return vagas.filter(v => !v.ativa);
    case "expiradas":
      return vagas.filter(v => new Date(v.expira_em!) < now);
    case "destaque":
      return vagas.filter(v => v.tipo_publicacao === "destaque");
    default:
      return vagas;
  }
}, [vagas, activeTab]);
```

**Responsividade com hook existente:**
```typescript
import { useIsMobile } from "@/hooks/use-mobile";

const isMobile = useIsMobile();

{isMobile ? (
  <JobsMobileCards vagas={filteredVagas} ... />
) : (
  <JobsTable vagas={filteredVagas} ... />
)}
```

---

### 5. JobsDeleteDialog.tsx

**Com loading state e toast de feedback:**
```typescript
interface JobsDeleteDialogProps {
  vaga: StudioVaga | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function JobsDeleteDialog({ vaga, open, onOpenChange, onConfirm }: JobsDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    if (!vaga) return;

    try {
      setIsDeleting(true);
      await onConfirm();

      toast({
        title: "Vaga excluida com sucesso",
        description: `A vaga "${vaga.titulo}" foi removida.`,
      });

      onOpenChange(false);
    } catch (err) {
      console.error("Error deleting vaga:", err);
      toast({
        title: "Erro ao excluir vaga",
        description: "Nao foi possivel excluir a vaga. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir vaga</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a vaga "{vaga?.titulo}"?
            Esta acao nao pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

### 6. Toggle com feedback

```typescript
const handleToggleAtiva = async (vaga: StudioVaga) => {
  try {
    setIsToggling(true);
    
    const newValue = !vaga.ativa;
    await toggleAtiva(vaga.id, vaga.ativa ?? false);
    
    toast({
      title: newValue ? "Vaga ativada" : "Vaga desativada",
      description: `A vaga "${vaga.titulo}" foi ${newValue ? "ativada" : "desativada"}.`,
    });
    
    await refetch();
  } catch (err) {
    console.error("Error toggling vaga:", err);
    toast({
      title: "Erro ao atualizar vaga",
      description: "Nao foi possivel alterar o status. Tente novamente.",
      variant: "destructive",
    });
  } finally {
    setIsToggling(false);
  }
};
```

---

### 7. Empty State

```typescript
{filteredVagas.length === 0 && !isLoading && (
  <div className="flex flex-col items-center justify-center py-16">
    <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
    <h3 className="text-xl font-semibold mb-2">
      Nenhuma vaga publicada ainda
    </h3>
    <p className="text-muted-foreground mb-6 text-center">
      Comece publicando sua primeira vaga para atrair talentos
    </p>
    <Button onClick={() => navigate("/studio/jobs/new")}>
      <Plus className="h-4 w-4 mr-2" />
      Publicar Vaga
    </Button>
  </div>
)}
```

---

### 8. Atualizacao de Rota em App.tsx

```typescript
import StudioJobs from "./pages/studio/Jobs";

// Na secao de rotas:
<Route
  path="/studio/jobs"
  element={
    <ProtectedRoute>
      <StudioJobs />
    </ProtectedRoute>
  }
/>
```

---

### 9. Labels de Mapeamento

```typescript
const tipoContratoLabels: Record<string, string> = {
  clt: "CLT",
  pj: "PJ",
  freelance: "Freelance",
  estagio: "Estagio",
};
```

---

## Resumo das Correcoes Aplicadas

| # | Problema | Solucao |
|---|----------|---------|
| 1 | useEffect unico para membership e fetch | Dois useEffect separados |
| 2 | Loading pode travar | try/catch/finally em toda verificacao |
| 3 | Badge destaque pouco visivel | Cor amarela/dourada (amber) |
| 4 | estudioId null sem feedback | Mensagem de erro explicita |
| 5 | Vagas inconsistentes sem aviso | console.warn quando diasRestantes < 0 |

## Fluxo de Implementacao

1. Criar hook `useStudioJobs.ts` com dois useEffect separados
2. Criar componente `JobsDeleteDialog.tsx` com loading e toast
3. Criar componente `JobsTable.tsx` com badge amarelo e warning
4. Criar componente `JobsMobileCard.tsx` para responsividade
5. Criar pagina `Jobs.tsx` integrando tudo
6. Adicionar rota em `App.tsx`
7. Testar fluxos: permissoes, filtros, toggle, exclusao, empty state

