
# Plano: Melhorias UX no Formulário de Criação de Vagas

## Resumo

Corrigir 5 problemas de UX no formulário de criação/edição de vagas (/studio/jobs/new e /studio/jobs/:id/edit):
1. Adicionar indicador visual de campos obrigatórios
2. Corrigir estilo dos cards de tipo de publicação
3. Padronizar estilos dos botões
4. Implementar loading independente por botão
5. Adicionar proteção contra perda de dados

---

## Arquivo a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/studio/JobForm.tsx` | EDITAR |

---

## Problema 1: Campos obrigatórios sem indicação visual

### Análise Atual
- "Meio de contato" (linha 556): Label sem asterisco
- "Habilidades obrigatórias" (linha 679): Usa componente JobSkillsSelector, label sem asterisco
- O schema Zod (linha 38) marca `contato_candidatura` como optional, mas deveria ser obrigatório
- O schema (linha 44) marca `habilidades_obrigatorias` como array vazio por default, sem validação de min(1)

### Mudanças Necessárias

**1. Atualizar schema Zod (linhas 38 e 44):**
```typescript
// ANTES
contato_candidatura: z.string().max(500, "Máximo 500 caracteres").optional().nullable(),
habilidades_obrigatorias: z.array(z.string()).default([]),

// DEPOIS
contato_candidatura: z.string().min(1, "Campo obrigatório").max(500, "Máximo 500 caracteres"),
habilidades_obrigatorias: z.array(z.string()).min(1, "Selecione pelo menos uma habilidade obrigatória"),
```

**2. Atualizar label do campo "Meio de contato" (linha 556):**
```tsx
// ANTES
<FormLabel>Como candidatos devem entrar em contato?</FormLabel>

// DEPOIS
<FormLabel>
  Meio de contato <span className="text-destructive">*</span>
</FormLabel>
```

**3. Atualizar JobSkillsSelector (linha 678-684):**

O componente JobSkillsSelector já aceita uma prop `label`. Precisamos atualizar para incluir o asterisco:

```tsx
// ANTES
<JobSkillsSelector
  label="Habilidades obrigatórias"
  ...
/>

// DEPOIS
<JobSkillsSelector
  label={<>Habilidades obrigatórias <span className="text-destructive">*</span></>}
  ...
/>
```

**4. Adicionar FormMessage para exibir erro de validação das habilidades:**

Envolver o JobSkillsSelector em um FormField para exibir erros de validação, ou adicionar lógica manual para mostrar erro quando `habilidadesObrigatorias.length === 0` e form foi submetido.

---

## Problema 2: Card "Destaque" parece pré-selecionado

### Análise Atual (linhas 721-741)
O card "Destaque" tem estilos fixos que o fazem parecer selecionado:
```tsx
// Card Gratuita - neutro
<div className="... border-border hover:bg-muted/50 ...">

// Card Destaque - SEMPRE verde (errado!)
<div className="... border-primary/30 bg-primary/5 hover:bg-primary/10 ...">
```

### Mudanças Necessárias

**Aplicar estilo verde apenas quando selecionado:**
```tsx
// Card Gratuita
<div 
  className={cn(
    "flex items-start space-x-3 p-3 rounded-md border transition-colors cursor-pointer",
    field.value === "gratuita" 
      ? "border-primary bg-primary/5" 
      : "border-border hover:bg-muted/50"
  )}
  onClick={() => field.onChange("gratuita")}
>
  ...
</div>

// Card Destaque
<div 
  className={cn(
    "flex items-start space-x-3 p-3 rounded-md border transition-colors cursor-pointer",
    field.value === "destaque" 
      ? "border-primary bg-primary/5" 
      : "border-border hover:bg-muted/50"
  )}
  onClick={() => field.onChange("destaque")}
>
  <RadioGroupItem value="destaque" id="pub-destaque" className="mt-1" />
  <Label htmlFor="pub-destaque" className="flex-1 cursor-pointer">
    <span className="font-medium flex items-center gap-2">
      <Sparkles className="h-4 w-4 text-primary" />
      Destaque (R$ 97)
    </span>
    ...
  </Label>
</div>
```

**Garantir que todo o card é clicável:**
Adicionar `onClick={() => field.onChange("valor")}` no div wrapper de cada card.

---

## Problema 3: Botões com estilos inconsistentes

### Análise Atual (linhas 751-785)
```tsx
<Button variant="outline">Cancelar</Button>        // outline (correto para secundário)
<Button variant="ghost">Salvar Rascunho</Button>   // ghost (correto)
<Button type="submit">Publicar...</Button>         // default/primary (correto)
```

Os botões já estão com variantes adequadas. Mas o "Cancelar" usa `variant="outline"` enquanto o design pede `variant="ghost"` para ambos.

### Mudanças Necessárias

**Alterar "Cancelar" para ghost:**
```tsx
// ANTES
<Button type="button" variant="outline" onClick={() => navigate("/studio/jobs")}>

// DEPOIS
<Button type="button" variant="ghost" onClick={() => navigate("/studio/jobs")}>
```

---

## Problema 4: Loading state afeta todos os botões

### Análise Atual
- O hook `useJobForm` retorna um único `isSaving` boolean
- Ambos os botões usam `isSaving` para mostrar loading
- Não há como saber qual ação está em progresso

### Mudanças Necessárias

**1. Criar estado local para rastrear qual botão foi clicado:**
```typescript
const [savingAction, setSavingAction] = useState<"draft" | "publish" | null>(null);
```

**2. Atualizar handlers para definir a ação:**
```tsx
// Handler para Salvar Rascunho
const handleSaveDraftClick = async () => {
  setSavingAction("draft");
  await form.handleSubmit(handleSaveDraft)();
  setSavingAction(null);
};

// Handler para Publicar (onSubmit)
const handlePublishClick = async () => {
  setSavingAction("publish");
  await form.handleSubmit(onSubmit)();
  setSavingAction(null);
};
```

**3. Atualizar botões para mostrar loading correto:**
```tsx
// Salvar Rascunho
<Button 
  type="button" 
  variant="ghost"
  disabled={isSaving}
  onClick={handleSaveDraftClick}
>
  {savingAction === "draft" ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Salvando...
    </>
  ) : (
    "Salvar Rascunho"
  )}
</Button>

// Publicar
<Button 
  type="button" 
  disabled={isSaving}
  onClick={handlePublishClick}
>
  {savingAction === "publish" ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Processando...
    </>
  ) : (
    // texto dinâmico existente
  )}
</Button>
```

---

## Problema 5: Perda acidental de dados ao sair da página

### Implementação Técnica

**1. Criar estado para rastrear se formulário foi modificado:**
```typescript
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
const [formSaved, setFormSaved] = useState(false);
```

**2. Usar useEffect para detectar mudanças no form:**
```typescript
// Observar mudanças no formulário
useEffect(() => {
  const subscription = form.watch(() => {
    if (!formSaved) {
      setHasUnsavedChanges(true);
    }
  });
  return () => subscription.unsubscribe();
}, [form, formSaved]);
```

**3. Interceptar fechamento de aba/refresh com beforeunload:**
```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges && !formSaved) {
      e.preventDefault();
      e.returnValue = "";
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [hasUnsavedChanges, formSaved]);
```

**4. Usar blocker do react-router-dom para navegação interna:**
```typescript
import { useBlocker } from "react-router-dom";

const blocker = useBlocker(
  ({ currentLocation, nextLocation }) =>
    hasUnsavedChanges && 
    !formSaved && 
    currentLocation.pathname !== nextLocation.pathname
);
```

**5. Adicionar AlertDialog para confirmação:**
```tsx
<AlertDialog open={blocker.state === "blocked"}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
      <AlertDialogDescription>
        Você tem alterações não salvas. Deseja realmente sair sem salvar?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={() => blocker.reset?.()}>
        Continuar editando
      </AlertDialogCancel>
      <AlertDialogAction onClick={() => blocker.proceed?.()}>
        Descartar e sair
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**6. Atualizar handlers de save/publish para marcar como salvo:**
```typescript
const handleSaveDraftClick = async () => {
  setSavingAction("draft");
  const isValid = await form.trigger();
  if (isValid) {
    setFormSaved(true);
    await handleSaveDraft(form.getValues());
  }
  setSavingAction(null);
};
```

**7. Atualizar botão Cancelar para mostrar confirmação:**
```tsx
const handleCancel = () => {
  if (hasUnsavedChanges && !formSaved) {
    // O blocker do react-router vai interceptar
    navigate("/studio/jobs");
  } else {
    navigate("/studio/jobs");
  }
};
```

---

## Imports Adicionais Necessários

```typescript
import { useBlocker } from "react-router-dom";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
```

---

## Resumo das Mudanças no JobForm.tsx

| Linha | Mudança |
|-------|---------|
| 2 | Adicionar `useBlocker` ao import |
| 6+ | Adicionar imports do AlertDialog |
| 38 | Tornar `contato_candidatura` obrigatório |
| 44 | Adicionar `.min(1)` em `habilidades_obrigatorias` |
| 94+ | Adicionar estados `savingAction`, `hasUnsavedChanges`, `formSaved` |
| ~140 | Adicionar useEffect para watch form changes |
| ~145 | Adicionar useEffect para beforeunload |
| ~150 | Adicionar useBlocker para navegação interna |
| 556 | Adicionar asterisco no label "Meio de contato" |
| 679 | Adicionar asterisco no label "Habilidades obrigatórias" |
| 721-741 | Corrigir estilos dos cards de tipo de publicação |
| 751-785 | Atualizar lógica dos botões com loading independente |
| ~790 | Adicionar AlertDialog para confirmação de saída |

---

## Checklist de Implementação

- [ ] Schema Zod: `contato_candidatura` obrigatório com min(1)
- [ ] Schema Zod: `habilidades_obrigatorias` com min(1)
- [ ] Label "Meio de contato" com asterisco vermelho
- [ ] Label "Habilidades obrigatórias" com asterisco vermelho
- [ ] Cards de tipo de publicação começam cinza, ficam verdes quando selecionados
- [ ] Todo o card é clicável (não só o radio)
- [ ] Ícone Sparkles mantido no card Destaque
- [ ] Botão "Cancelar" usa variant="ghost"
- [ ] Loading aparece apenas no botão clicado
- [ ] Outro botão fica desabilitado durante loading
- [ ] beforeunload intercepta fechamento de aba
- [ ] useBlocker intercepta navegação interna
- [ ] AlertDialog confirma saída com alterações não salvas
- [ ] Botão Cancelar respeita a lógica de confirmação
- [ ] Após salvar/publicar, confirmação é desabilitada
