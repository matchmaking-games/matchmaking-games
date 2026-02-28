import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import matchmakingLogo from "@/assets/matchmaking-logo.png";

// Zod schema for form validation
const signupSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

type ValidationErrors = {
  email?: string;
  password?: string;
};

const Signup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const slug = searchParams.get("slug");
  const redirect = searchParams.get("redirect");
  const emailParam = searchParams.get("email");
  
  const [email, setEmail] = useState(emailParam || "");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (authLoading) return;
      
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile) {
          navigate(redirect || '/dashboard', { replace: true });
        } else {
          const onboardingParams = new URLSearchParams();
          if (slug) onboardingParams.set("slug", slug);
          if (redirect) onboardingParams.set("redirect", redirect);
          const qs = onboardingParams.toString();
          navigate(qs ? `/onboarding?${qs}` : '/onboarding', { replace: true });
        }
      } else {
        setCheckingAuth(false);
      }
    };
    
    checkAuthAndRedirect();
  }, [user, authLoading, navigate, slug]);

  if (authLoading || checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const validateForm = (): boolean => {
    const result = signupSchema.safeParse({ email, password });
    
    if (!result.success) {
      const errors: ValidationErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ValidationErrors;
        errors[field] = err.message;
      });
      setValidationErrors(errors);
      return false;
    }
    
    setValidationErrors({});
    return true;
  };

  const handleGoogleSignup = async () => {
    if (slug) localStorage.setItem("pending_slug", slug);
    if (redirect) localStorage.setItem("pending_redirect", redirect);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error("Google OAuth error:", error);
      toast.error("Erro ao conectar com Google. Tente novamente.");
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    setIsLoading(false);
    
    if (error) {
      console.error("Email signup error:", error);
      
      // Mapeamento de erros user-friendly
      if (error.message.includes("already registered")) {
        toast.error("Este email já possui conta", {
          action: {
            label: "Entrar",
            onClick: () => navigate("/login")
          }
        });
      } else if (error.message.includes("Invalid email")) {
        toast.error("Email inválido");
      } else if (error.message.includes("Password should be at least")) {
        toast.error("Senha deve ter pelo menos 8 caracteres");
      } else {
        toast.error("Erro ao criar conta. Tente novamente.");
      }
      return;
    }
    
    if (slug) localStorage.setItem("pending_slug", slug);
    if (redirect) localStorage.setItem("pending_redirect", redirect);
    setEmailSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background grid pattern - 24px for connection feel */}
      <div className="absolute inset-0 bg-grid-pattern" />
      
      {/* Subtle green glow - decorative only */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-glow-primary" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Main Card */}
        <div className="rounded-xl border border-border bg-card p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={matchmakingLogo} alt="Matchmaking" className="h-10" />
          </div>

          {emailSent ? (
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <Mail className="w-12 h-12 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Verifique seu email
              </h1>
              <p className="text-sm text-muted-foreground">
                Enviamos um link de confirmação para{" "}
                <strong className="text-foreground">{email}</strong>. Clique no link para ativar sua conta e continuar.
              </p>
              <p className="text-xs text-muted-foreground">
                Não recebeu? Verifique a pasta de spam.
              </p>
            </div>
          ) : (
            <>
              {/* Title */}
              <div className="text-center mb-6">
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Criar conta
                </h1>
              </div>

              {/* Username Reservation Message */}
              {slug && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20 mb-6">
                  <p className="text-sm text-foreground">
                    Estamos reservando{" "}
                    <span className="text-primary font-semibold">
                      matchmaking.games/p/{slug}
                    </span>{" "}
                    para você!
                  </p>
                </div>
              )}

              {/* Sign up Form */}
              <div className="space-y-6">
                {/* OAuth Buttons */}
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base gap-3 bg-secondary/50 border-border hover:bg-secondary hover:border-border/80"
                    onClick={handleGoogleSignup}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continuar com Google
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
                        className="pl-10 h-11 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="text-sm text-destructive">{validationErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-11 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                        disabled={isLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="text-sm text-destructive">{validationErrors.password}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      "Criar Perfil"
                    )}
                  </Button>
                </form>
              </div>

              {/* Footer Link */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                Já tem conta?{" "}
                <Link to={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"} className="text-primary hover:underline font-medium">
                  Entrar
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
