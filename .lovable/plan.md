

## Plano: Corrigir 4 bugs criticos nos modals de experiencia e educacao

### Resumo

Corrigir campos incompativeis com o schema atual do banco de dados em dois arquivos: remover `localizacao`, corrigir formato de datas para YYYY-MM, e remover campo `area` do formulario de educacao.

---

### Arquivo 1: `src/components/experience/ExperienceModal.tsx`

**Bug 1 — Remover variavel `localizacao`**

Linha 267: remover a linha `const localizacao = ...`

Linhas 295 e 317: remover `localizacao,` dos objetos `experienceData` nos modos "edit" e "create".

**Bug 2 — Corrigir formato de datas nos modos edit e create**

As variaveis `inicioDate` e `fimDate` (linhas 270-271) continuam existindo pois sao usadas no modo "add-position" (linha 278-279) onde o formato YYYY-MM-DD e correto.

Nos objetos `experienceData` dos modos "edit" (linha 300) e "create" (linha 322):
- Substituir `inicioDate` por `data.inicio`
- Substituir `fimDate` por `(data.fim || null)`

O modo "add-position" (linhas 275-283) permanece inalterado — continua usando `inicioDate` e `fimDate` com "-01".

---

### Arquivo 2: `src/components/education/EducationModal.tsx`

**Bug 3 — Corrigir formato de datas**

Linhas 139-140: remover as variaveis `inicioDate` e `fimDate` (nao ha modo add-position em educacao, entao nao sao necessarias).

No objeto `educationData` (linhas 147-148):
- Substituir `inicioDate` por `(data.inicio || null)`
- Substituir `fimDate` por `(data.fim || null)`

**Bug 4 — Remover campo `area` completamente**

4 locais a alterar:

1. Schema Zod (linha 26): remover `area: z.string().max(100, ...).optional().or(z.literal(""))`
2. defaultValues (linha 82): remover `area: ""`
3. Reset no modo edicao (linha 110): remover `area: editingEducation.area || ""`
4. Reset no modo criacao (linha 123): remover `area: ""`
5. Objeto educationData (linha 146): remover `area: data.area || null`
6. JSX (linhas 260-273): remover o bloco FormField inteiro com `name="area"`

---

### Arquivos tocados

| Arquivo | Alteracoes |
|---|---|
| `src/components/experience/ExperienceModal.tsx` | Remover `localizacao`, corrigir datas nos modos edit/create |
| `src/components/education/EducationModal.tsx` | Corrigir datas, remover campo `area` |

### O que NAO muda

- Modo "add-position" do ExperienceModal (datas YYYY-MM-DD para cargos_experiencia)
- Hooks useExperiences e useEducations
- MonthYearPicker
- Layout visual, espacamentos, cores
- Nenhum outro arquivo

