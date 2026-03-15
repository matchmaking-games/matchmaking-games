import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Status = "loading" | "ready" | "error" | "success";

export function useResetPassword() {
  const [status, setStatus] = useState<Status>("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStatus((prev) => (prev === "loading" ? "error" : prev));
    }, 10000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStatus("ready");
        clearTimeout(timeout);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const updatePassword = async (password: string) => {
    setIsSubmitting(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("Não foi possível atualizar a senha. Tente novamente.");
      setIsSubmitting(false);
      return;
    }

    setStatus("success");
    setIsSubmitting(false);
  };

  return { status, isSubmitting, error, updatePassword, setError };
}
