import { useState, useRef } from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StudioLogoUploadProps {
  onFileSelected: (file: File) => void;
  previewUrl: string | null;
  error: string | null;
  disabled?: boolean;
}

export function StudioLogoUpload({
  onFileSelected,
  previewUrl,
  error,
  disabled,
}: StudioLogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        Logo do estúdio *
      </label>

      <div
        className={cn(
          "relative w-32 h-32 mx-auto rounded-xl overflow-hidden transition-colors cursor-pointer",
          "border-2 border-dashed",
          isDragOver
            ? "border-primary bg-primary/10"
            : previewUrl
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/40 bg-muted/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Preview do logo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-background/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button type="button" variant="secondary" size="sm">
                Trocar
              </Button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <ImagePlus className="h-8 w-8 mb-2" />
            <span className="text-xs text-center px-2">Clique para selecionar</span>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        JPG, PNG ou WebP - Máximo 3MB
      </p>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  );
}
