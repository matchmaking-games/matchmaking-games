import { useMemo } from "react";

interface EstudioData {
  id: string;
  slug: string;
  logo_url: string | null;
  sobre: string | null;
  cidade: string | null;
  estado: string | null;
  especialidades: string[] | null;
  website: string | null;
  linkedin_url?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  youtube_url?: string | null;
  twitch_url?: string | null;
  facebook_url?: string | null;
  artstation_url?: string | null;
  dribbble_url?: string | null;
  behance_url?: string | null;
  itch_url?: string | null;
  pinterest_url?: string | null;
  steam_url?: string | null;
  telegram_url?: string | null;
  github_url?: string | null;
}

export interface ProfileCompletionItem {
  label: string;
  complete: boolean;
  href: string;
}

interface UseStudioProfileCompletionReturn {
  profileItems: ProfileCompletionItem[];
  completedCount: number;
  percentage: number;
  incompleteItems: ProfileCompletionItem[];
}

export function useStudioProfileCompletion(estudio: EstudioData | null): UseStudioProfileCompletionReturn {
  return useMemo(() => {
    if (!estudio) {
      return { profileItems: [], completedCount: 0, percentage: 0, incompleteItems: [] };
    }

    const base = `/studio/manage/profile?studio=${estudio.id}`;

    const profileItems: ProfileCompletionItem[] = [
      { label: "Foto do estúdio", complete: !!estudio.logo_url, href: base },
      { label: "Descrição", complete: !!estudio.sobre?.trim(), href: base },
      { label: "Localização", complete: !!estudio.cidade?.trim() && !!estudio.estado?.trim(), href: base },
      { label: "Especialidades", complete: Array.isArray(estudio.especialidades) && estudio.especialidades.length > 0, href: base },
      {
        label: "Website ou rede social",
        complete: [
          estudio.website, estudio.linkedin_url, estudio.instagram_url,
          estudio.twitter_url, estudio.youtube_url, estudio.twitch_url,
          estudio.facebook_url, estudio.artstation_url, estudio.dribbble_url,
          estudio.behance_url, estudio.itch_url, estudio.pinterest_url,
          estudio.steam_url, estudio.telegram_url, estudio.github_url,
        ].some(Boolean),
        href: `${base}#links`,
      },
    ];

    const completedCount = profileItems.filter((i) => i.complete).length;
    const percentage = Math.round((completedCount / profileItems.length) * 100);
    const incompleteItems = profileItems.filter((i) => !i.complete);

    return { profileItems, completedCount, percentage, incompleteItems };
  }, [estudio]);
}
