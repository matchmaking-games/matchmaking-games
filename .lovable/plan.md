
# Plano: Corrigir Seleção do Tipo de Publicação

## Problema Identificado

1. O campo `tipo_publicacao` no schema Zod tem `.default("gratuita")` que força valor inicial
2. O `defaultValues` do form define `tipo_publicacao: "gratuita"` 
3. Isso faz o card "Gratuita" parecer selecionado por padrão (verde)
4. O componente `RadioGroup` pode ter comportamento estranho com valores controlados

## Solução

Substituir o `RadioGroup` por cards simples com estado controlado manualmente. Isso dá controle total sobre a seleção e permite começar sem nenhuma opção selecionada.

---

## Arquivo a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/studio/JobForm.tsx` | EDITAR |

---

## Mudanças Técnicas

### 1. Alterar Schema Zod (linha 53)

Remover o `.default()` e tornar o campo nullable para permitir estado vazio inicial:

```typescript
// ANTES
tipo_publicacao: z.enum(["gratuita", "destaque"]).default("gratuita"),

// DEPOIS
tipo_publicacao: z.enum(["gratuita", "destaque"]).nullable().refine(
  (val) => val !== null,
  { message: "Escolha um tipo de vaga antes de publicar" }
),
```

### 2. Alterar defaultValues do Form (linha 145)

```typescript
// ANTES
tipo_publicacao: "gratuita",

// DEPOIS
tipo_publicacao: null,
```

### 3. Atualizar Type do Schema (linha 70)

O tipo inferido agora incluirá `null`, precisamos ajustar onde for necessário.

### 4. Remover RadioGroup e Usar Cards Clicáveis (linhas 833-872)

Remover o componente `RadioGroup` e `RadioGroupItem`, substituindo por cards simples com `onClick` que atualizam o valor do campo:

```tsx
<FormField
  control={form.control}
  name="tipo_publicacao"
  render={({ field }) => (
    <FormItem>
      <FormControl>
        <div className="space-y-3">
          {/* Card Gratuita */}
          <div 
            className={cn(
              "flex items-start space-x-3 p-3 rounded-md border transition-colors cursor-pointer",
              field.value === "gratuita" 
                ? "border-primary bg-primary/5" 
                : "border-border hover:bg-muted/50"
            )}
            onClick={() => field.onChange("gratuita")}
          >
            <div className={cn(
              "w-4 h-4 mt-1 rounded-full border-2 flex items-center justify-center",
              field.value === "gratuita" 
                ? "border-primary" 
                : "border-muted-foreground"
            )}>
              {field.value === "gratuita" && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <div className="flex-1">
              <span className="font-medium">Gratuita</span>
              <p className="text-sm text-muted-foreground">Visibilidade padrão na listagem de vagas</p>
            </div>
          </div>
          
          {/* Card Destaque */}
          <div 
            className={cn(
              "flex items-start space-x-3 p-3 rounded-md border transition-colors cursor-pointer",
              field.value === "destaque" 
                ? "border-primary bg-primary/5" 
                : "border-border hover:bg-muted/50"
            )}
            onClick={() => field.onChange("destaque")}
          >
            <div className={cn(
              "w-4 h-4 mt-1 rounded-full border-2 flex items-center justify-center",
              field.value === "destaque" 
                ? "border-primary" 
                : "border-muted-foreground"
            )}>
              {field.value === "destaque" && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <div className="flex-1">
              <span className="font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Destaque (R$ 97)
              </span>
              <p className="text-sm text-muted-foreground">
                Topo da lista por 30 dias + badge de destaque
              </p>
            </div>
          </div>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 5. Remover Import do RadioGroup (linha 14)

```typescript
// REMOVER esta linha
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
```

### 6. Atualizar transformFormData (linha 294)

Adicionar type assertion para garantir que o valor não é null quando chega aqui (já foi validado pelo Zod):

```typescript
tipo_publicacao: data.tipo_publicacao as "gratuita" | "destaque",
```

### 7. Atualizar Lógica do Botão Publicar (linhas 914-924)

Usar `form.watch("tipo_publicacao")` em vez de `form.getValues()` para reatividade, e tratar caso `null`:

```tsx
// Antes de renderizar o texto do botão, verificar o valor
const tipoPublicacao = form.watch("tipo_publicacao");

// No botão:
{savingAction === "publish" ? (
  <>
    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
    {tipoPublicacao === "destaque" && !isEditing
      ? "Processando..." 
      : "Salvando..."}
  </>
) : isEditing && existingJob?.status === 'publicada' ? (
  "Salvar Alterações"
) : tipoPublicacao === "destaque" ? (
  "Publicar e Pagar R$ 97"
) : (
  "Publicar Vaga"
)}
```

### 8. Atualizar useEffect que carrega dados existentes (linha 216)

```typescript
// ANTES
tipo_publicacao: existingJob.tipo_publicacao || "gratuita",

// DEPOIS (manter igual, pois para edição queremos o valor existente)
tipo_publicacao: existingJob.tipo_publicacao || null,
```

---

## Comportamento Esperado Após Mudanças

| Cenário | Comportamento |
|---------|---------------|
| Página /studio/jobs/new carregada | Ambos os cards cinzas, nenhum selecionado |
| Usuário clica em "Gratuita" | Card Gratuita fica verde, Destaque fica cinza |
| Usuário clica em "Destaque" | Card Destaque fica verde, Gratuita fica cinza |
| Usuário muda de ideia e clica no outro | A seleção muda normalmente |
| Usuário tenta publicar sem selecionar | Mensagem de erro "Escolha um tipo de vaga antes de publicar" |
| Edição de vaga existente | Card carrega com seleção atual da vaga |

---

## O que NÃO será alterado

- Lógica de publicação de vaga gratuita
- Lógica de redirecionamento para Stripe para vagas destaque
- Lógica de salvar rascunho
- Lógica de edição de vagas existentes
- Proteção contra perda de dados (beforeunload, AlertDialog)
- Validação dos outros campos obrigatórios

---

## Checklist de Implementação

- [ ] Remover import do RadioGroup
- [ ] Atualizar schema Zod para tipo_publicacao nullable com validação
- [ ] Atualizar defaultValues para tipo_publicacao: null
- [ ] Substituir RadioGroup por cards simples clicáveis
- [ ] Adicionar indicador visual de seleção (círculo preenchido)
- [ ] Garantir que ambos os cards comecem cinzas
- [ ] Garantir que clicar em qualquer card funciona normalmente
- [ ] Atualizar transformFormData com type assertion
- [ ] Atualizar lógica de texto do botão para usar watch()
- [ ] Testar validação de campo obrigatório
