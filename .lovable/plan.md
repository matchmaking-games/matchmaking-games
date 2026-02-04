
# Plano: Integrar Fluxo de Pagamento no Formulario de Vagas

## Resumo
Implementar a logica de salvamento condicional baseada no tipo de publicacao, adicionar botao de rascunho, e bloquear edicao do tipo em vagas publicadas.

---

## Arquivos a Modificar

### 1. `src/hooks/useJobForm.ts`

**Alteracoes:**
- Atualizar interface `VagaCompleta` para incluir campo `status: string | null`
- Criar nova funcao `saveDraft()` para salvar vaga como rascunho
- Modificar `createJob()` para:
  - Verificar `tipo_publicacao` antes de salvar
  - Se `gratuita`: salvar com `status='publicada'`, `ativa=true`
  - Se `destaque`: salvar com `status='aguardando_pagamento'`, `ativa=false`, chamar Edge Function e redirecionar para Stripe
- Exportar nova funcao `saveDraft` no return do hook

### 2. `src/pages/studio/JobForm.tsx`

**Alteracoes:**
- Importar `Badge` se ainda nao importado
- Condicionar exibicao da secao "Tipo de Publicacao":
  - Se `existingJob?.status === 'publicada'`: mostrar Badge read-only
  - Caso contrario: mostrar RadioGroup editavel
- Corrigir preco de "R$ 199" para "R$ 97"
- Adicionar botao "Salvar Rascunho" antes do botao principal
- Ajustar texto do botao principal conforme contexto

---

## Detalhes Tecnicos

### Modificacoes em `useJobForm.ts`

**Interface VagaCompleta atualizada:**
```typescript
export interface VagaCompleta {
  // ... campos existentes ...
  status: string | null;  // ADICIONAR
}
```

**Nova funcao saveDraft:**
```typescript
const saveDraft = useCallback(async (data: VagaFormData) => {
  if (!estudioId) { /* erro */ return; }
  
  setIsSaving(true);
  try {
    const session = await supabase.auth.getSession();
    const slug = await generateUniqueSlug(data.titulo);
    const expiraEm = addDays(new Date(), 30).toISOString();

    const { error } = await supabase.from("vagas").insert({
      ...dadosComuns,
      status: 'rascunho',
      ativa: false,
    });

    // Inserir skills...
    
    toast({ title: "Rascunho salvo!" });
    navigate("/studio/jobs");
  } catch (err) { /* tratamento */ }
  finally { setIsSaving(false); }
}, [estudioId, navigate, toast]);
```

**Funcao createJob modificada:**
```typescript
const createJob = useCallback(async (data: VagaFormData) => {
  // ... validacoes existentes ...

  if (data.tipo_publicacao === 'gratuita') {
    // Salvar como publicada
    const { data: vaga } = await supabase.from("vagas").insert({
      ...dadosComuns,
      status: 'publicada',
      ativa: true,
      tipo_publicacao: 'gratuita',
    }).select("id").single();

    await insertSkills(vaga.id, ...);
    toast({ title: "Vaga publicada!" });
    navigate("/studio/jobs");
    
  } else if (data.tipo_publicacao === 'destaque') {
    // Salvar como aguardando pagamento
    const { data: vaga } = await supabase.from("vagas").insert({
      ...dadosComuns,
      status: 'aguardando_pagamento',
      ativa: false,
      tipo_publicacao: 'destaque',
    }).select("id").single();

    await insertSkills(vaga.id, ...);

    // Chamar Edge Function
    const { data: session, error } = await supabase.functions.invoke(
      'create-checkout-session',
      { body: { vaga_id: vaga.id } }
    );

    if (error || !session?.url) {
      toast({ title: "Erro ao processar pagamento", variant: "destructive" });
      return;
    }

    // Redirecionar para Stripe
    window.location.href = session.url;
  }
}, [estudioId, navigate, toast]);
```

**Return do hook atualizado:**
```typescript
return {
  // ... existentes ...
  saveDraft,  // ADICIONAR
};
```

---

### Modificacoes em `JobForm.tsx`

**Secao "Tipo de Publicacao" condicional (linhas 679-716):**
```tsx
{/* SECTION: PUBLICATION TYPE */}
<div className="space-y-4">
  <h3 className="text-lg font-semibold">Tipo de Publicacao</h3>
  <Separator />

  {existingJob?.status === 'publicada' ? (
    // Modo somente leitura para vagas publicadas
    <div className="rounded-lg border p-4 bg-muted/50">
      <p className="text-sm font-medium mb-2">Tipo de Publicacao</p>
      <Badge variant={existingJob.tipo_publicacao === 'destaque' ? 'default' : 'secondary'}>
        {existingJob.tipo_publicacao === 'destaque' 
          ? 'Destaque (R$ 97)' 
          : 'Gratuita'}
      </Badge>
      <p className="text-xs text-muted-foreground mt-2">
        Nao e possivel alterar o tipo apos publicacao
      </p>
    </div>
  ) : (
    // Radio buttons editaveis
    <FormField ... />
  )}
</div>
```

**Correcao do preco (linha 703):**
```tsx
// ANTES:
Destaque (R$ 199)

// DEPOIS:
Destaque (R$ 97)
```

**Botoes de acao (linhas 718-735):**
```tsx
<div className="flex justify-end gap-3 pt-4">
  <Button type="button" variant="outline" onClick={() => navigate("/studio/jobs")}>
    Cancelar
  </Button>
  
  {/* Botao Salvar Rascunho - apenas para criacao ou rascunhos */}
  {(!isEditing || existingJob?.status === 'rascunho') && (
    <Button 
      type="button" 
      variant="ghost"
      disabled={isSaving}
      onClick={form.handleSubmit(handleSaveDraft)}
    >
      {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
      Salvar Rascunho
    </Button>
  )}
  
  <Button type="submit" disabled={isSaving}>
    {isSaving ? (
      <>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        {form.getValues("tipo_publicacao") === "destaque" 
          ? "Processando..." 
          : "Salvando..."}
      </>
    ) : isEditing && existingJob?.status === 'publicada' ? (
      "Salvar Alteracoes"
    ) : form.getValues("tipo_publicacao") === "destaque" ? (
      "Publicar e Pagar R$ 97"
    ) : (
      "Publicar Vaga"
    )}
  </Button>
</div>
```

**Handler para rascunho no componente:**
```tsx
const handleSaveDraft = async (data: VagaFormSchemaType) => {
  const formData: VagaFormData = {
    // ... transformar dados como em onSubmit ...
  };
  await saveDraft(formData);
};
```

---

## Fluxos Resultantes

### Cenario 1: Criar Vaga Gratuita
```text
1. Preencher formulario
2. Selecionar "Gratuita"
3. Clicar "Publicar Vaga"
4. Vaga salva: status='publicada', ativa=true
5. Redirect: /studio/jobs
6. Toast: "Vaga publicada com sucesso!"
```

### Cenario 2: Criar Vaga Destaque
```text
1. Preencher formulario
2. Selecionar "Destaque (R$ 97)"
3. Clicar "Publicar e Pagar R$ 97"
4. Vaga salva: status='aguardando_pagamento', ativa=false
5. Edge Function cria sessao Stripe
6. Redirect: Stripe Checkout
7. Usuario paga (teste: 4242 4242 4242 4242)
8. Stripe redirect: /studio/jobs?payment=success&session_id=xxx
```

### Cenario 3: Salvar Rascunho
```text
1. Preencher formulario parcialmente
2. Clicar "Salvar Rascunho"
3. Vaga salva: status='rascunho', ativa=false
4. Redirect: /studio/jobs
5. Toast: "Rascunho salvo! Voce pode continuar editando depois."
```

### Cenario 4: Editar Vaga Publicada
```text
1. Abrir vaga com status='publicada'
2. Secao "Tipo de Publicacao" mostra Badge read-only
3. Editar outros campos
4. Clicar "Salvar Alteracoes"
5. Toast: "Vaga atualizada com sucesso!"
```

---

## Validacoes de Seguranca

- Preco R$ 97 hardcoded na Edge Function (nao confia no frontend)
- Vaga so ativada apos verify-payment confirmar pagamento
- tipo_publicacao bloqueado apos status='publicada'
- Edge Function valida status='aguardando_pagamento' antes de criar sessao

---

## Nao Incluso Nesta Task

- Verificacao de pagamento no retorno (TASK-603)
- Filtros na listagem de vagas
- Modificacoes nas Edge Functions
