import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAccountSettings() {
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const updateEmail = async (newEmail: string): Promise<{ error: string | null }> => {
    setIsUpdatingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) return { error: error.message };
      return { error: null };
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: error.message };
      return { error: null };
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return {
    updateEmail,
    updatePassword,
    isUpdatingEmail,
    isUpdatingPassword,
  };
}
