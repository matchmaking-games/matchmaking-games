import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { User, Check, X, Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import matchmakingLogo from "@/assets/matchmaking-logo.png";

const onboardingSchema = z.object({
  nomeCompleto: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  username: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(30, "Máximo 30 caracteres")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen")
    .refine(
      (val) => !val.startsWith("-") && !val.endsWith("-"),
      "Não pode começar ou terminar com hífen"
    ),
});

type ValidationErrors = {
  nomeCompleto?: string;
  username?: string;
};

const Onboarding = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const slugFromUrl = searchParams.get("slug");

  // Auth state
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Form state
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [username, setUsername] = useState(slugFromUrl || "");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Username availability state
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      setUserEmail(session.user.email ?? null);
      setUserId(session.user.id);
      setIsAuthChecking(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate("/login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Validate username format
  const validateUsername = (value: string): string => {
    if (value.length === 0) return "";
    if (value.length < 3) return "Mínimo 3 caracteres";
    if (value.length > 30) return "Máximo 30 caracteres";
    if (!/^[a-z0-9-]+$/.test(value)) return "Use apenas letras, números e hífen";
    if (value.startsWith("-") || value.endsWith("-"))
      return "Não pode começar ou terminar com hífen";
    return "";
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setUsername(value);
    setValidationErrors((prev) => ({ ...prev, username: validateUsername(value) }));
    setIsAvailable(null);
  };

  // Debounced availability check
  useEffect(() => {
    const usernameError = validateUsername(username);
    if (!username || usernameError) {
      setIsAvailable(null);
      setIsCheckingAvailability(false);
      return;
    }

    setIsCheckingAvailability(true);
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.rpc("check_slug_availability", {
        slug_to_check: username,
      });

      if (error) {
        console.error("Error checking slug availability:", error);
        setIsAvailable(false);
      } else {
        setIsAvailable(data);
      }
      setIsCheckingAvailability(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate with Zod
    const result = onboardingSchema.safeParse({ nomeCompleto, username });
    if (!result.success) {
      const errors: ValidationErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ValidationErrors;
        errors[field] = err.message;
      });
      setValidationErrors(errors);
      return;
    }

    if (!userId || !userEmail) {
      toast.error("Erro de autenticação. Faça login novamente.");
      navigate("/login");
      return;
    }

    setIsLoading(true);

    // Re-check availability before inserting
    const { data: stillAvailable, error: checkError } = await supabase.rpc(
      "check_slug_availability",
      { slug_to_check: username }
    );

    if (checkError) {
      console.error("Error re-checking availability:", checkError);
      toast.error("Erro ao verificar username. Tente novamente.");
      setIsLoading(false);
      return;
    }

    if (!stillAvailable) {
      toast.error("Este username não está mais disponível");
      setIsAvailable(false);
      setIsLoading(false);
      return;
    }

    // Insert into users table
    const { error: insertError } = await supabase.from("users").insert({
      id: userId,
      email: userEmail,
      nome_completo: nomeCompleto,
      slug: username,
    });

    setIsLoading(false);

    if (insertError) {
      console.error("Error creating profile:", insertError);
      toast.error("Erro ao criar perfil. Tente novamente.");
      return;
    }

    // Success - redirect to dashboard
    navigate("/dashboard");
  };

  const renderUsernameStatusIcon = () => {
    if (!username || username.length < 3) return null;

    if (validationErrors.username) {
      return null;
    }

    if (isCheckingAvailability) {
      return <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />;
    }

    if (isAvailable === true) {
      return <Check className="w-4 h-4 text-primary" />;
    }

    if (isAvailable === false) {
      return <X className="w-4 h-4 text-destructive" />;
    }

    return null;
  };

  const isButtonDisabled =
    isLoading ||
    !nomeCompleto ||
    !username ||
    !!validationErrors.nomeCompleto ||
    !!validationErrors.username ||
    isCheckingAvailability ||
    isAvailable !== true;

  // Loading state while checking auth
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern" />

      {/* Subtle green glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-glow-primary" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Main Card */}
        <div className="rounded-xl border border-border bg-card p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={matchmakingLogo} alt="Matchmaking" className="h-10" />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Bem-vindo ao <span className="text-gradient-primary">Matchmaking</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Conte um pouco sobre você.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="nomeCompleto" className="text-foreground">
                Nome completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="nomeCompleto"
                  type="text"
                  placeholder="João da Silva"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  className="pl-10 h-11 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading}
                />
              </div>
              {validationErrors.nomeCompleto && (
                <p className="text-sm text-destructive">
                  {validationErrors.nomeCompleto}
                </p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">
                Username
              </Label>
              <div className="flex items-center bg-input border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <span className="pl-3 pr-2 text-muted-foreground text-sm whitespace-nowrap">
                  matchmaking.games/
                </span>
                <Input
                  id="username"
                  type="text"
                  placeholder="seu-username"
                  value={username}
                  onChange={handleUsernameChange}
                  maxLength={30}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-11 text-foreground"
                  disabled={isLoading}
                />
                <div className="px-3">{renderUsernameStatusIcon()}</div>
              </div>
              {validationErrors.username && (
                <p className="text-sm text-destructive">
                  {validationErrors.username}
                </p>
              )}
              {!validationErrors.username && isAvailable === false && (
                <p className="text-sm text-destructive">
                  Este username já está em uso
                </p>
              )}
              {!validationErrors.username && isAvailable === true && (
                <p className="text-sm text-primary">Username disponível!</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={isButtonDisabled}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando perfil...
                </>
              ) : (
                "Criar Perfil"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
