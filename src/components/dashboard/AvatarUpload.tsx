import { useState, useRef } from "react";
import { Loader2, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  nomeCompleto: string;
  onAvatarUpdated: (newUrl: string) => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const getFileExtension = (mimeType: string) => {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return extensions[mimeType] || "jpg";
};

export function AvatarUpload({
  userId,
  currentAvatarUrl,
  nomeCompleto,
  onAvatarUpdated,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Formato não suportado",
        description: "Use JPG, PNG ou WebP.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE_BYTES) {
      toast({
        title: "Arquivo muito grande",
        description: `Máximo ${MAX_SIZE_MB}MB.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const extension = getFileExtension(file.type);
      const filePath = `${userId}/${userId}.${extension}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          cacheControl: "3600",
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Add timestamp to bust cache
      const newAvatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update user record
      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: newAvatarUrl })
        .eq("id", userId);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(newAvatarUrl);
      onAvatarUpdated(newAvatarUrl);

      toast({
        title: "Sucesso",
        description: "Foto atualizada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar foto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset input so same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 mb-8">
      <div className="relative">
        <Avatar className="h-24 w-24 border border-border">
          <AvatarImage src={avatarUrl || undefined} alt={nomeCompleto} />
          <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
            {getInitials(nomeCompleto || "U")}
          </AvatarFallback>
        </Avatar>

        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload de avatar"
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="text-muted-foreground hover:text-foreground"
      >
        <Camera className="h-4 w-4 mr-2" />
        Alterar foto
      </Button>
    </div>
  );
}
