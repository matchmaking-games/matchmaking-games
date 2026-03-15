import { ReactNode, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Menu, Loader2, Building2 } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { StudioSidebar } from "./StudioSidebar";
import { useActiveStudio } from "@/hooks/studio/useActiveStudio";

interface StudioDashboardLayoutProps {
  children: ReactNode;
}

export function StudioDashboardLayout({ children }: StudioDashboardLayoutProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { studios, activeStudio, setActiveStudio, isLoading } = useActiveStudio();

  const studioParam = searchParams.get("studio");

  // Case 1: no studios → redirect to create
  useEffect(() => {
    if (!isLoading && studios.length === 0) {
      navigate("/studio/manage/new");
    }
  }, [isLoading, studios.length, navigate]);

  // Case 2: has studios but no ?studio= param → auto-select first
  useEffect(() => {
    if (!isLoading && studios.length > 0 && !studioParam) {
      setActiveStudio(studios[0].estudio.id);
    }
  }, [isLoading, studios, studioParam, setActiveStudio]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // No studios
  if (studios.length === 0) {
    return null;
  }

  // Waiting for auto-redirect (no ?studio= param yet)
  if (!studioParam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Case 3: invalid studio UUID in URL
  if (!activeStudio && studios.length > 0) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
          <div
            className="absolute inset-0 bg-grid-pattern pointer-events-none z-0"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 65%)",
              maskImage:
                "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 65%)",
            }}
          />

          <div className="relative z-10 flex w-full min-w-0">
            <StudioSidebar
              membership={studios[0]}
              studios={studios}
              onStudioChange={setActiveStudio}
            />

            <div className="flex-1 min-w-0 flex flex-col">
              <header className="md:hidden h-14 flex items-center border-b border-border px-4 bg-secondary">
                <SidebarTrigger className="text-foreground">
                  <Menu className="h-6 w-6" />
                </SidebarTrigger>
              </header>

              <main className="flex-1 w-full min-w-0 flex items-center justify-center px-4 py-6 sm:p-6">
                <div className="flex flex-col items-center text-center gap-4 max-w-md">
                  <Building2 className="h-16 w-16 text-muted-foreground" />
                  <h2 className="font-display font-semibold text-2xl text-foreground">
                    Estúdio não encontrado
                  </h2>
                  <p className="text-muted-foreground text-base">
                    Este estúdio não existe ou você não tem mais acesso a ele. Use o menu no canto inferior esquerdo para selecionar um estúdio disponível.
                  </p>
                </div>
              </main>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Case 4: valid active studio → render normally
  if (!activeStudio) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
        <div
          className="absolute inset-0 bg-grid-pattern pointer-events-none z-0"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 65%)",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 65%)",
          }}
        />

        <div className="relative z-10 flex w-full min-w-0">
          <StudioSidebar
            membership={activeStudio}
            studios={studios}
            onStudioChange={setActiveStudio}
          />

          <div className="flex-1 min-w-0 flex flex-col">
            <header className="md:hidden h-14 flex items-center border-b border-border px-4 bg-secondary">
              <SidebarTrigger className="text-foreground">
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
            </header>

            <main className="flex-1 w-full min-w-0 px-4 py-6 sm:p-6 overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
