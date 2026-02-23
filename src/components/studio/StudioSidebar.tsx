import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Building2 as BuildingIcon,
  Users,
  ChevronDown,
  Settings,
  CreditCard,
  Mail,
  ExternalLink,
  LogOut,
  ChevronLeft,
  Check,
  Shuffle,
  Plus,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Separator } from "@/components/ui/separator";
import { StudioMembership } from "@/hooks/useStudioMembership";

const navItems = [
  { title: "Dashboard", url: "/studio/manage/dashboard", icon: LayoutDashboard },
  { title: "Minhas vagas", url: "/studio/manage/jobs", icon: Briefcase },
  { title: "Perfil do estúdio", url: "/studio/manage/profile", icon: BuildingIcon },
  { title: "Minha equipe", url: "/studio/manage/team", icon: Users },
];

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
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
  const { data: user } = useCurrentUser();

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
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-[15px]"
                  >
                    <ChevronLeft className="h-[22px] w-[22px]" />
                    <span>Voltar ao perfil</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <div className="px-3 py-2">
                <Separator className="bg-sidebar-border" />
              </div>

              {navItems.map((item) => (
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

          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel>Contas</DropdownMenuLabel>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <Shuffle className="mr-2 h-4 w-4" />
                Trocar de perfil
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {/* Perfil pessoal */}
                {user && (
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
                    </div>
                  </DropdownMenuItem>
                )}

                {/* Estúdios */}
                {studios.map((studio) => (
                  <DropdownMenuItem
                    key={studio.id}
                    onClick={() => handleStudioSwitch(studio.estudio.id)}
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
                      {studio.estudio.id === membership.estudio.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link to="/studio/manage/new" className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Criar novo estúdio
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Estúdio</DropdownMenuLabel>

            <DropdownMenuItem asChild>
              <Link to={buildUrl("/studio/manage/billing")} className="cursor-pointer">
                <CreditCard className="mr-2 h-4 w-4" />
                Faturas
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <a
                href={`/studio/${membership.estudio.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver página pública
              </a>
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
