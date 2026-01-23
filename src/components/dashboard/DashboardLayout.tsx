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
      <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
        {/* Background grid (always behind) */}
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0" />

        {/* Foreground content */}
        <div className="relative z-10 flex w-full">
          <DashboardSidebar />

          <div className="flex-1 flex flex-col">
            {/* Mobile header with menu trigger */}
            <header className="md:hidden h-14 flex items-center border-b border-border px-4">
              <SidebarTrigger className="text-foreground">
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
            </header>

            {/* Main content area */}
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
