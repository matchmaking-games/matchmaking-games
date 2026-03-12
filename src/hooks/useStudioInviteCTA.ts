import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseStudioInviteCTAReturn {
  showCTA: boolean;
  isLoading: boolean;
  dismiss: () => Promise<void>;
}

const NOOP_RETURN: UseStudioInviteCTAReturn = {
  showCTA: false,
  isLoading: false,
  dismiss: async () => {},
};

export function useStudioInviteCTA(estudioId: string | null): UseStudioInviteCTAReturn {
  const [showCTA, setShowCTA] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!estudioId) {
      setShowCTA(false);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function check() {
      try {
        setIsLoading(true);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (!cancelled) { setShowCTA(false); setIsLoading(false); }
          return;
        }

        const uid = session.user.id;

        const [superAdminRes, countRes, dismissedRes] = await Promise.all([
          supabase
            .from("estudio_membros")
            .select("id")
            .eq("estudio_id", estudioId)
            .eq("user_id", uid)
            .eq("role", "super_admin")
            .eq("ativo", true)
            .limit(1),
          supabase
            .from("estudio_membros")
            .select("id", { count: "exact", head: true })
            .eq("estudio_id", estudioId)
            .eq("ativo", true),
          supabase
            .from("user_ui_states")
            .select("key")
            .eq("user_id", uid)
            .eq("key", "studio_invite_cta_dismissed")
            .limit(1),
        ]);

        if (cancelled) return;

        if (superAdminRes.error || countRes.error || dismissedRes.error) {
          setShowCTA(false);
        } else {
          const isSuperAdmin = (superAdminRes.data?.length ?? 0) > 0;
          const memberCount = countRes.count ?? 0;
          const wasDismissed = (dismissedRes.data?.length ?? 0) > 0;
          setShowCTA(isSuperAdmin && memberCount === 1 && !wasDismissed);
        }
      } catch (err) {
        console.error("useStudioInviteCTA check error:", err);
        if (!cancelled) setShowCTA(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    check();
    return () => { cancelled = true; };
  }, [estudioId]);

  const dismiss = async () => {
    setShowCTA(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await supabase
        .from("user_ui_states")
        .insert({ user_id: session.user.id, key: "studio_invite_cta_dismissed" });
    } catch (err) {
      console.error("useStudioInviteCTA dismiss error:", err);
    }
  };

  if (!estudioId) return NOOP_RETURN;

  return { showCTA, isLoading, dismiss };
}
