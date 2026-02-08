
# Plano: Corrigir Botões de Salvar Rascunho e Publicar

## Problema Identificado

Os botões não estão funcionando porque:

1. **Validação bloqueando rascunho**: O campo `tipo_publicacao` tem um `.refine()` que exige valor não-nulo, mas rascunhos não precisam dessa seleção
2. **handleSubmit silencioso**: Quando `form.handleSubmit(handler)()` falha na validação, ele simplesmente não chama o handler, sem mostrar feedback
3. **Erros de validação não propagados**: O try/finally no handler não captura erros de validação do Zod

## Solução

Separar a validação para rascunhos vs publicação:
- **Rascunho**: Validar apenas campos essenciais (titulo, descricao com mínimos reduzidos)
- **Publicar**: Validar tudo incluindo tipo de publicação

---

## Arquivo a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/studio/JobForm.tsx` | EDITAR |
| `src/components/studio/JobsTable.tsx` | EDITAR |
| `src/components/studio/JobsMobileCard.tsx` | EDITAR |

---

## Mudanças em JobForm.tsx

### 1. Criar schema separado para rascunho (após linha 71)

```typescript
// Schema para rascunho - validações mais relaxadas
const draftFormSchema = z.object({
  titulo: z.string().min(3, "Mínimo 3 caracteres").max(100, "Máximo 100 caracteres"),
  tipo_funcao: z.array(z.string()).default([]),
  nivel: z.enum(["iniciante", "junior", "pleno", "senior", "lead"]),
  tipo_contrato: z.enum(["clt", "pj", "freelance", "estagio"]),
  remoto: z.enum(["presencial", "hibrido", "remoto"]),
  estado: z.string().optional(),
  cidade: z.string().optional(),
  contato_candidatura: z.string().max(500, "Máximo 500 caracteres").optional(),
  salario_min: z.number().positive().nullable().optional(),
  salario_max: z.number().positive().nullable().optional(),
  mostrar_salario: z.boolean().default(false),
  descricao: z.string().max(10000, "Máximo 10.000 caracteres").optional(),
  tipo_publicacao: z.enum(["gratuita", "destaque"]).nullable(),
  habilidades_obrigatorias: z.array(z.string()).default([]),
  habilidades_desejaveis: z.array(z.string()).default([]),
});
```

### 2. Modificar handleSaveDraftClick (linha 333-340)

Validar manualmente apenas campos mínimos para rascunho:

```typescript
const handleSaveDraftClick = async () => {
  // Validação mínima para rascunho - apenas título é obrigatório
  const titulo = form.getValues("titulo");
  if (!titulo || titulo.length < 3) {
    form.setError("titulo", { 
      type: "manual", 
      message: "Mínimo 3 caracteres para salvar rascunho" 
    });
    toast({
      title: "Erro de validação",
      description: "Preencha o título da vaga para salvar o rascunho.",
      variant: "destructive",
    });
    return;
  }

  setSavingAction("draft");
  try {
    const formData = transformFormData(form.getValues() as VagaFormSchemaType);
    setFormSaved(true);
    await saveDraft(formData);
  } catch (err) {
    console.error("Error saving draft:", err);
    toast({
      title: "Erro ao salvar rascunho",
      description: "Tente novamente.",
      variant: "destructive",
    });
  } finally {
    setSavingAction(null);
  }
};
```

### 3. Modificar handlePublishClick (linha 343-361)

Garantir que validação é acionada corretamente:

```typescript
const handlePublishClick = async () => {
  // Validar todos os campos (incluindo tipo_publicacao)
  const isValid = await form.trigger();
  
  if (!isValid) {
    // Verificar especificamente o tipo_publicacao para mensagem customizada
    const tipoPublicacao = form.getValues("tipo_publicacao");
    if (!tipoPublicacao) {
      // Já tem a mensagem de erro no schema, apenas foco visual
      toast({
        title: "Erro de validação",
        description: "Escolha um tipo de vaga antes de publicar.",
        variant: "destructive",
      });
    }
    return;
  }

  // Validar habilidades obrigatórias
  if (habilidadesObrigatorias.length === 0) {
    toast({
      title: "Erro de validação",
      description: "Selecione pelo menos uma habilidade obrigatória.",
      variant: "destructive",
    });
    return;
  }
  
  setSavingAction("publish");
  try {
    const data = form.getValues();
    const formData = transformFormData(data as VagaFormSchemaType);
    
    setFormSaved(true);
    if (isEditing && id) {
      await updateJob(id, formData);
    } else {
      await createJob(formData);
    }
  } catch (err) {
    console.error("Error publishing job:", err);
    toast({
      title: "Erro ao publicar vaga",
      description: "Tente novamente.",
      variant: "destructive",
    });
  } finally {
    setSavingAction(null);
  }
};
```

### 4. Atualizar transformFormData (linha 283-301)

Tratar valores opcionais/null corretamente para rascunhos:

```typescript
const transformFormData = (data: VagaFormSchemaType): VagaFormData => {
  return {
    titulo: data.titulo,
    tipo_funcao: data.tipo_funcao || [],
    nivel: data.nivel,
    tipo_contrato: data.tipo_contrato,
    remoto: data.remoto,
    estado: data.estado || null,
    cidade: data.cidade || null,
    contato_candidatura: data.contato_candidatura || null,
    salario_min: data.salario_min || null,
    salario_max: data.salario_max || null,
    mostrar_salario: data.mostrar_salario,
    descricao: data.descricao || "",
    tipo_publicacao: (data.tipo_publicacao || "gratuita") as "gratuita" | "destaque",
    habilidades_obrigatorias: habilidadesObrigatorias,
    habilidades_desejaveis: habilidadesDesejaveis,
  };
};
```

### 5. Remover onSubmit do form element (linha 400)

Manter `onSubmit={(e) => e.preventDefault()}` para prevenir submit HTML padrão.

---

## Mudanças em JobsTable.tsx

### Adicionar badge de "Rascunho" para vagas com status 'rascunho'

**Atualizar getJobStatus (linha 48-55)**:

```typescript
function getJobStatus(vaga: StudioVaga): "ativa" | "inativa" | "expirada" | "rascunho" {
  // Verificar primeiro se é rascunho
  if (vaga.status === 'rascunho') return "rascunho";
  
  const now = new Date();
  const expiraEm = vaga.expira_em ? new Date(vaga.expira_em) : null;

  if (expiraEm && expiraEm < now) return "expirada";
  if (!vaga.ativa) return "inativa";
  return "ativa";
}
```

**Atualizar statusConfig (linha 57-61)**:

```typescript
const statusConfig: Record<string, { label: string; className: string }> = {
  ativa: { label: "Ativa", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  inativa: { label: "Inativa", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
  expirada: { label: "Expirada", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  rascunho: { label: "Rascunho", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
};
```

---

## Mudanças em JobsMobileCard.tsx

### Mesmas mudanças de status

**Atualizar getJobStatus (linha 39-46)**:

```typescript
function getJobStatus(vaga: StudioVaga): "ativa" | "inativa" | "expirada" | "rascunho" {
  if (vaga.status === 'rascunho') return "rascunho";
  
  const now = new Date();
  const expiraEm = vaga.expira_em ? new Date(vaga.expira_em) : null;

  if (expiraEm && expiraEm < now) return "expirada";
  if (!vaga.ativa) return "inativa";
  return "ativa";
}
```

**Atualizar statusConfig (linha 48-52)**:

```typescript
const statusConfig: Record<string, { label: string; className: string }> = {
  ativa: { label: "Ativa", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  inativa: { label: "Inativa", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
  expirada: { label: "Expirada", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  rascunho: { label: "Rascunho", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
};
```

---

## Fluxo Esperado Após Correção

| Ação | Comportamento |
|------|---------------|
| Clicar "Salvar Rascunho" sem título | Erro "Mínimo 3 caracteres para salvar rascunho" |
| Clicar "Salvar Rascunho" com título | Salva rascunho, redireciona para /studio/jobs |
| Ver lista de vagas com rascunho | Badge "Rascunho" aparece na coluna Status |
| Clicar "Publicar Vaga" sem tipo selecionado | Erro "Escolha um tipo de vaga antes de publicar" |
| Clicar "Publicar Vaga" tipo Gratuita | Publica vaga normalmente |
| Clicar "Publicar e Pagar" tipo Destaque | Redireciona para Stripe |

---

## O que NÃO será alterado

- Lógica do hook useJobForm (createJob, updateJob, saveDraft)
- Lógica de integração com Stripe
- Lógica de verificação de pagamento
- Proteção contra perda de dados (beforeunload, AlertDialog)
- Seleção de tipo de vaga (cards clicáveis)
- Validação de tipo de vaga como obrigatório para publicar

---

## Checklist de Implementação

- [ ] handleSaveDraftClick: Validação manual mínima (apenas título)
- [ ] handleSaveDraftClick: Chamar saveDraft diretamente sem form.handleSubmit
- [ ] handlePublishClick: Usar form.trigger() para validar antes de submeter
- [ ] handlePublishClick: Mostrar toast específico para tipo_publicacao não selecionado
- [ ] transformFormData: Tratar valores null/undefined
- [ ] JobsTable: Adicionar status "rascunho" no getJobStatus
- [ ] JobsTable: Adicionar badge "Rascunho" no statusConfig
- [ ] JobsMobileCard: Mesmas mudanças de status
- [ ] Testar fluxo completo de rascunho
- [ ] Testar fluxo de vaga gratuita
- [ ] Testar fluxo de vaga destaque com Stripe
