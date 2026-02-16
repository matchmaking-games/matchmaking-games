import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Loader2 } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { StudioSidebar } from "./StudioSidebar";
import { useActiveStudio } from "@/hooks/useActiveStudio";

interface StudioDashboardLayoutProps {
  children: ReactNode;
}

export function StudioDashboardLayout({ children }: StudioDashboardLayoutProps) {
  const navigate = useNavigate();
  const { studios, activeStudio, setActiveStudio, isLoading } = useActiveStudio();

  useEffect(() => {
    if (!isLoading && studios.length === 0) {
      navigate("/studio/manage/new");
    }
  }, [isLoading, studios.length, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
