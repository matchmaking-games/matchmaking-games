import { useCallback } from "react";
import imageCompression from "browser-image-compression";
import { supabase } from "@/integrations/supabase/client";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function useProjectImageUpload() {
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error("Tipo de arquivo não permitido. Use JPG, PNG ou WebP.");
    }

    const compressed = await imageCompression(file, {
      maxSizeMB: 3,
      maxWidthOrHeight: 2560,
      useWebWorker: true,
      initialQuality: 0.85,
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Usuário não autenticado.");
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("project-images")
      .upload(path, compressed, { upsert: false });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("project-images")
      .getPublicUrl(path);

    return publicUrl;
  }, []);

  return { uploadFile };
}
