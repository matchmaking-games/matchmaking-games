import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseStudioCTAReturn {
  showCTA: boolean;
  isLoading: boolean;
  dismiss: () => Promise<void>;
}

export function useStudioCTA(): UseStudioCTAReturn {
  const [showCTA, setShowCTA] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (!cancelled) { setShowCTA(false); setIsLoading(false); }
          return;
        }

        const uid = session.user.id;

        const [membrosResult, dismissedResult] = await Promise.all([
          supabase
            .from("estudio_membros")
            .select("id")
            .eq("user_id", uid)
            .eq("ativo", true)
            .limit(1),
          supabase
            .from("user_ui_states")
            .select("key")
            .eq("user_id", uid)
            .eq("key", "studio_cta_dismissed")
            .limit(1),
        ]);

        if (cancelled) return;

        if (membrosResult.error || dismissedResult.error) {
          setShowCTA(false);
        } else {
          const hasMembership = (membrosResult.data?.length ?? 0) > 0;
          const wasDismissed = (dismissedResult.data?.length ?? 0) > 0;
          setShowCTA(!hasMembership && !wasDismissed);
        }
      } catch (err) {
        console.error("useStudioCTA check error:", err);
        if (!cancelled) setShowCTA(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    check();
    return () => { cancelled = true; };
  }, []);

  const dismiss = async () => {
    setShowCTA(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await supabase
        .from("user_ui_states")
        .insert({ user_id: session.user.id, key: "studio_cta_dismissed" });
    } catch (err) {
      console.error("useStudioCTA dismiss error:", err);
    }
  };

  return { showCTA, isLoading, dismiss };
}
