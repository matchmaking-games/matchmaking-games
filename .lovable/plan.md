## Plano: TASK-810 - Tela de revisao da importacao

### Resumo

Criar o componente `ImportReviewDrawer` que abre apos o processamento bem-sucedido do PDF, permitindo ao usuario revisar e editar experiencias, formacoes e skills extraidas antes de confirmar. Conectar o drawer na pagina de perfil substituindo o toast/console.log atual.

---

### Estrutura de dados do Gemini (referencia)

Os dados chegam em `extracted_data` com esta estrutura:

```text
{
  basic_info: { name, email, phone, linkedin_url, location, bio },
  experiences: [{ company, role, start_date (YYYY-MM), end_date (YYYY-MM|null), location, description }],
  education: [{ institution, degree, field, start_year (YYYY), end_year (YYYY|null) }],
  skills: ["string"]
}
```

---

### Arquivo 1: `src/components/ImportReviewDrawer.tsx` (criar)

**Tipos**

- `ReviewExperience`: `{ company, role, start_date, end_date, location, description }`
- `ReviewEducation`: `{ institution, degree, field, start_year, end_year }`
- `ReviewedData`: `{ experiences: ReviewExperience[], education: ReviewEducation[], skills: string[] }`

**Componente principal: `ImportReviewDrawer**`

Props:

- `open: boolean`
- `onClose: () => void`
- `onSave: (data: ReviewedData) => void`
- `extractedData: { experiences, education, skills }`
- `rawFullText: string`

Estado interno: copia editavel de `extractedData` via `useState`, inicializado com `useEffect` quando `extractedData` muda.

Layout usando `Sheet` do shadcn com `side="right"`:

- Classe custom no `SheetContent`: `sm:max-w-3xl w-full h-full overflow-y-auto`
- Header: `SheetHeader` com titulo "Revisao da Importacao" e `SheetDescription`
- Tres cards de resumo lado a lado (grid-cols-3 em desktop, grid-cols-1 em mobile): "X Experiencias", "Y Formacoes", "Z Skills" usando `Card`
- Secao "Experiencias Profissionais" com icone `Briefcase`: lista de `ExperienceReviewCard`
- Secao "Formacao Academica" com icone `GraduationCap`: lista de `EducationReviewCard`
- Secao "Skills" com icone `Wrench`: badges editaveis + input para adicionar
- Footer fixo (sticky bottom): botoes "Cancelar" (outline) e "Confirmar e Salvar" (default, com icone `Check`)

**Subcomponente: `ExperienceReviewCard**`

Props: `experience`, `rawSectionText`, `onUpdate`

Card com campos editaveis:

- "Empresa" e "Cargo": `Input`
- "Data de inicio" e "Data de termino": `Input` com placeholder "MM/YYYY", usando `formatBrazilianDate` para exibir e `parseToIsoDate` para converter de volta
- "Localizacao": `Input`
- "Descricao": `RadioGroup` com duas opcoes ("Usar dados extraidos pela IA" / "Usar texto original do PDF") + `Textarea` com 6 linhas. Ao selecionar "texto original", preenche o textarea com `rawFullText`. Estado do radio e do texto sao independentes apos a selecao inicial.

Cada mudanca chama `onUpdate` com o objeto atualizado.

**Subcomponente: `EducationReviewCard**`

Props: `education`, `onUpdate`

Card com campos editaveis:

- "Instituicao": `Input`
- "Grau": `Input` (ex: Graduacao, Pos-graduacao)
- "Curso/Area": `Input`
- "Ano de inicio" e "Ano de termino": `Input` com placeholder "YYYY"

Sem campo de descricao, sem radio button.

**Secao de Skills**

Dentro do drawer principal (nao e subcomponente separado):

- Skills exibidas como `Badge` com botao X para remover
- `Input` com placeholder "Adicionar skill..." e botao "+" para adicionar
- Adicionar ao pressionar Enter ou clicar no botao
- Estado gerenciado no array `skills` do estado principal

---

### Arquivo 2: `src/pages/Profile.tsx` (modificar)

**Novos estados (apos linha 98)**

- `reviewData: ImportResult | null` (inicialmente `null`)
- `isReviewOpen: boolean` (inicialmente `false`)

**Substituir bloco do toast de sucesso (linhas 364-369)**

Onde hoje tem:

```text
console.log("LinkedIn import data:", result);
toast({ title: "Curriculo processado com sucesso!", ... });
```

Substituir por:

```text
setReviewData(result);
setIsReviewOpen(true);
```

**Renderizar o drawer (apos o `ImportConfirmModal`, linha 378)**

```text
<ImportReviewDrawer
  open={isReviewOpen}
  onClose={() => { setIsReviewOpen(false); setReviewData(null); }}
  onSave={(data) => {
    toast({ title: "Salvando dados...", description: "A logica de salvar sera implementada na proxima task." });
    setIsReviewOpen(false);
    setReviewData(null);
  }}
  extractedData={reviewData?.extracted_data}
  rawSectionText={reviewData?.raw_text?.sections?.experiences || ""}
/>
```

**Imports adicionais**

- `ImportReviewDrawer` de `@/components/ImportReviewDrawer`

---

### O que NAO muda

- Hook `useImportLinkedIn` (nenhuma alteracao)
- Nenhum outro componente ou pagina
- Nenhuma biblioteca nova instalada
- Logica de salvar no banco (proxima task)

### Arquivos tocados


| Arquivo                                 | Acao      |
| --------------------------------------- | --------- |
| `src/components/ImportReviewDrawer.tsx` | Criar     |
| `src/pages/Profile.tsx`                 | Modificar |
