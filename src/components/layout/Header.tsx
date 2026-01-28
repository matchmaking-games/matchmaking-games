import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, User, Settings, LogOut, LayoutDashboard } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import matchmakingLogo from "@/assets/matchmaking-logo.png";

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

  const displayName = user?.nome_exibicao || user?.nome_completo || "";

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
                <Link
                  to="/vagas"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
                >
                  Vagas
                </Link>
                
                {isAuthenticated && (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Painel
                    </Link>
                    <div className="my-2 border-t border-border" />
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Perfil
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Configurações
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left w-full"
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
                      className="flex items-center gap-3 px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
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
          to="/" 
          className="flex items-center gap-2 md:flex-none absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
        >
          <img src={matchmakingLogo} alt="Matchmaking" className="h-8 w-auto" />
        </Link>

        {/* Desktop: Center navigation */}
        <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
          <Link
            to="/vagas"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Vagas
          </Link>
        </nav>

        {/* Desktop: Auth section */}
        <div className="hidden md:flex items-center gap-3">
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
                    <Link to="/dashboard/profile" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Perfil
                    </Link>
                  </DropdownMenuItem>
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

        {/* Mobile: Auth button/avatar */}
        <div className="md:hidden">
          {isLoading ? (
            <div className="h-9 w-9 bg-muted animate-pulse rounded-full" />
          ) : isAuthenticated ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {displayName ? getInitials(displayName) : "U"}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
