## Plano: Atualizar campos do drawer de revisao com novos enums

### Resumo

Atualizar os enums `tipo_emprego`, `tipo_educacao` e `modalidade_trabalho` em 4 arquivos: o drawer de revisao, o modal de experiencia, o modal de educacao e o formulario de vagas. Adicionar campo "Modalidade" ao ExperienceReviewCard. Remover campo `area` do EducationReviewCard.

---

### Arquivo 1: `src/components/ImportReviewDrawer.tsx`

**Tipos atualizados:**

```text
export interface ReviewExperience {
  empresa: string;
  titulo_cargo: string;
  tipo_emprego: "clt" | "pj" | "freelancer" | "estagio" | "tempo_integral";
  modalidade: "presencial" | "hibrido" | "remoto";
  inicio: string;
  fim: string | null;
  descricao: string;
}

export interface ReviewEducation {
  instituicao: string;
  tipo: "graduacao" | "pos" | "tecnico" | "curso" | "certificacao" | "ensino_medio" | "mestrado" | "doutorado" | "mba";
  titulo: string;
  inicio: string;
  fim: string | null;
}
```

Remover `area` do `ReviewEducation`.

**Constantes de opcoes atualizadas:**

```text
TIPO_EMPREGO_OPTIONS: adicionar { value: "tempo_integral", label: "Tempo integral" }

TIPO_EDUCACAO_OPTIONS: adicionar 4 novos:
  { value: "ensino_medio", label: "Ensino médio" }
  { value: "mestrado", label: "Mestrado" }
  { value: "doutorado", label: "Doutorado" }
  { value: "mba", label: "MBA" }

Nova constante MODALIDADE_OPTIONS:
  { value: "presencial", label: "Presencial" }
  { value: "hibrido", label: "Híbrido" }
  { value: "remoto", label: "Remoto" }
```

**Mapeamento no handleFileSelect:**

Experiencias: adicionar `modalidade: "presencial" as const` ao mapeamento.

Formacoes: remover `area: edu.field || ""` do mapeamento.

**ExperienceReviewCard:**

Adicionar novo Select de "Modalidade" logo apos o Select de "Tipo de contrato", usando `MODALIDADE_OPTIONS`. Colocar ambos os Selects em um grid de 2 colunas para aproveitar espaco.

**EducationReviewCard:**

Remover o Input de "Area" completamente. Ajustar o grid: "Titulo / Nome do curso" passa a ocupar largura total (nao mais em grid de 2 colunas com Area).

---

### Arquivo 2: `src/components/experience/ExperienceModal.tsx`

**Schema Zod (linha 24):**

Alterar de:

```text
tipo_emprego: z.enum(["clt", "pj", "freelancer", "estagio"], {
```

Para:

```text
tipo_emprego: z.enum(["clt", "pj", "freelancer", "estagio", "tempo_integral"], {
```

**Schema Zod (linha 30):**

Alterar de:

```text
remoto: z.boolean().default(false),
```

Para:

```text
remoto: z.enum(["presencial", "hibrido", "remoto"]).default("presencial"),
```

**Refines (linhas 36-60):**

Atualizar as condicoes de `!data.remoto` (boolean) para `data.remoto !== "remoto"` — exigir estado e cidade quando modalidade nao for "remoto".

**Default values (linha 134):**

Alterar `remoto: false` para `remoto: "presencial"`.

**Options array (linhas 91-96):**

Adicionar `{ value: "tempo_integral", label: "Tempo integral" }` ao array `tipoEmpregoOptions`.

**UI do campo remoto:**

O checkbox de "Trabalho remoto" precisa ser substituido por um Select com as opcoes de modalidade. Isso requer localizar o Checkbox de remoto no JSX e trocar por um Select. (Essa alteracao de UI no ExperienceModal e necessaria para manter consistencia, mas o prompt diz "nao alterar nenhum outro componente" — vou incluir apenas as mudancas no schema e defaults que sao obrigatorias para o build nao quebrar. A UI do modal pode ser ajustada em outra task se preferir.)

**DECISAO:** Alterar o schema, defaults e refines no ExperienceModal para o build funcionar. A UI do campo remoto (trocar Checkbox por Select) pode ser feita agora ou em outra task — vou incluir no plano pois o tipo mudou de boolean para enum e o Checkbox vai parar de funcionar corretamente sem a troca. Aprovado, pode mudar

---

### Arquivo 3: `src/components/education/EducationModal.tsx`

**Schema Zod (linha 22):**

Alterar de:

```text
tipo: z.enum(["graduacao", "pos", "tecnico", "curso", "certificacao"], {
```

Para:

```text
tipo: z.enum(["graduacao", "pos", "tecnico", "curso", "certificacao", "ensino_medio", "mestrado", "doutorado", "mba"], {
```

**Options array (linhas 49-55):**

Adicionar os 4 novos valores ao array `tipoEducacaoOptions`:

```text
{ value: "ensino_medio", label: "Ensino médio" }
{ value: "mestrado", label: "Mestrado" }
{ value: "doutorado", label: "Doutorado" }
{ value: "mba", label: "MBA" }
```

---

### Arquivo 4: `src/pages/studio/JobForm.tsx`

**Schema Zod (linha 43):**

Alterar de:

```text
tipo_contrato: z.enum(["clt", "pj", "freelancer", "estagio"]),
```

Para:

```text
tipo_contrato: z.enum(["clt", "pj", "freelancer", "estagio", "tempo_integral"]),
```

O campo `remoto` na linha 44 ja usa `z.enum(["presencial", "hibrido", "remoto"])` — nao precisa de alteracao.

---

### Arquivos tocados


| Arquivo                                         | Acao                                                   |
| ----------------------------------------------- | ------------------------------------------------------ |
| `src/components/ImportReviewDrawer.tsx`         | Editar (tipos, constantes, mapeamento, cards)          |
| `src/components/experience/ExperienceModal.tsx` | Editar (schema, options, defaults, refines, UI remoto) |
| `src/components/education/EducationModal.tsx`   | Editar (schema, options)                               |
| `src/pages/studio/JobForm.tsx`                  | Editar (schema)                                        |


### O que NAO muda

- Estado "instructions" do drawer
- Hook `useImportLinkedIn`
- Edge Function
- `Profile.tsx`
- `ImportSection.tsx`
- Nenhuma biblioteca nova