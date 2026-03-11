

## Plano: Correção crítica do formulário de projetos

### Problema
`SelectItem value=""` causa crash fatal no Radix UI. O formulário de projetos está inacessível.

### Ações

**1. Deletar** `src/components/projects/ProjectForm.tsx` — arquivo órfão, não importado por ninguém.

**2. Corrigir** `src/pages/dashboard/ProjectFormPage.tsx` — 4 alterações cirúrgicas:

| Local | Linha | De | Para |
|---|---|---|---|
| SelectItem Engine | 362 | `value=""` | `value="__none__"` |
| defaultValues | 109 | `engine: ""` | `engine: "__none__"` |
| useEffect reset | 128 | `?? ""` | `?? "__none__"` |
| onSubmit engine | 210 | `values.engine \|\| null` | `values.engine === "__none__" ? null : values.engine \|\| null` |

Linha 355 do Select: `value={field.value || ""}` → `value={field.value || "__none__"}` (para manter consistência).

### Arquivos afetados
- `src/components/projects/ProjectForm.tsx` (deletar)
- `src/pages/dashboard/ProjectFormPage.tsx` (4-5 linhas alteradas)

