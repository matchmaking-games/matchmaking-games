import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LayoutDashboard, Briefcase, Building2, UserPlus, ChevronDown, Settings, CreditCard, Mail, ExternalLink, LogOut, ChevronLeft, Check } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import matchmakingLogo from "@/assets/matchmaking-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { StudioMembership } from "@/hooks/useStudioMembership";

const navItems = [
  { title: "Dashboard", url: "/studio/manage/dashboard", icon: LayoutDashboard },
  { title: "Vagas", url: "/studio/manage/jobs", icon: Briefcase },
  { title: "Perfil do Estúdio", url: "/studio/manage/profile", icon: Building2 },
  { title: "Equipe", url: "/studio/manage/team", icon: UserPlus },
];

const getInitials = (name: string) => {
  return name.split(" ").map(word => word[0]).slice(0, 2).join("").toUpperCase();
};

interface StudioSidebarProps {
  membership: StudioMembership;
  studios: StudioMembership[];
  onStudioChange: (studioId: string) => void;
}

export function StudioSidebar({ membership, studios, onStudioChange }: StudioSidebarProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const studioParam = searchParams.get("studio");
  const buildUrl = (path: string) => {
    return studioParam ? `${path}?studio=${studioParam}` : path;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Até logo!", description: "Você saiu com sucesso." });
    navigate("/login");
  };

  const handleStudioSwitch = (studioId: string) => {
    if (studioId !== membership.estudio.id) {
      onStudioChange(studioId);
    }
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-[15px]">
                    <ChevronLeft className="h-[22px] w-[22px]" />
                    <span>Voltar ao perfil</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <div className="px-3 py-2">
                <Separator className="bg-sidebar-border" />
              </div>

              {navItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={buildUrl(item.url)}
                      end={item.url === "/studio/manage/dashboard"}
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer">
              <Avatar className="h-10 w-10">
                <AvatarImage src={membership.estudio.logo_url || undefined} alt={membership.estudio.nome} />
                <AvatarFallback className="bg-muted text-muted-foreground text-[15px]">
                  {getInitials(membership.estudio.nome)}
                </AvatarFallback>
              </Avatar>
              <span className="text-[15px] font-medium text-sidebar-foreground truncate flex-1 text-left">
                {membership.estudio.nome}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="top" className="w-64">
            {/* Studio switcher - only show if multiple studios */}
            {studios.length > 1 && (
              <>
                <div className="px-2 py-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Trocar estúdio</p>
                </div>
                {studios.map((studio) => (
                  <DropdownMenuItem
                    key={studio.id}
                    onClick={() => handleStudioSwitch(studio.estudio.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={studio.estudio.logo_url || undefined} />
                        <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                          {getInitials(studio.estudio.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 truncate text-sm">{studio.estudio.nome}</span>
                      {studio.role === "super_admin" && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Admin</Badge>
                      )}
                      {studio.estudio.id === membership.estudio.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
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
              <a href={`/studio/${membership.estudio.slug}`} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver página pública
              </a>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
