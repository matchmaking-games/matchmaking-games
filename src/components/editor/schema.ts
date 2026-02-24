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
    youtube: YouTubeBlock(),
  },
});

export type EditorSchema = typeof schema;
