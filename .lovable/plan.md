
# Plano: Correções Críticas na Página de Vagas do Estúdio

## Resumo das Correções

Este plano aborda 5 problemas reportados na página de listagem e edição de vagas.

---

## Problema 1: Bug Crítico ao Editar Vaga e Salvar Rascunho

### Diagnóstico
O `handleSaveDraftClick` no arquivo `JobForm.tsx` sempre chama `saveDraft()`, que executa um **INSERT** no banco de dados. Quando o usuário está editando uma vaga existente (modo de edição com ID na URL), deveria chamar uma função de **UPDATE** ao invés de criar uma nova vaga.

### Solução
Modificar `handleSaveDraftClick` para verificar se está no modo de edição (`isEditing && id`) e, nesse caso:
- Chamar uma nova função `updateDraft(id, formData)` ao invés de `saveDraft(formData)`
- Criar a função `updateDraft` no hook `useJobForm.ts` que faz UPDATE mantendo status de rascunho

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useJobForm.ts` | Criar função `updateDraft(id, data)` que faz UPDATE na vaga existente |
| `src/pages/studio/JobForm.tsx` | Modificar `handleSaveDraftClick` para usar `updateDraft` quando `isEditing` |

---

## Problema 2: Ordenação Incorreta na Listagem

### Diagnóstico
A query atual ordena por `ativa DESC, criada_em DESC`. Vagas editadas não sobem para o topo porque `criada_em` nunca muda.

### Solução
Alterar a ordenação para usar `atualizada_em DESC` (campo que existe na tabela `vagas` conforme schema).

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useStudioJobs.ts` | Alterar `.order()` para usar `atualizada_em DESC` |
| `src/hooks/useStudioJobs.ts` | Adicionar `atualizada_em` ao `.select()` e interface `StudioVaga` |

---

## Problema 3: Layout da Tabela

### 3.1 Remover Coluna "Contrato"
Eliminar a coluna de tipo de contrato da tabela para economizar espaço.

### 3.2 Simplificar Badge de Destaque
Mudar de `⚡ DESTAQUE` para apenas `⚡` (só o ícone).

### 3.3 Quebra de Linha no Título
Adicionar classe CSS para quebra de linha em títulos longos.

| Arquivo | Alteração |
|---------|-----------|
| `src/components/studio/JobsTable.tsx` | Remover coluna "Contrato", simplificar badge, adicionar `break-words` |
| `src/components/studio/JobsMobileCard.tsx` | Mesmas alterações de badge e título |

---

## Problema 4: Cores Poluídas

### Diagnóstico
Vagas destaque usam `font-medium` e cor normal, enquanto vagas gratuitas usam `text-muted-foreground`, criando diferença visual excessiva.

### Solução
Unificar cor do texto usando `text-foreground/90` para todas as vagas. A única diferença visual será a badge de destaque.

| Arquivo | Alteração |
|---------|-----------|
| `src/components/studio/JobsTable.tsx` | Remover lógica condicional de cores do título |
| `src/components/studio/JobsMobileCard.tsx` | Mesma alteração |

---

## Problema 5: Lógica do Dropdown por Status

### Regras de Negócio

```text
┌──────────────┬────────────────────────────────────────────────┐
│ Status       │ Ações Disponíveis                              │
├──────────────┼────────────────────────────────────────────────┤
│ ATIVA        │ Editar, Ver página, Ocultar vaga, Excluir      │
│ OCULTA       │ Editar, Ver página, Mostrar vaga, Excluir      │
│ RASCUNHO     │ Editar, Excluir                                │
│ EXPIRADA     │ Excluir                                        │
└──────────────┴────────────────────────────────────────────────┘
```

### Notas Adicionais
- "Ocultar vaga" / "Mostrar vaga" alterna baseado no campo `ativa`
- Badge de status também alterna: "Ativa" quando visível, "Oculta" quando `ativa=false`
- Atualizar `statusConfig` para incluir status "oculta" com estilo apropriado

| Arquivo | Alteração |
|---------|-----------|
| `src/components/studio/JobsTable.tsx` | Implementar dropdown condicional por status |
| `src/components/studio/JobsMobileCard.tsx` | Mesma implementação |

---

## Detalhes Técnicos de Implementação

### Hook useJobForm.ts - Nova função updateDraft

```typescript
// Adicionar após a função saveDraft (linha ~332)
const updateDraft = useCallback(async (id: string, data: VagaFormData) => {
  if (!estudioId) {
    toast({ title: "Erro", description: "Estúdio não encontrado.", variant: "destructive" });
    return;
  }

  try {
    setIsSaving(true);

    // Regenerar slug se título mudou
    let slug = existingJob?.slug || "";
    if (existingJob && data.titulo !== existingJob.titulo) {
      slug = await generateUniqueSlug(data.titulo, id);
    }

    // UPDATE na vaga existente, mantendo status de rascunho
    const { error: updateError } = await supabase
      .from("vagas")
      .update({
        titulo: data.titulo,
        slug,
        descricao: data.descricao,
        tipo_funcao: data.tipo_funcao,
        nivel: data.nivel,
        tipo_contrato: data.tipo_contrato,
        remoto: data.remoto,
        estado: data.estado,
        cidade: data.cidade,
        salario_min: data.salario_min,
        salario_max: data.salario_max,
        mostrar_salario: data.mostrar_salario,
        tipo_publicacao: data.tipo_publicacao,
        contato_candidatura: data.contato_candidatura,
        // Manter status atual (não forçar rascunho)
      })
      .eq("id", id);

    if (updateError) throw new Error("Erro ao atualizar rascunho.");

    // Atualizar habilidades (delete + insert)
    await supabase.from("vaga_habilidades").delete().eq("vaga_id", id);
    await insertSkills(id, data.habilidades_obrigatorias, data.habilidades_desejaveis);

    toast({ title: "Rascunho atualizado!", description: "Alterações salvas." });
    navigate("/studio/jobs");
  } catch (err) {
    toast({ title: "Erro", description: err.message, variant: "destructive" });
  } finally {
    setIsSaving(false);
  }
}, [estudioId, existingJob, navigate, toast]);
```

### JobForm.tsx - Modificar handleSaveDraftClick

```typescript
const handleSaveDraftClick = async () => {
  const titulo = form.getValues("titulo");
  if (!titulo || titulo.length < 3) {
    // validação existente...
    return;
  }

  setSavingAction("draft");
  try {
    const formData = transformFormData(form.getValues());
    setFormSaved(true);
    
    // CORREÇÃO: Verificar se está editando
    if (isEditing && id) {
      await updateDraft(id, formData);
    } else {
      await saveDraft(formData);
    }
  } catch (err) {
    // erro existente...
  } finally {
    setSavingAction(null);
  }
};
```

### JobsTable.tsx - Dropdown Condicional

```typescript
// Atualizar getJobStatus para diferenciar ativa/oculta
function getJobStatus(vaga: StudioVaga): "ativa" | "oculta" | "expirada" | "rascunho" {
  if (vaga.status === 'rascunho') return "rascunho";
  
  const now = new Date();
  const expiraEm = vaga.expira_em ? new Date(vaga.expira_em) : null;

  if (expiraEm && expiraEm < now) return "expirada";
  if (!vaga.ativa) return "oculta";  // Mudança de "inativa" para "oculta"
  return "ativa";
}

// Atualizar statusConfig
const statusConfig = {
  ativa: { label: "Ativa", className: "bg-green-100 text-green-800 ..." },
  oculta: { label: "Oculta", className: "bg-gray-100 text-gray-500 ..." },
  expirada: { label: "Expirada", className: "bg-yellow-100 ..." },
  rascunho: { label: "Rascunho", className: "bg-gray-100 ..." },
};

// No dropdown, renderizar condicionalmente:
<DropdownMenuContent align="end">
  {/* Editar - disponível para ATIVA, OCULTA, RASCUNHO */}
  {status !== "expirada" && (
    <DropdownMenuItem onClick={() => navigate(`/studio/jobs/${vaga.id}/edit`)}>
      <Pencil /> Editar
    </DropdownMenuItem>
  )}
  
  {/* Ver página - disponível apenas para ATIVA e OCULTA */}
  {(status === "ativa" || status === "oculta") && (
    <DropdownMenuItem onClick={() => handleViewPublic(vaga.slug)}>
      <ExternalLink /> Ver página pública
    </DropdownMenuItem>
  )}
  
  {/* Toggle visibilidade - disponível apenas para ATIVA e OCULTA */}
  {(status === "ativa" || status === "oculta") && (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onToggleAtiva(vaga)}>
        <Power /> {vaga.ativa ? "Ocultar vaga" : "Mostrar vaga"}
      </DropdownMenuItem>
    </>
  )}
  
  {/* Excluir - sempre disponível */}
  <DropdownMenuSeparator />
  <DropdownMenuItem className="text-destructive" onClick={() => onDelete(vaga)}>
    <Trash2 /> Excluir
  </DropdownMenuItem>
</DropdownMenuContent>
```

---

## Arquivos a Modificar

| Arquivo | Alterações |
|---------|------------|
| `src/hooks/useJobForm.ts` | Adicionar função `updateDraft`, expor no return |
| `src/hooks/useStudioJobs.ts` | Alterar ordenação para `atualizada_em DESC`, adicionar campo à interface |
| `src/pages/studio/JobForm.tsx` | Modificar `handleSaveDraftClick` para usar `updateDraft` quando editando |
| `src/components/studio/JobsTable.tsx` | Remover coluna contrato, simplificar badge, unificar cores, dropdown condicional |
| `src/components/studio/JobsMobileCard.tsx` | Mesmas alterações de badge, cores e dropdown |

---

## O que NÃO será alterado
- Fluxo de criação de nova vaga (botão publicar)
- Lógica de integração com Stripe
- Validações do formulário
- Outras páginas do sistema
