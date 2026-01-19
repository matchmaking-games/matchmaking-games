import { ReactNode } from "react";
import { Menu } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col">
          {/* Mobile header with menu trigger */}
          <header className="md:hidden h-14 flex items-center border-b border-border px-4">
            <SidebarTrigger className="text-foreground">
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
            <span className="ml-3 font-display font-bold text-lg text-gradient-primary">
              Matchmaking
            </span>
          </header>

          {/* Main content area */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
