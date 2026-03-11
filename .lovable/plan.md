

## Plano: Adicionar campos engine, plataformas, gêneros e Steam ao ProjectFormPage

Único arquivo alterado: `src/pages/dashboard/ProjectFormPage.tsx`

### Mudanças

1. **Imports** (linha 1-23): Adicionar `MultiSelectCombobox` e labels (`ENGINE_LABELS`, `PLATAFORMA_LABELS`, `GENERO_LABELS`)

2. **Schema** (linha 26-37): Adicionar `engine` e `steam_url` ao `projectSchema`:
   - `engine: z.string().optional().or(z.literal(""))`
   - `steam_url: z.union([z.literal(""), z.string().url("URL inválida")]).optional()`

3. **Constantes** (após linha 47): Adicionar `ENGINE_OPTIONS`, `PLATAFORMA_OPTIONS`, `GENERO_OPTIONS`

4. **Estado local** (junto ao `selectedSkillIds`, linha 65):
   - `selectedPlataformas` e `selectedGeneros` como `useState<string[]>([])`

5. **Default values** (linha 86-100): Adicionar `engine: ""` e `steam_url: ""`

6. **useEffect de edição** (linha 103-123): Adicionar `engine` e `steam_url` ao `form.reset`, e `setSelectedPlataformas`/`setSelectedGeneros`

7. **onSubmit** (linha 182-194): Adicionar `engine`, `plataformas`, `genero`, `steam_url` ao `projectData`

8. **Campos visuais** — Inserir entre imagem de capa (linha 322) e seção Tipo/Papel (linha 324):
   - Seção "Detalhes do Jogo" com `h4`
   - `FormField` Select para Engine (com opção "Nenhuma")
   - `MultiSelectCombobox` para Plataformas (com Label, fora do FormField)
   - `MultiSelectCombobox` para Gêneros (com Label, fora do FormField)

9. **Steam URL** — Adicionar após o campo `codigo_url` (linha 463), dentro da seção Links

### Posicionamento dos campos no formulário
```text
Título → Slug → Imagem de Capa
→ [NOVO] Detalhes do Jogo (Engine, Plataformas, Gêneros)
→ Tipo/Papel → Descrição breve → Status
→ Links (Demo, Código, [NOVO] Steam)
→ Skills → Destaque → Rich Text → Botões
```

