import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, User, Mail, Lock, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserType = "studio" | "professional" | null;

const Signup = () => {
  const [userType, setUserType] = useState<UserType>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleSignup = () => {
    // TODO: Implement Google OAuth with Supabase
    console.log("Google signup clicked");
  };

  const handleLinkedInSignup = () => {
    // TODO: Implement LinkedIn OAuth with Supabase
    console.log("LinkedIn signup clicked");
  };

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email/password signup with Supabase
    console.log("Email signup:", { email, password, userType });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), 
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Subtle green glow effect */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background: 'var(--gradient-radial-subtle)',
          filter: 'blur(100px)'
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Main Card */}
        <div className="rounded-xl border border-border bg-card p-8">
          {/* Logo / Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Criar conta na <span className="text-primary">Matchmaking</span>
            </h1>
          </div>

          {/* Profile Type Selection */}
          {!userType && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Primeiramente, qual seu perfil?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Escolha o tipo de conta que melhor representa você
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Studio Card */}
                <button
                  type="button"
                  onClick={() => setUserType("studio")}
                  className="group relative p-6 rounded-lg border-2 transition-all duration-300 text-left hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background border-border hover:border-primary/50 bg-secondary/30"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Building2 className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Sou um Estúdio</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Busco talentos para meu time
                      </p>
                    </div>
                  </div>
                </button>

                {/* Professional Card */}
                <button
                  type="button"
                  onClick={() => setUserType("professional")}
                  className="group relative p-6 rounded-lg border-2 transition-all duration-300 text-left hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background border-border hover:border-primary/50 bg-secondary/30"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <User className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Sou um Profissional</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Busco oportunidades na área
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Sign up Form (shown after selecting type) */}
          {userType && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Selected Type Badge */}
              <button
                type="button"
                onClick={() => setUserType(null)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-sm text-primary hover:bg-primary/20 transition-colors mx-auto"
              >
                {userType === "studio" ? (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>Estúdio</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    <span>Profissional</span>
                  </>
                )}
                <span className="text-muted-foreground ml-1">• Alterar</span>
              </button>

              {/* OAuth Buttons */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-base gap-3 bg-secondary/50 border-border hover:bg-secondary hover:border-primary/30"
                  onClick={handleGoogleSignup}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuar com Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-base gap-3 bg-secondary/50 border-border hover:bg-secondary hover:border-primary/30"
                  onClick={handleLinkedInSignup}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Continuar com LinkedIn
                </Button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">ou</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 bg-secondary/50 border-border focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-11 bg-secondary/50 border-border focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                >
                  Criar conta
                </Button>
              </form>
            </div>
          )}

          {/* Footer Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
