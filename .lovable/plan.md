

# Pagina de Faturas do Estudio

## Resumo

Criar a pagina de faturas em `/studio/manage/billing` com hook dedicado, registrar a rota no App.tsx, e habilitar o item no menu lateral do estudio.

## Arquivos a criar

### 1. `src/hooks/usePagamentos.ts`

Hook que busca pagamentos do estudio atual. Segue o padrao do `useStudioMembers`:
- Recebe `estudioId: string | null` como parametro
- Usa `useState` + `useCallback` + `useEffect` (mesmo padrao dos hooks existentes)
- Query: `supabase.from("pagamentos").select("*, vaga:vagas!vaga_id(titulo)").eq("estudio_id", estudioId).order("criado_em", { ascending: false })`
- O JOIN com vagas usa `!vaga_id` para trazer o titulo da vaga associada
- Retorna `{ pagamentos, isLoading, error, refetch }`
- Interface `Pagamento` com todos os campos relevantes: `id`, `amount`, `currency`, `status`, `criado_em`, `stripe_session_id`, `invoice_url`, `invoice_pdf_url`, e `vaga: { titulo: string } | null`

### 2. `src/pages/studio/Billing.tsx`

Pagina que usa `StudioDashboardLayout` (mesmo wrapper de Team.tsx, Dashboard.tsx, etc):

**Estrutura:**
- Importa `StudioDashboardLayout`, `useActiveStudio`, `usePagamentos`, componentes shadcn
- Header: titulo "Faturas" com icone `CreditCard`, subtitulo "Historico de pagamentos do estudio"
- Lista de pagamentos em cards (mesmo estilo visual do projeto)

**Cada card de pagamento exibe:**
- Titulo da vaga (ou "Vaga removida" em `text-muted-foreground` se `vaga` for null)
- Data formatada com `format(new Date(criado_em), "dd/MM/yyyy", { locale: ptBR })`
- Valor: `(amount / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })`
- Badge de status: "Pago" (verde) para `completed`, "Aguardando" (amarelo) para `pending`, "--" (cinza) para outros
- Botoes de acao: "Ver fatura" se `invoice_url` existir, "Baixar PDF" se `invoice_pdf_url` existir, texto "Fatura nao disponivel para este pagamento." se ambos forem null

**Estados:**
- Loading: 3 skeleton cards (Skeleton com altura e largura consistentes)
- Vazio: mensagem centralizada "Nenhuma fatura encontrada. Suas faturas aparecerão aqui apos a publicacao de vagas em destaque."
- Erro: mensagem com botao "Tentar novamente" que chama `refetch()`

**Layout responsivo:**
- Desktop: cards em lista vertical com layout horizontal (info a esquerda, acoes a direita)
- Mobile: cards empilhados com info e acoes em coluna

## Arquivos a modificar

### 3. `src/components/studio/StudioSidebar.tsx`

Adicionar item "Faturas" ao array `navItems` (linha 43-48):

```typescript
const navItems = [
  { title: "Dashboard", url: "/studio/manage/dashboard", icon: LayoutDashboard },
  { title: "Minhas vagas", url: "/studio/manage/jobs", icon: Briefcase },
  { title: "Perfil do estudio", url: "/studio/manage/profile", icon: Building2 },
  { title: "Minha equipe", url: "/studio/manage/team", icon: UserPlus },
  { title: "Faturas", url: "/studio/manage/billing", icon: CreditCard },
];
```

Tambem remover o item "Faturas" desabilitado do dropdown do footer (linhas 191-194), ja que agora esta no menu principal.

### 4. `src/App.tsx`

Adicionar import do componente `Billing` e registrar rota protegida:

```typescript
import Billing from "./pages/studio/Billing";

// Dentro das Routes, junto com as outras rotas /studio/manage/*:
<Route
  path="/studio/manage/billing"
  element={
    <ProtectedRoute>
      <Billing />
    </ProtectedRoute>
  }
/>
```

## O que NAO muda

- Nenhuma outra pagina existente
- Nenhuma Edge Function
- Nenhuma tabela ou migracao SQL
- Layout StudioDashboardLayout (apenas usado, nao modificado)
- Logica de autenticacao
- Nenhum outro item do menu alem de "Faturas"
