import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Briefcase,
  Settings,
  LogOut,
  LayoutDashboard,
  CalendarRange,
  Users,
  Building2,
  Layers,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import matchmakingLogo from "@/assets/matchmaking-logo.png";

const exploreItems = [
  { title: "Eventos", description: "Encontros e game jams", href: "/events", icon: CalendarRange },
  { title: "Profissionais", description: "Talentos da indústria", href: "/professionals", icon: Users },
  { title: "Estúdios", description: "Empresas de games", href: "/studios", icon: Building2 },
  { title: "Projetos", description: "Portfólios e jogos", href: "/projects", icon: Layers },
];

export function Header() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const displayName = user?.nome_completo || "";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        {/* Mobile: Hamburger */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-2">
                {isAuthenticated && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Painel
                  </Link>
                )}

                <Link
                  to="/jobs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
                >
                  <Briefcase className="h-4 w-4" />
                  Vagas
                </Link>

                <Link
                  to="/events"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
                >
                  <CalendarRange className="h-4 w-4" />
                  Eventos
                </Link>

                <Link
                  to="/professionals"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
                >
                  <Users className="h-4 w-4" />
                  Profissionais
                </Link>

                <Link
                  to="/studios"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
                >
                  <Building2 className="h-4 w-4" />
                  Estúdios
                </Link>

                <Link
                  to="/projects"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
                >
                  <Layers className="h-4 w-4" />
                  Projetos
                </Link>

                {isAuthenticated && (
                  <>
                    <Link
                      to="/dashboard/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Configurações
                    </Link>
                    <div className="my-2 border-t border-border" />
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors text-left w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </>
                )}

                {!isAuthenticated && !isLoading && (
                  <>
                    <div className="my-2 border-t border-border" />
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
                    >
                      Criar Conta
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo - centered on mobile */}
        <Link
          to={!isAuthenticated && !isLoading ? "/" : "/dashboard"}
          className="flex items-center gap-2 md:flex-none absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
        >
          <img src={matchmakingLogo} alt="Matchmaking" className="h-8 w-auto" />
        </Link>

        {/* Desktop: Right section (Vagas + Explorar + Auth) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Vagas (desktop only) */}
          <Link to="/jobs">
            <Button variant="ghost" size="sm">
              Vagas
            </Button>
          </Link>

          {/* Explorar dropdown */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    Explorar
                    <ChevronDown className="h-3 w-3 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Button>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="w-64 p-2">
                    {exploreItems.map((item) => (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          className="flex items-start gap-3 rounded-md p-3 hover:bg-muted transition-colors"
                        >
                          <item.icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {isLoading ? (
            <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
          ) : isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  Painel
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar_url || undefined} alt={displayName} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {displayName ? getInitials(displayName) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings" className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Criar Conta</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile: placeholder for layout balance */}
        <div className="md:hidden w-9" />
      </div>
    </header>
  );
}
