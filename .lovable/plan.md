

## Plano: Corrigir 3 bugs no ImportReviewDrawer

### Bug 1 — Texto original do PDF sempre vazio

**Arquivo:** `supabase/functions/process-linkedin-pdf/index.ts`

Antes do bloco de retorno (linha 252), adicionar a chamada `const sections = splitSections(fullText);` e incluir `sections` no retorno:

```text
raw_text: {
  full: fullText,
  sections: sections,
},
```

A funcao `splitSections` ja existe no arquivo (linhas 17-56) e retorna `{ experiences, education, skills }`.

---

### Bug 2 — Descricao da IA perdida ao voltar do "Texto original"

**Arquivo:** `src/components/ImportReviewDrawer.tsx`

No `ExperienceReviewCard` (linha 67), adicionar estado interno para preservar a descricao original da IA:

```text
const [aiDescription] = useState(experience.description);
```

Atualizar `handleDescSourceChange` (linhas 78-83) para restaurar `aiDescription` ao voltar para "ai":

```text
const handleDescSourceChange = (value: string) => {
  setDescSource(value as "ai" | "raw");
  if (value === "raw") {
    onUpdate({ ...experience, description: rawSectionText });
  } else {
    onUpdate({ ...experience, description: aiDescription });
  }
};
```

---

### Bug 3 — Campos de data nao propagam alteracoes

**Arquivo:** `src/components/ImportReviewDrawer.tsx`

No `ExperienceReviewCard`, adicionar dois estados internos para os valores de exibicao das datas (apos linha 67):

```text
const [startDateDisplay, setStartDateDisplay] = useState(
  formatBrazilianDate(experience.start_date)
);
const [endDateDisplay, setEndDateDisplay] = useState(
  formatBrazilianDate(experience.end_date)
);
```

Substituir os inputs de data (linhas 113-126) de `defaultValue` + `onBlur` para `value` + `onChange`:

- Data de inicio: `value={startDateDisplay}`, `onChange` que atualiza `startDateDisplay` e chama `handleChange`
- Data de termino: `value={endDateDisplay}`, `onChange` que atualiza `endDateDisplay` e chama `handleChange`

Remover os `onBlur` desses dois inputs.

---

### O que NAO muda

- `EducationReviewCard`
- Secao de Skills
- `Profile.tsx`
- Nenhuma biblioteca nova

### Arquivos tocados

| Arquivo | Acao |
|---|---|
| `supabase/functions/process-linkedin-pdf/index.ts` | Editar (adicionar sections no retorno) |
| `src/components/ImportReviewDrawer.tsx` | Editar (bugs 2 e 3) |

