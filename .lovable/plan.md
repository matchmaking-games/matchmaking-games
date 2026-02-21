

## Criar `src/utils/dateFormat.ts`

Criar um unico arquivo novo com 4 funcoes utilitarias puras para conversao e validacao de datas ISO / brasileiro.

### Funcoes exportadas

| Funcao | Input | Output | Uso |
|---|---|---|---|
| `formatBrazilianDate` | `"2022-09"` / `null` / `""` | `"09/2022"` / `"Atual"` | Inputs e formularios |
| `formatDisplayDate` | `"2022-09"` / `null` / `""` | `"set/2022"` / `"Atual"` | Cards, perfil publico, revisao |
| `parseToIsoDate` | `"09/2022"` / `"Atual"` / `""` | `"2022-09"` / `null` | Salvar no banco |
| `isValidBrazilianDate` | `"09/2022"` / `"9/2022"` | `true` / `false` | Validacao de formulario |

### Detalhes

- Zero dependencias externas (sem date-fns, Intl, dayjs)
- Array `MONTHS` hardcodado: `['jan', 'fev', 'mar', ...]`
- JSDoc com exemplos de input/output em cada funcao
- `parseToIsoDate` emite `console.warn` para inputs invalidos
- `isValidBrazilianDate` exige zero a esquerda (rejeita `"9/2022"`)
- TypeScript strict, sem `any`

### Arquivos

- **Criar:** `src/utils/dateFormat.ts`
- Nenhum arquivo existente sera modificado

