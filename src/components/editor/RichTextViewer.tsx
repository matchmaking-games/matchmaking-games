import { useMemo } from "react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { schema } from "./schema";

interface RichTextViewerProps {
  content: string | null;
}

export function RichTextViewer({ content }: RichTextViewerProps) {
  const parsedContent = useMemo(() => {
    if (!content) return undefined;
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

  if (!content) return null;

  return (
    <BlockNoteView
      editor={editor}
      editable={false}
    />
  );
}
