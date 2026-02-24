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
          return videoId ? "https://www.youtube.com/embed/" + videoId : null;
        } catch {
          return null;
        }
      };

      const embedUrl = url ? getEmbedUrl(url) : null;

      if (!embedUrl) {
        return (
          <div className="rounded-lg border border-border bg-card p-4">
            <label className="mb-2 block text-sm font-medium text-muted-foreground">
              Cole a URL do YouTube:
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
        <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute inset-0 h-full w-full"
            src={embedUrl}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    },
  }
);
