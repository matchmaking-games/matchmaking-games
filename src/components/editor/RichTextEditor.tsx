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
import { useProjectImageUpload } from "@/hooks/useProjectImageUpload";

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

  const { uploadFile } = useProjectImageUpload();

  const editor = useCreateBlockNote({
    schema,
    initialContent: parsedContent,
    uploadFile,
    placeholders: {
      default: "Escreva algo ou digite '/' para ver os comandos...",
    },
  });

  return (
    <BlockNoteView
      editor={editor}
      onChange={() => {
        onChange?.(JSON.stringify(editor.document));
      }}
      slashMenu={false}
      sideMenu={false}
    >
      {/* --- CORREÇÃO #2 e #3: Slash menu customizado --- */}
      <SuggestionMenuController
        triggerCharacter="/"
        getItems={async (query) => {
          const defaults = getDefaultReactSlashMenuItems(editor as any)
            .filter((item) => item.title !== "Table")
            .map((item) => (item.group === "Media" ? { ...item, group: "Mídia" } : item));

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
