import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Briefcase, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import matchmakingLogo from "@/assets/matchmaking-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Visão Geral", url: "/dashboard", icon: LayoutDashboard },
  { title: "Vagas", url: "/dashboard/jobs", icon: Briefcase },
  { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
];

interface UserData {
  nome_completo: string;
  avatar_url: string | null;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export function DashboardSidebar() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from("users")
          .select("nome_completo, avatar_url")
          .eq("id", session.user.id)
          .maybeSingle();
        if (data) setUser(data);
      }
    };
    fetchUser();
  }, []);

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center">
          <img src={matchmakingLogo} alt="Matchmaking" className="h-7" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-[15px]"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="h-[22px] w-[22px]" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {user && (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url || undefined} alt={user.nome_completo} />
              <AvatarFallback className="bg-muted text-muted-foreground text-[15px]">
                {getInitials(user.nome_completo)}
              </AvatarFallback>
            </Avatar>
            <span className="text-[15px] font-medium text-sidebar-foreground truncate">
              {user.nome_completo}
            </span>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
