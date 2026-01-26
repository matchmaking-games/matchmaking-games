import { useState, useRef, useCallback } from "react";
import { ImagePlus, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ProjectImageUploadProps {
  userId: string;
  projectId: string | null;
  currentImageUrl: string | null;
  onImageUploaded: (url: string | null, usedProjectId: string) => void;
  disabled?: boolean;
}

const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Formato não suportado. Use JPG, PNG ou WEBP." };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "Arquivo muito grande. Máximo 10MB." };
  }

  return { valid: true };
};

export function ProjectImageUpload({
  userId,
  projectId,
  currentImageUrl,
  onImageUploaded,
  disabled,
}: ProjectImageUploadProps) {
  // Generate temp UUID if new project
  const tempProjectIdRef = useRef<string>(projectId || crypto.randomUUID());
  const uploadProjectId = projectId || tempProjectIdRef.current;

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview with prop changes
  if (currentImageUrl !== previewUrl && !isUploading) {
    setPreviewUrl(currentImageUrl);
  }

  const handleUpload = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    setError(null);
    setIsUploading(true);

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/${uploadProjectId}/cover.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("project-images")
        .getPublicUrl(path);

      // Add cache buster to force refresh
      const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;
      setPreviewUrl(urlWithCacheBuster);
      onImageUploaded(urlWithCacheBuster, uploadProjectId);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Erro ao enviar imagem. Tente novamente.");
      setPreviewUrl(currentImageUrl); // Revert to original
    } finally {
      setIsUploading(false);
      // Clean up local preview URL
      URL.revokeObjectURL(localPreview);
    }
  };

  const handleRemove = async () => {
    if (!previewUrl) return;

    setIsUploading(true);
    setError(null);

    try {
      // List and delete all files in the project folder
      const { data: files } = await supabase.storage
        .from("project-images")
        .list(`${userId}/${uploadProjectId}`);

      if (files && files.length > 0) {
        const filePaths = files.map((f) => `${userId}/${uploadProjectId}/${f.name}`);
        await supabase.storage.from("project-images").remove(filePaths);
      }

      setPreviewUrl(null);
      onImageUploaded(null, uploadProjectId);
    } catch (err) {
      console.error("Remove error:", err);
      setError("Erro ao remover imagem. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled || isUploading) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleUpload(file);
      }
    },
    [disabled, isUploading]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const openFileDialog = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Imagem de Capa</label>

      <div
        className={cn(
          "relative aspect-video rounded-lg overflow-hidden transition-colors",
          "border-2 border-dashed",
          isDragOver
            ? "border-primary bg-primary/10"
            : previewUrl
              ? "border-transparent"
              : "border-muted-foreground/25 hover:border-muted-foreground/40",
          !previewUrl && "bg-muted cursor-pointer",
          (disabled || isUploading) && "opacity-60 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!previewUrl ? openFileDialog : undefined}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {/* Preview state */}
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Preview do projeto"
              className="w-full h-full object-cover"
            />
            {/* Hover overlay with actions */}
            {!isUploading && !disabled && (
              <div className="absolute inset-0 bg-background/80 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openFileDialog();
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Alterar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <ImagePlus className="h-10 w-10 mb-2" />
            <span className="text-sm">Clique ou arraste para enviar imagem</span>
          </div>
        )}

        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-sm text-foreground">Enviando...</span>
          </div>
        )}
      </div>

      {/* Helper text and error */}
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          JPG, PNG ou WEBP. Máximo 10MB. Proporção 16:9 recomendada.
        </p>
      )}
    </div>
  );
}
