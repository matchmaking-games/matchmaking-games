import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const TIPOS = ["Bugs", "Sugestões", "Dúvidas", "Parcerias", "Outros"] as const;

export const supportFormSchema = z.object({
  tipo: z.enum(TIPOS, { required_error: "Selecione o tipo da mensagem." }),
  mensagem: z
    .string()
    .min(20, "A mensagem deve ter pelo menos 20 caracteres.")
    .max(2000, "A mensagem deve ter no máximo 2000 caracteres."),
});

export type SupportFormData = z.infer<typeof supportFormSchema>;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB

export function validateImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Formato não suportado. Use JPG, PNG, GIF ou WebP.";
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return "A imagem deve ter no máximo 3MB.";
  }
  return null;
}

export function useSupportForm() {
  const { data: user } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const submitForm = async (data: SupportFormData, imagem?: File | null) => {
    if (!user) throw new Error("Usuário não autenticado.");

    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      // Get user email from session
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData.session?.user?.email ?? "";

      const formData = new FormData();
      formData.append("tipo", data.tipo);
      formData.append("mensagem", data.mensagem);
      formData.append("nome", user.nome_completo);
      formData.append("email", email);
      formData.append("user_id", user.id);
      formData.append("origem", window.location.href);
      formData.append("user_agent", navigator.userAgent);

      if (imagem) {
        formData.append("imagem", imagem);
      }

      const { error } = await supabase.functions.invoke("send-support-email", {
        body: formData,
      });

      if (error) throw error;

      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSuccess = () => setIsSuccess(false);

  return { submitForm, isSubmitting, isSuccess, resetSuccess, tipos: TIPOS };
}
