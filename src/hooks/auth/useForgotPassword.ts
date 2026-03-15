import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const sendResetEmail = async (email: string) => {
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError("Não foi possível enviar o email. Tente novamente.");
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    setIsLoading(false);
  };

  return { isLoading, error, isSuccess, sendResetEmail, setError };
}
