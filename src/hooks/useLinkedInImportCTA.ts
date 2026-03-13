import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseLinkedInImportCTAReturn {
  showCTA: boolean;
  isLoading: boolean;
  dismiss: () => Promise<void>;
}

export function useLinkedInImportCTA(): UseLinkedInImportCTAReturn {
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

        const { data, error } = await supabase
          .from("user_ui_states")
          .select("key")
          .eq("user_id", uid)
          .eq("key", "linkedin_import_cta_dismissed")
          .limit(1);

        if (cancelled) return;

        if (error) {
          setShowCTA(false);
        } else {
          const wasDismissed = (data?.length ?? 0) > 0;
          setShowCTA(!wasDismissed);
        }
      } catch (err) {
        console.error("useLinkedInImportCTA check error:", err);
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
        .insert({ user_id: session.user.id, key: "linkedin_import_cta_dismissed" });
    } catch (err) {
      console.error("useLinkedInImportCTA dismiss error:", err);
    }
  };

  return { showCTA, isLoading, dismiss };
}
