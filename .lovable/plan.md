
## Plano: Corrigir campos do estado de revisao da importacao

### Resumo

Atualizar os tipos, o mapeamento de dados e os cards de revisao no `ImportReviewDrawer` para alinhar com o schema real do banco de dados (campos em portugues). Adicionar Select para `tipo_emprego` e `tipo` (formacao). Adicionar AlertDialog para confirmar saida no estado de revisao.

Unico arquivo tocado: `src/components/ImportReviewDrawer.tsx`.

---

### 1. Tipos TypeScript atualizados

```text
export interface ReviewExperience {
  empresa: string;
  titulo_cargo: string;
  tipo_emprego: "clt" | "pj" | "freelancer" | "estagio";
  inicio: string;
  fim: string | null;
  descricao: string;
}

export interface ReviewEducation {
  instituicao: string;
  tipo: "graduacao" | "pos" | "tecnico" | "curso" | "certificacao";
  titulo: string;
  area: string;
  inicio: string;
  fim: string | null;
}

export interface ReviewedData {
  experiences: ReviewExperience[];
  education: ReviewEducation[];
}
```

---

### 2. Mapeamento no handleFileSelect

Ao receber dados do `uploadPdf`, mapear campos em ingles para portugues:

```text
// Experiencias
const mappedExperiences = (result.extracted_data?.experiences ?? []).map((exp: any) => ({
  empresa: exp.company || "",
  titulo_cargo: exp.role || "",
  tipo_emprego: "clt" as const,
  inicio: exp.start_date || "",
  fim: exp.end_date || null,
  descricao: exp.description || "",
}));

// Formacoes
const mappedEducation = (result.extracted_data?.education ?? []).map((edu: any) => ({
  instituicao: edu.institution || "",
  tipo: "curso" as const,
  titulo: edu.field || "",
  area: edu.field || "",
  inicio: edu.start_year || "",
  fim: edu.end_year || null,
}));
```

---

### 3. ExperienceReviewCard atualizado

Campos na ordem:

1. **Empresa** — Input, `experience.empresa`
2. **Cargo** — Input, `experience.titulo_cargo`
3. **Tipo de contrato** — Select do shadcn/ui, `experience.tipo_emprego`
   - Opcoes: clt/CLT, pj/PJ, freelancer/Freelancer, estagio/Estagio
4. **Data de inicio** — Input MM/YYYY controlado com `startDateDisplay` + `formatBrazilianDate`/`parseToIsoDate`, campo `inicio`
5. **Data de termino** — Input MM/YYYY controlado com `endDateDisplay`, campo `fim`. Se `fim` for null, exibir string vazia (nao "Atual")
6. **Descricao** — Textarea 6 linhas, campo `descricao`

Remover: campo `location`.

O titulo do card muda para: `{experience.titulo_cargo || "Cargo"} -- {experience.empresa || "Empresa"}`

A funcao `handleChange` atualiza para usar os novos nomes de campos (`inicio`, `fim` em vez de `start_date`, `end_date`).

Para exibir string vazia quando `fim` e null (em vez de "Atual"), usar uma variacao: `formatBrazilianDate(experience.fim)` retorna "Atual" para null, entao inicializar `endDateDisplay` com `experience.fim ? formatBrazilianDate(experience.fim) : ""`.

---

### 4. EducationReviewCard atualizado

Campos na ordem:

1. **Instituicao** — Input, `education.instituicao`
2. **Tipo de formacao** — Select do shadcn/ui, `education.tipo`
   - Opcoes: graduacao/Graduacao, pos/Pos-graduacao, tecnico/Tecnico, curso/Curso, certificacao/Certificacao
3. **Titulo / Nome do curso** — Input, `education.titulo`
4. **Area** — Input, `education.area`
5. **Ano de inicio** — Input placeholder "YYYY", `education.inicio`
6. **Ano de termino** — Input placeholder "YYYY ou deixe vazio", `education.fim`. Se null, exibir string vazia.

O titulo do card muda para: `{education.titulo || "Curso"} -- {education.instituicao || "Instituicao"}`

---

### 5. AlertDialog ao tentar sair no estado de revisao

Adicionar um estado `showExitConfirm: boolean` (inicia false).

Modificar `handleOpenChange`:
- Se `step === "review"` e tentando fechar (`o === false`): setar `showExitConfirm = true` em vez de fechar
- Se `step === "instructions"` e nao esta processando: fechar normalmente

O botao "Cancelar" no footer do review tambem deve abrir o AlertDialog em vez de fechar diretamente.

Renderizar o AlertDialog dentro do Sheet (fora do condicional de step):

```text
<AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Sair sem salvar?</AlertDialogTitle>
      <AlertDialogDescription>
        Os dados extraidos serao perdidos e voce precisara fazer a importacao novamente.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Continuar revisando</AlertDialogCancel>
      <AlertDialogAction variant="destructive" onClick={handleClose}>
        Sair sem salvar
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

### 6. Imports adicionais

Adicionar ao arquivo:

- `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` de `@/components/ui/select`
- `AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle` de `@/components/ui/alert-dialog`

---

### O que NAO muda

- Estado "instructions" do drawer (intacto)
- Hook `useImportLinkedIn`
- Edge Function
- `Profile.tsx`
- Nenhuma biblioteca nova
- Logica de salvar no banco (proxima task)

### Arquivos tocados

| Arquivo | Acao |
|---|---|
| `src/components/ImportReviewDrawer.tsx` | Editar |
