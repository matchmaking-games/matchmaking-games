
## Plano: Refatorar ImportReviewDrawer com dois estados + corrigir build errors

### Resumo

Refatorar o fluxo de importacao para que o botao "Importar do LinkedIn" abra o drawer (sem abrir o gerenciador de arquivos), e o drawer tenha dois estados internos: "instructions" (com instrucoes, alerta, accordions e botao "Subir PDF") e "review" (com os cards editaveis). Tambem corrigir os build errors pre-existentes de `freelance` vs `freelancer`.

---

### Arquivo 1: `src/components/ImportSection.tsx` (reescrever)

Simplificar drasticamente. Novas props:

```text
interface ImportSectionProps {
  onOpen: () => void;
}
```

Remover: `useRef`, input file oculto, `handleFileChange`, validacao de PDF, props `onFileSelected`/`isProcessing`/`progress`.

JSX final: apenas o botao "Importar do LinkedIn" (mesmo visual, `variant="outline"`, `size="sm"`, icone `Upload`) que chama `onOpen()`, e abaixo o texto "Veja como trazer seu curriculo do LinkedIn".

---

### Arquivo 2: `src/components/ImportReviewDrawer.tsx` (reescrever)

**Novas props (simplificadas):**

```text
interface ImportReviewDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ReviewedData) => void;
}
```

Remove: `extractedData`, `rawSectionText` das props. Tudo e gerenciado internamente.

**Estado interno:**

- `step: "instructions" | "review"` (inicia em "instructions")
- `experiences`, `education` (arrays editaveis, populados apos processamento)
- `isProcessing: boolean`
- `processingProgress: string`
- `fileInputRef: useRef<HTMLInputElement>`

**Hooks usados internamente:**

- `useImportLinkedIn()` para `uploadPdf`, `isProcessing`, `progress`, `errorRef`
- `useImportLimit()` para `remainingImports`, `canImport`, `isLoading`

**Logica do input file:**

- Input oculto `<input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />`
- Botao "Subir PDF" chama `fileInputRef.current?.click()`
- `handleFileSelect`: extrai arquivo, valida tipo e tamanho, chama `uploadPdf(file)`. Se sucesso, popula `experiences` e `education` com os dados retornados, seta `step = "review"`. Se erro, mostra toast.

**Estado "instructions" — conteudo:**

Header: "Importar do LinkedIn"

Alert destructive com icone `AlertTriangle`: texto sobre substituicao de dados e backup automatico.

Dois blocos lado a lado (grid-cols-2 em desktop, grid-cols-1 em mobile):
- Bloco vermelho (bg-destructive/10 border-destructive/20): "Serao substituidos:" com lista de "Experiencias profissionais" e "Formacao academica"
- Bloco verde (bg-primary/10 border-primary/20): "Serao mantidos:" com lista de "Informacoes basicas do perfil", "Seus projetos", "Suas configuracoes de conta"

Texto discreto de recomendacao.

Tres accordions (Accordion type="single" collapsible):
1. "Como baixar o PDF a partir do desktop" com texto e imagem
2. "Como baixar o PDF a partir do celular" com texto e duas imagens
3. "Por que nao e possivel importar diretamente do LinkedIn?" com texto explicativo

Texto de limite: "X/3 importacoes utilizadas este mes" (vermelho se limite atingido).

Footer: "Cancelar" (outline) + "Subir PDF" (default, icone Upload, desabilitado se `!canImport`).

Durante processamento: footer mostra spinner + texto de progresso do hook, drawer nao fecha (`onOpenChange` ignorado).

**Estado "review" — conteudo:**

Header: "Revisao da Importacao"

Cards de resumo (experiencias e formacoes — sem skills).

Texto de orientacao: "Confira os dados extraidos abaixo..."

Secao de experiencias com `ExperienceReviewCard` — SEM radio button, SEM textarea de descricao alternativa. Apenas campos: Empresa, Cargo, Datas, Localizacao, Descricao (textarea simples editavel).

Secao de formacoes com `EducationReviewCard` — sem alteracoes.

SEM secao de Skills.

Footer: "Cancelar" + "Confirmar e Salvar".

**Subcomponente ExperienceReviewCard (simplificado):**

Remover: `rawSectionText` prop, `descSource` state, `aiDescription` state, `RadioGroup`, `handleDescSourceChange`.

Manter: campos editaveis de Empresa, Cargo, Datas (controlados com `startDateDisplay`/`endDateDisplay`), Localizacao, Descricao (textarea simples).

**ReviewedData (tipo ajustado):**

```text
export interface ReviewedData {
  experiences: ReviewExperience[];
  education: ReviewEducation[];
}
```

Remover `skills` do tipo.

---

### Arquivo 3: `src/pages/Profile.tsx` (simplificar)

**Remover:**
- `reviewData` state
- `isReviewOpen` state
- import de `useImportLinkedIn`
- Toda logica de `uploadPdf`, `isProcessing`, `progress`, `errorRef`

**Adicionar:**
- `const [isDrawerOpen, setIsDrawerOpen] = useState(false)`

**ImportSection:**
```text
<ImportSection onOpen={() => setIsDrawerOpen(true)} />
```

**ImportReviewDrawer:**
```text
<ImportReviewDrawer
  open={isDrawerOpen}
  onClose={() => setIsDrawerOpen(false)}
  onSave={(data) => {
    toast({ title: "Salvando dados...", description: "A logica de salvar sera implementada na proxima task." });
    setIsDrawerOpen(false);
  }}
/>
```

---

### Arquivo 4: `src/components/experience/ExperienceModal.tsx` (fix build error)

Linha 24: trocar `"freelance"` por `"freelancer"` no enum do zod:

```text
tipo_emprego: z.enum(["clt", "pj", "freelancer", "estagio"], {
```

Verificar se ha labels de exibicao com "Freelance" e manter o label visual, apenas o value muda.

### Arquivo 5: `src/pages/studio/JobForm.tsx` (fix build error)

Linha 43: trocar `"freelance"` por `"freelancer"` no enum do zod:

```text
tipo_contrato: z.enum(["clt", "pj", "freelancer", "estagio"]),
```

---

### Fluxo de dados final

```text
Profile.tsx
  |-- isDrawerOpen (boolean)
  |-- ImportSection (onOpen -> setIsDrawerOpen(true))
  |-- ImportReviewDrawer (open, onClose, onSave)
        |-- useImportLinkedIn() (interno)
        |-- useImportLimit() (interno)
        |-- step: "instructions" | "review"
        |-- fileInputRef (input oculto interno)
        |-- ExperienceReviewCard (sem radio button)
        |-- EducationReviewCard (sem alteracao)
```

### O que NAO muda

- Hook `useImportLinkedIn`
- Hook `useImportLimit`
- Edge Function
- Nenhuma biblioteca nova

### Arquivos tocados

| Arquivo | Acao |
|---|---|
| `src/components/ImportSection.tsx` | Reescrever (simplificar) |
| `src/components/ImportReviewDrawer.tsx` | Reescrever (dois estados) |
| `src/pages/Profile.tsx` | Editar (simplificar) |
| `src/components/experience/ExperienceModal.tsx` | Editar (freelance -> freelancer) |
| `src/pages/studio/JobForm.tsx` | Editar (freelance -> freelancer) |
