import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  User,
  Building2,
  ChevronDown,
  Settings,
  CreditCard,
  Mail,
  ExternalLink,
  LogOut,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useHasStudio } from "@/hooks/useHasStudio";

const baseNavItems = [
  { title: "Visão Geral", url: "/dashboard", icon: LayoutDashboard },
  { title: "Vagas", url: "/dashboard/jobs", icon: Briefcase },
  { title: "Meu Perfil", url: "/dashboard/profile", icon: User },
];

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export function DashboardSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: user } = useCurrentUser();
  const { data: hasStudio, isLoading: isLoadingStudio } = useHasStudio();

  const navItems = hasStudio
    ? [...baseNavItems, { title: "Meu Estúdio", url: "/studio/dashboard", icon: Building2 }]
    : baseNavItems;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Até logo!",
      description: "Você saiu com sucesso.",
    });
    navigate("/login");
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center">
          <img src={matchmakingLogo} alt="Matchmaking" className="h-10" />
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || undefined} alt={user.nome_completo} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-[15px]">
                    {getInitials(user.nome_completo)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[15px] font-medium text-sidebar-foreground truncate flex-1 text-left">
                  {user.nome_completo}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" side="top" className="w-56">
              {!isLoadingStudio && !hasStudio && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/studio/new" className="cursor-pointer">
                      <Building2 className="mr-2 h-4 w-4" />
                      Criar Estúdio
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem disabled>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>

              <DropdownMenuItem disabled>
                <CreditCard className="mr-2 h-4 w-4" />
                Faturas
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <a href="mailto:lucas.pimenta@matchmaking.games" className="cursor-pointer">
                  <Mail className="mr-2 h-4 w-4" />
                  Suporte
                </a>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <a href={`/p/${user.slug}`} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver perfil público
                </a>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
