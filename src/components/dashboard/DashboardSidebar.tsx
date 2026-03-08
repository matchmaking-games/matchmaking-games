import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  User,
  Users,
  Building2,
  Layers,
  CalendarDays,
  CalendarRange,
  ChevronDown,
  Settings,
  Mail,
  ExternalLink,
  LogOut,
  Shuffle,
  Plus,
  Check,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStudioMembership } from "@/hooks/useStudioMembership";

const personalItems = [
  { title: "Visão geral", url: "/dashboard", icon: LayoutDashboard },
  { title: "Meu perfil", url: "/dashboard/profile", icon: User },
];

const discoveryItems = [
  { title: "Buscar vagas", url: "/jobs", icon: Briefcase },
  { title: "Buscar profissionais", url: "/professionals", icon: Users },
  { title: "Buscar estúdios", url: "/studios", icon: Building2 },
  { title: "Buscar projetos", url: "/projects", icon: Layers },
];

const communityItems = [
  { title: "Meus eventos", url: "/dashboard/events", icon: CalendarDays },
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
  const { studios } = useStudioMembership();
  const isMobile = useIsMobile();
  const [profileSwitchOpen, setProfileSwitchOpen] = useState(false);

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
        {[
          { label: "Pessoal", items: personalItems },
          { label: "Descoberta", items: discoveryItems, className: "mt-4" },
          { label: "Comunidade", items: communityItems, className: "mt-4" },
        ].map((group) => (
          <SidebarGroup key={group.label} className={group.className}>
            <span className="text-xs text-muted-foreground uppercase tracking-wider px-3 mb-1">
              {group.label}
            </span>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/dashboard"}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md text-neutral-300 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-[15px]"
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
        ))}
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
              <DropdownMenuLabel>Contas</DropdownMenuLabel>
              {isMobile ? (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(e) => e.preventDefault()}
                    onClick={() => setProfileSwitchOpen((prev) => !prev)}
                  >
                    <Shuffle className="mr-2 h-4 w-4" />
                    <span className="flex-1">Trocar de perfil</span>
                    <ChevronDown
                      className={`ml-auto h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                        profileSwitchOpen ? "rotate-180" : ""
                      }`}
                    />
                  </DropdownMenuItem>
                  {profileSwitchOpen && (
                    <div className="border-l-2 border-border ml-4 pl-1">
                      <DropdownMenuItem
                        onClick={() => navigate("/dashboard")}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 w-full">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                              {getInitials(user.nome_completo)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1 truncate max-w-[140px] text-sm">{user.nome_completo}</span>
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      </DropdownMenuItem>
                      {studios.map((studio) => (
                        <DropdownMenuItem
                          key={studio.id}
                          onClick={() => navigate(`/studio/manage/dashboard?studio=${studio.estudio.id}`)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={studio.estudio.logo_url || undefined} />
                              <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                                {getInitials(studio.estudio.nome)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="flex-1 truncate max-w-[140px] text-sm">{studio.estudio.nome}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <Shuffle className="mr-2 h-4 w-4" />
                    Trocar de perfil
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => navigate("/dashboard")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                            {getInitials(user.nome_completo)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex-1 truncate max-w-[140px] text-sm">{user.nome_completo}</span>
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    </DropdownMenuItem>
                    {studios.map((studio) => (
                      <DropdownMenuItem
                        key={studio.id}
                        onClick={() => navigate(`/studio/manage/dashboard?studio=${studio.estudio.id}`)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 w-full">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={studio.estudio.logo_url || undefined} />
                            <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                              {getInitials(studio.estudio.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1 truncate max-w-[140px] text-sm">{studio.estudio.nome}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link to="/studio/manage/new" className="cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar novo estúdio
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Geral</DropdownMenuLabel>

              <DropdownMenuItem asChild>
                <Link to="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to="/support" className="cursor-pointer">
                  <Mail className="mr-2 h-4 w-4" />
                  Suporte
                </Link>
              </DropdownMenuItem>

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
