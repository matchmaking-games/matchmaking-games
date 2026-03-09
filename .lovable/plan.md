
I have read the full file (562 lines). Here is the exact plan with precise line numbers.

## Current state audit

**Schema issues (lines 41-74):**
- `descricao`: optional + `.or(z.literal(""))` — needs to become required with min(10)/max(1000)
- `link_externo`: optional + custom refine — needs to become `z.string().min(1).url()`
- `superRefine` (lines 76-93): only validates `estado` and `cidade` — needs to also validate `endereco`

**Labels — none have asterisks yet:**
- Line 261: `Nome do evento`
- Line 279: `Descrição`
- Line 306: `Período do evento`
- Line 359: `Horário de início`
- Line 378: `Horário de fim`
- Line 400: `Modalidade`
- Line 431: `Estado` (conditional)
- Line 463: `Cidade` (conditional)
- Line 500: `Endereço` (conditional)
- Line 523: `Link para mais detalhes`

**FormMessage audit — all present:**
- `nome`: line 268 ✓
- `descricao`: line 295 ✓ (after char counter div — correct)
- `dateRange`: line 347 ✓
- `horario_inicio`: line 369 ✓ (below TimeSelect, after BRT note — correct)
- `horario_fim`: line 388 ✓
- `modalidade`: line 416 ✓
- `estado`: line 452 ✓
- `cidade`: line 488 ✓
- `endereco`: line 510 ✓
- `link_externo`: line 530 ✓

All FormMessages are in place. No CSS is hiding them. Only schema + asterisks need changing.

## Changes

### 1. Schema — lines 41-93

Replace `descricao` field (lines 41-45):
```ts
descricao: z
  .string()
  .min(10, "A descrição deve ter pelo menos 10 caracteres")
  .max(1000, "A descrição deve ter no máximo 1000 caracteres"),
```

Replace `link_externo` field (lines 67-74):
```ts
link_externo: z
  .string()
  .min(1, "Informe o link do evento")
  .url("Informe uma URL válida (ex: https://...)"),
```

Replace `superRefine` body (lines 76-93) to add `endereco` validation:
```ts
.superRefine((data, ctx) => {
  if (data.modalidade !== "online") {
    if (!data.estado) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Selecione o estado", path: ["estado"] });
    }
    if (!data.cidade) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Selecione a cidade", path: ["cidade"] });
    }
    if (!data.endereco) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe o endereço do evento", path: ["endereco"] });
    }
  }
});
```

Also update `defaultValues` — `descricao: ""` will now fail validation on submit (min 10), which is correct. No change needed to defaultValues.

### 2. Asterisks — 10 label changes

Each `<FormLabel>Text</FormLabel>` becomes `<FormLabel>Text<span className="text-destructive ml-1">*</span></FormLabel>`:

| Line | Label |
|------|-------|
| 261 | Nome do evento |
| 279 | Descrição |
| 306 | Período do evento |
| 359 | Horário de início |
| 378 | Horário de fim |
| 400 | Modalidade |
| 431 | Estado |
| 463 | Cidade |
| 500 | Endereço |
| 523 | Link para mais detalhes |

### 3. No FormMessage changes needed
All 10 fields already have `<FormMessage />` in the correct position.

### Files modified
Only `src/pages/dashboard/EventForm.tsx`.
