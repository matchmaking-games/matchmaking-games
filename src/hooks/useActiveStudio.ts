import { useSearchParams } from "react-router-dom";
import { useStudioMembership, StudioMembership } from "./useStudioMembership";

interface UseActiveStudioReturn {
  studios: StudioMembership[];
  activeStudio: StudioMembership | null;
  setActiveStudio: (studioId: string) => void;
  isLoading: boolean;
}

export function useActiveStudio(): UseActiveStudioReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const { studios, isLoading } = useStudioMembership();

  const studioId = searchParams.get("studio");

  const activeStudio =
    studios.find((s) => s.estudio.id === studioId) || studios[0] || null;

  const setActiveStudio = (newStudioId: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("studio", newStudioId);
      return next;
    });
  };

  return {
    studios,
    activeStudio,
    setActiveStudio,
    isLoading,
  };
}
