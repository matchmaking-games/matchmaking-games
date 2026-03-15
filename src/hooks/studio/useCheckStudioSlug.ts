import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/shared/useDebounce";

interface SlugCheckResult {
  isChecking: boolean;
  isAvailable: boolean | null;
  error: string | null;
}

export function useCheckStudioSlug(slug: string, isValid: boolean): SlugCheckResult {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedSlug = useDebounce(slug, 500);

  useEffect(() => {
    // Não verificar se slug vazio ou inválido
    if (!debouncedSlug || !isValid) {
      setIsAvailable(null);
      setIsChecking(false);
      return;
    }

    const checkAvailability = async () => {
      setIsChecking(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc(
        "check_studio_slug_availability",
        { slug_to_check: debouncedSlug }
      );

      if (rpcError) {
        console.error("Error checking studio slug:", rpcError);
        setError("Erro ao verificar disponibilidade");
        setIsAvailable(false);
      } else {
        setIsAvailable(data);
      }

      setIsChecking(false);
    };

    checkAvailability();
  }, [debouncedSlug, isValid]);

  return { isChecking, isAvailable, error };
}
