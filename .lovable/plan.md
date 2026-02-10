
# Plano: Corrigir Fluxo de Publicacao de Vagas

## Causa Raiz

O `form.trigger()` falha porque o schema Zod contém validacoes que conflitam com o estado real:

1. `tipo_publicacao` tem `.refine(val => val !== null)` -- mesmo apos clicar no card e chamar `field.onChange("gratuita")`, o refine bloqueia o trigger
2. `habilidades_obrigatorias` com `.min(1)` esta no schema, mas as skills sao gerenciadas por `useState` separado -- `form.setValue()` antes do trigger tem problemas de timing
3. `.refine()` de salario no final do schema tambem pode bloquear

## Solucao

Remover do schema Zod os campos que nao sao gerenciados pelo form (skills) e os refines problematicos (tipo_publicacao, salario). Validar tudo manualmente no `handlePublishClick` ANTES de chamar `form.trigger()`.

Alem disso, corrigir `expires_at` no hook para seguir as regras:
- Rascunho: `expires_at = null`
- Gratuita: `expires_at = now + 30 dias`
- Destaque: `expires_at = null` (so apos webhook do Stripe)

---

## Arquivo 1: `src/pages/studio/JobForm.tsx`

### Mudanca 1.1 - Simplificar schema Zod (linhas 39-71)

Remover do schema:
- `.refine()` de `tipo_publicacao` -- manter apenas `.nullable()`
- `habilidades_obrigatorias` e `habilidades_desejaveis` -- remover completamente
- `.refine()` de salario no final

Schema resultante:
```typescript
const vagaFormSchema = z.object({
  titulo: z.string().min(5, "Minimo 5 caracteres").max(100, "Maximo 100 caracteres"),
  tipo_funcao: z.array(z.string()).min(1, "Selecione pelo menos um tipo de funcao"),
  nivel: z.enum(["iniciante", "junior", "pleno", "senior", "lead"]),
  tipo_contrato: z.enum(["clt", "pj", "freelance", "estagio"]),
  remoto: z.enum(["presencial", "hibrido", "remoto"]),
  estado: z.string().optional(),
  cidade: z.string().optional(),
  contato_candidatura: z.string().min(1, "Campo obrigatorio").max(500, "Maximo 500 caracteres"),
  salario_min: z.number().positive().nullable().optional(),
  salario_max: z.number().positive().nullable().optional(),
  mostrar_salario: z.boolean().default(false),
  descricao: z.string().min(100, "Minimo 100 caracteres").max(10000, "Maximo 10.000 caracteres"),
  tipo_publicacao: z.enum(["gratuita", "destaque"]).nullable(),
});
```

### Mudanca 1.2 - Remover defaultValues de skills (linhas 149-150)

Remover `habilidades_obrigatorias: []` e `habilidades_desejaveis: []` dos defaultValues.

### Mudanca 1.3 - Remover form.reset de skills (linhas 220-221)

Remover `habilidades_obrigatorias: []` e `habilidades_desejaveis: []` do `form.reset()` ao carregar vaga existente.

### Mudanca 1.4 - Simplificar handlePublishClick (linhas 373-436)

Nova logica:
1. Checar `habilidadesObrigatorias.length === 0` com toast -- retorna
2. Checar `tipo_publicacao` nulo com toast -- retorna
3. Validar salario manualmente (max >= min) com toast -- retorna
4. Chamar `form.trigger()` para os campos do form (sem skills e sem refines)
5. Se tudo OK, chamar createJob/updateJob

Remover as linhas `form.setValue("habilidades_obrigatorias", ...)` e `form.setValue("habilidades_desejaveis", ...)` pois nao fazem mais parte do schema.

---

## Arquivo 2: `src/hooks/useJobForm.ts`

### Mudanca 2.1 - saveDraft: expires_at = null (linha 279-301)

Na funcao `saveDraft`, mudar `expira_em: expiraEm` para `expira_em: null`. Rascunhos nunca devem ter data de expiracao. Remover a variavel `expiraEm` que nao sera mais usada nesta funcao.

### Mudanca 2.2 - createJob gratuita: manter expires_at (linha 428-451)

A funcao `createJob` para vagas gratuitas ja define `expira_em = addDays(new Date(), 30)`. Isso esta correto, manter.

### Mudanca 2.3 - createJob destaque: expires_at = null (linha 477-501)

Na funcao `createJob` para vagas destaque, mudar `expira_em: expiraEm` para `expira_em: null`. A data de expiracao so deve ser criada apos confirmacao do pagamento pelo webhook do Stripe.

---

## Arquivo 3: `src/components/studio/JobsTable.tsx`

### Mudanca 3.1 - Remover coluna "Publicada em" (linhas 100, 135-139)

Remover `<TableHead>Publicada em</TableHead>` do header e a celula correspondente `<TableCell>` do body. A coluna "Expira em" ja cobre essa informacao.

Para rascunhos sem expires_at, a funcao `renderExpiraEm` ja mostra "--" quando `expira_em` e null.

---

## Resumo de Arquivos

| Arquivo | O que muda |
|---------|-----------|
| `src/pages/studio/JobForm.tsx` | Schema Zod simplificado, validacao manual no handlePublishClick |
| `src/hooks/useJobForm.ts` | expires_at = null para rascunhos e vagas aguardando pagamento |
| `src/components/studio/JobsTable.tsx` | Remover coluna "Publicada em" |

## O que NAO muda

- Cards de selecao de tipo (visual ja funciona com `field.onChange` e `cn()`)
- Logica do botao "Salvar Rascunho" (so aparece para rascunhos, ja implementado)
- Texto dinamico do botao de publicar (ja implementado: "Publicar Vaga" vs "Publicar e Pagar R$ 97")
- Integracao com Stripe
- Edge functions
- Mobile cards
- Dropdown de acoes

## Checklist critico (pontos que nao podem ser esquecidos)

- [x] Rascunho: expires_at = null (mudanca 2.1)
- [x] Publicacao gratuita: expires_at = now + 30 dias (ja correto, mudanca 2.2)
- [x] Publicacao destaque: expires_at = null ate webhook confirmar (mudanca 2.3)
- [x] Botao muda baseado no tipo selecionado (ja implementado nas linhas 1002-1021)
- [x] Botao "Salvar Rascunho" so aparece para rascunhos (ja implementado na linha 984)
- [x] Card selecionado tem visual diferente (ja implementado com `border-primary bg-primary/5` nas linhas 914-920)
