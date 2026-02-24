

## TASK-903: Criar RichTextEditor.tsx

Criacao de um unico arquivo novo: `src/components/editor/RichTextEditor.tsx`. Nenhum arquivo existente sera alterado.

---

### O que sera criado

O componente `RichTextEditor` com as seguintes caracteristicas:

**Props:**
- `initialContent?: string` — conteudo JSON do editor (para edicao)
- `onChange?: (content: string) => void` — callback chamado a cada alteracao

**Funcionalidades:**
- Usa o schema customizado de `./schema.ts` (ja existente)
- Placeholder em portugues: "Escreva algo ou digite '/' para ver os comandos..."
- Slash menu e side menu customizados (desabilitados os padroes via props)

**Tres correcoes criticas do guia:**

1. **CustomAddBlockButton** — Componente interno que substitui o `AddBlockButton` padrao do BlockNote. O padrao tem bug com shadcn onde o `onClick` e atribuido ao SVG interno. A solucao usa `useExtension(SuggestionMenu)` e passa `onClick` como prop do `Components.SideMenu.Button`.

2. **Renomear grupo "Media" para "Midia"** — Os itens padrao usam `group: "Media"` (ingles). Sem o `.map()` para renomear, Image e YouTube ficariam em grupos visuais separados.

3. **Inserir YouTube adjacente ao Image via splice()** — O slash menu agrupa apenas itens consecutivos com o mesmo group. Se YouTube for adicionado no final do array, aparece em grupo separado do Image.

**Diferenca em relacao ao guia:** A prop `theme` NAO sera passada ao `BlockNoteView`. O app usa dark mode via CSS variables do shadcn/ui e o editor herda o tema automaticamente.

---

### Detalhes tecnicos

**Imports necessarios:**
- `BlockNoteView` de `@blocknote/shadcn`
- `useCreateBlockNote`, `SuggestionMenuController`, `getDefaultReactSlashMenuItems`, `SideMenuController`, `SideMenu`, `DragHandleButton`, `useBlockNoteEditor`, `useComponentsContext`, `useExtension`, `useExtensionState` de `@blocknote/react`
- `filterSuggestionItems`, `insertOrUpdateBlockForSlashMenu`, `SideMenuExtension`, `SuggestionMenu` de `@blocknote/core/extensions`
- `Plus`, `Youtube` de `lucide-react`
- `schema` de `./schema`

**Estrutura do componente:**
- `insertYouTube()` — funcao factory que retorna o item do slash menu para YouTube
- `CustomAddBlockButton` — componente interno com a correcao do botao "+"
- `RichTextEditor` — componente principal exportado

**BlockNoteView final:**
```text
<BlockNoteView
  editor={editor}
  onChange={...}
  slashMenu={false}
  sideMenu={false}
>
  <SuggestionMenuController ... />
  <SideMenuController ... />
</BlockNoteView>
```

### O que NAO muda
- `schema.ts`
- `YouTubeBlock.tsx`
- Nenhum outro arquivo do projeto

