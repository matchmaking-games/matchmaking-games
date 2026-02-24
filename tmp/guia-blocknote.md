# Guia Completo: Editor BlockNote com ShadCN

Este documento contém todas as instruções e aprendizados necessários para replicar o editor BlockNote corretamente em outro projeto Lovable. Foi criado a partir de testes realizados neste app de laboratório.

---

## 📦 Dependências Necessárias

```
@blocknote/core ^0.46.2
@blocknote/react ^0.46.2
@blocknote/shadcn ^0.46.2
lucide-react (já incluso em projetos Lovable)
```

---

## 🏗️ Arquitetura dos Arquivos

```
src/components/editor/
├── schema.ts           # Schema customizado com blocos permitidos
├── YouTubeBlock.tsx     # Bloco customizado para embeds do YouTube
├── RichTextEditor.tsx   # Editor completo (edição)
└── RichTextViewer.tsx   # Visualizador somente leitura
```

---

## 📋 Instruções Passo a Passo

### 1. Schema Customizado (`schema.ts`)

O schema define **quais blocos estão disponíveis** no editor. Blocos não listados aqui NÃO aparecerão.

**Importante:** Removemos `table` do schema porque não era necessário. Se quiser tabelas, adicione `table: defaultBlockSpecs.table`.

```ts
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { YouTubeBlock } from "./YouTubeBlock";

export const schema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: defaultBlockSpecs.paragraph,
    heading: defaultBlockSpecs.heading,
    bulletListItem: defaultBlockSpecs.bulletListItem,
    numberedListItem: defaultBlockSpecs.numberedListItem,
    checkListItem: defaultBlockSpecs.checkListItem,
    codeBlock: defaultBlockSpecs.codeBlock,
    quote: defaultBlockSpecs.quote,
    image: defaultBlockSpecs.image,
    // table: defaultBlockSpecs.table,  // removido intencionalmente
    youtube: YouTubeBlock(),
  },
});

export type EditorSchema = typeof schema;
```

---

### 2. Bloco YouTube Customizado (`YouTubeBlock.tsx`)

Bloco que renderiza um input para colar URL do YouTube e exibe o iframe quando a URL é válida.

```tsx
import { createReactBlockSpec } from "@blocknote/react";

export const YouTubeBlock = createReactBlockSpec(
  {
    type: "youtube" as const,
    propSchema: {
      url: { default: "" },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const url = block.props.url;

      const getEmbedUrl = (rawUrl: string) => {
        try {
          const u = new URL(rawUrl);
          let videoId = "";
          if (u.hostname.includes("youtube.com")) {
            videoId = u.searchParams.get("v") || "";
          } else if (u.hostname.includes("youtu.be")) {
            videoId = u.pathname.slice(1);
          }
          return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        } catch {
          return null;
        }
      };

      const embedUrl = url ? getEmbedUrl(url) : null;

      if (!embedUrl) {
        return (
          <div className="p-4 border rounded-md bg-muted/30">
            <p className="text-sm text-muted-foreground mb-2">
              Cole a URL do YouTube:
            </p>
            <input
              className="w-full px-3 py-2 border rounded-md text-sm bg-background"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => {
                editor.updateBlock(block, {
                  props: { url: e.target.value },
                });
              }}
            />
          </div>
        );
      }

      return (
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-md"
            src={embedUrl}
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    },
  }
);
```

---

### 3. Editor Principal (`RichTextEditor.tsx`)

Este é o componente mais complexo. Contém **três correções críticas** documentadas abaixo.

```tsx
import { useCallback, useMemo } from "react";
import { BlockNoteView } from "@blocknote/shadcn";
import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  DefaultReactSuggestionItem,
  SideMenuController,
  SideMenu,
  DragHandleButton,
  useBlockNoteEditor,
  useComponentsContext,
  useExtension,
  useExtensionState,
} from "@blocknote/react";
import {
  filterSuggestionItems,
  insertOrUpdateBlockForSlashMenu,
  SideMenuExtension,
  SuggestionMenu,
} from "@blocknote/core/extensions";
import { Plus, Youtube } from "lucide-react";
import React from "react";
import { schema } from "./schema";

// --- Item customizado do YouTube para o slash menu ---
const insertYouTube = (
  editor: any
): DefaultReactSuggestionItem => ({
  title: "YouTube",
  icon: React.createElement(Youtube, { size: 18 }),
  subtext: "Incorporar vídeo do YouTube",
  group: "Mídia",
  onItemClick: () => {
    insertOrUpdateBlockForSlashMenu(editor, {
      type: "youtube",
      props: { url: "" },
    } as any);
  },
  aliases: ["youtube", "video", "yt"],
});

// --- CORREÇÃO #1: Botão "+" customizado ---
// O AddBlockButton padrão do BlockNote tem um bug com o tema shadcn:
// o onClick é atribuído ao SVG interno ao invés do componente Button.
// Este componente corrige isso passando onClick como prop do Button.
function CustomAddBlockButton() {
  const Components = useComponentsContext()!;
  const editor = useBlockNoteEditor<any, any, any>();
  const suggestionMenu = useExtension(SuggestionMenu);
  const block = useExtensionState(SideMenuExtension, {
    editor,
    selector: (state) => state?.block,
  });

  const onClick = useCallback(() => {
    if (block === undefined) return;
    const blockContent = block.content;
    const isBlockEmpty =
      blockContent !== undefined &&
      Array.isArray(blockContent) &&
      blockContent.length === 0;

    if (isBlockEmpty) {
      editor.setTextCursorPosition(block);
      suggestionMenu.openSuggestionMenu("/");
    } else {
      const insertedBlock = editor.insertBlocks(
        [{ type: "paragraph" }],
        block,
        "after"
      )[0];
      editor.setTextCursorPosition(insertedBlock);
      suggestionMenu.openSuggestionMenu("/");
    }
  }, [block, editor, suggestionMenu]);

  if (block === undefined) return null;

  return (
    <Components.SideMenu.Button
      className="bn-button"
      label="Add block"
      icon={<Plus size={24} data-test="dragHandleAdd" />}
      onClick={onClick}
    />
  );
}

interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

export function RichTextEditor({ initialContent, onChange }: RichTextEditorProps) {
  const parsedContent = useMemo(() => {
    if (!initialContent) return undefined;
    try {
      return JSON.parse(initialContent);
    } catch {
      return undefined;
    }
  }, [initialContent]);

  const editor = useCreateBlockNote({
    schema,
    initialContent: parsedContent,
    placeholders: {
      default: "Escreva algo ou digite '/' para ver os comandos...",
    },
  });

  return (
    <BlockNoteView
      editor={editor}
      theme="light"
      onChange={() => {
        onChange?.(JSON.stringify(editor.document));
      }}
      slashMenu={false}   // desabilita o slash menu padrão
      sideMenu={false}    // desabilita o side menu padrão
    >
      {/* --- CORREÇÃO #2 e #3: Slash menu customizado --- */}
      <SuggestionMenuController
        triggerCharacter="/"
        getItems={async (query) => {
          const defaults = getDefaultReactSlashMenuItems(editor as any)
            // CORREÇÃO #3a: Remove itens indesejados (ex: Table)
            .filter((item) => item.title !== "Table")
            // CORREÇÃO #2: Renomeia grupo "Media" → "Mídia"
            // Sem isso, Image fica em "Media" e YouTube em "Mídia" (grupos separados)
            .map((item) => (item.group === "Media" ? { ...item, group: "Mídia" } : item));

          // CORREÇÃO #3b: Insere YouTube ADJACENTE ao Image
          // O slash menu agrupa itens CONSECUTIVOS com o mesmo group.
          // Se YouTube ficar no final do array, aparece num grupo "Mídia" separado.
          let mediaIndex = -1;
          for (let i = defaults.length - 1; i >= 0; i--) {
            if (defaults[i].group === "Mídia") { mediaIndex = i; break; }
          }
          const allItems = [...defaults];
          allItems.splice(mediaIndex + 1, 0, insertYouTube(editor));
          return filterSuggestionItems(allItems, query);
        }}
      />

      {/* --- CORREÇÃO #1: Side menu customizado --- */}
      <SideMenuController
        sideMenu={() => (
          <SideMenu>
            <CustomAddBlockButton />
            <DragHandleButton />
          </SideMenu>
        )}
      />
    </BlockNoteView>
  );
}
```

---

### 4. Visualizador Somente Leitura (`RichTextViewer.tsx`)

Componente simples que renderiza o conteúdo sem permitir edição:

```tsx
import { useMemo } from "react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";
import { schema } from "./schema";

interface RichTextViewerProps {
  content: string;
}

export function RichTextViewer({ content }: RichTextViewerProps) {
  const parsedContent = useMemo(() => {
    try {
      return JSON.parse(content);
    } catch {
      return undefined;
    }
  }, [content]);

  const editor = useCreateBlockNote({
    schema,
    initialContent: parsedContent,
  });

  return (
    <BlockNoteView
      editor={editor}
      editable={false}
      theme="light"
    />
  );
}
```

---

## 🐛 Resumo das 3 Correções Críticas

### Correção #1: Botão "+" não funciona (bug do shadcn)

| | Detalhe |
|---|---|
| **Problema** | O `AddBlockButton` padrão do BlockNote atribui o `onClick` ao elemento SVG interno, e não ao componente `<Button>` do shadcn. O shadcn espera receber `onClick` como prop do botão. |
| **Por que funciona no site oficial** | O site oficial usa o tema **Mantine**, que propaga eventos de clique de forma diferente. |
| **Solução** | Criar `CustomAddBlockButton` que usa `useExtension(SuggestionMenu)` e chama `suggestionMenu.openSuggestionMenu("/")` no `onClick` passado como **prop do `<Components.SideMenu.Button>`**. |
| **Props necessárias no BlockNoteView** | `sideMenu={false}` + `<SideMenuController>` customizado |

### Correção #2: Itens de mídia em grupos separados

| | Detalhe |
|---|---|
| **Problema** | Os itens padrão do BlockNote usam `group: "Media"` (inglês). Itens customizados com `group: "Mídia"` (português) ficam em grupos visuais separados. |
| **Solução** | Fazer `.map()` nos itens padrão e renomear `group: "Media"` → `group: "Mídia"` antes de adicionar itens customizados. |

### Correção #3: YouTube aparece em grupo "Mídia" separado do Image

| | Detalhe |
|---|---|
| **Problema** | Mesmo com o mesmo nome de grupo, o slash menu agrupa apenas itens **consecutivos** no array. Se YouTube for adicionado no final com `[...defaults, insertYouTube()]`, ele fica separado do Image. |
| **Solução** | Encontrar o último item com `group: "Mídia"` (Image) e inserir YouTube **logo depois dele** usando `splice()`. |

---

## 📌 O Que Pedir ao Lovable

Cole estas instruções ao criar o editor no seu app principal:

> **Crie um editor BlockNote usando `@blocknote/shadcn` com as seguintes configurações:**
>
> 1. **Schema customizado** em `schema.ts` com os blocos: paragraph, heading, bulletListItem, numberedListItem, checkListItem, codeBlock, quote, image, e um bloco customizado YouTube. **NÃO inclua table.**
>
> 2. **Bloco YouTube** (`YouTubeBlock.tsx`) usando `createReactBlockSpec` com prop `url`, que renderiza um input quando vazio e um iframe 16:9 quando tem URL válida.
>
> 3. **Botão "+" customizado**: Crie um `CustomAddBlockButton` que use `useExtension(SuggestionMenu)` e chame `suggestionMenu.openSuggestionMenu("/")` no `onClick` do `<Components.SideMenu.Button>`. **NÃO use o AddBlockButton padrão** pois tem um bug com shadcn onde o onClick é atribuído ao SVG interno.
>
> 4. **Slash menu customizado**: No `SuggestionMenuController`, faça `.filter()` para remover "Table", `.map()` para renomear `group: "Media"` → `group: "Mídia"`, e insira o item YouTube **adjacente** ao Image usando `splice()` (não no final do array).
>
> 5. **Ícone do YouTube**: Use `React.createElement(Youtube, { size: 18 })` do lucide-react como `icon` no item do slash menu.
>
> 6. Use `BlockNoteView` de `@blocknote/shadcn` (não `BlockNoteViewRaw`), com `slashMenu={false}` e `sideMenu={false}`.

---

## ⚠️ Armadilhas Comuns

1. **Nunca use `BlockNoteViewRaw`** — sempre use `BlockNoteView` de `@blocknote/shadcn`
2. **Nunca use o `AddBlockButton` padrão** com tema shadcn — sempre crie um customizado
3. **Nunca adicione itens customizados no final do array** do slash menu se quiser que fiquem no mesmo grupo visual
4. **Sempre renomeie os grupos** dos itens padrão se quiser nomes em português
5. **Sempre adicione `icon`** aos itens customizados do slash menu para manter alinhamento visual
