import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "@/hooks/useResetPassword";
import matchmakingLogo from "@/assets/matchmaking-logo.png";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const passwordSchema = z
  .object({
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não coincidem.",
    path: ["confirm"],
  });

const ResetPassword = () => {
  const navigate = useNavigate();
  const { status, isSubmitting, error, updatePassword, setError } = useResetPassword();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setError(null);

    const result = passwordSchema.safeParse({ password, confirm });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        errs[err.path[0] as string] = err.message;
      });
      setFieldErrors(errs);
      return;
    }

    await updatePassword(result.data.password);
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Token error
  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-glow-primary" />
        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
            <div className="flex justify-center mb-6">
              <img src={matchmakingLogo} alt="Matchmaking" className="h-10" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Link inválido ou expirado
            </h1>
            <p className="text-sm text-muted-foreground">
              O link de recuperação não é válido ou já expirou. Solicite um novo link.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block mt-4 text-sm text-primary hover:underline font-medium"
            >
              Solicitar novo link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-glow-primary" />
        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
            <div className="flex justify-center mb-6">
              <img src={matchmakingLogo} alt="Matchmaking" className="h-10" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              ✅ Senha alterada com sucesso!
            </h1>
            <p className="text-sm text-muted-foreground">
              Sua senha foi atualizada. Você já pode entrar com a nova senha.
            </p>
            <Button
              className="w-full h-12 text-base font-semibold mt-4"
              onClick={() => navigate("/login")}
            >
              Ir para o login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-glow-primary" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-xl border border-border bg-card p-8">
          <div className="flex justify-center mb-6">
            <img src={matchmakingLogo} alt="Matchmaking" className="h-10" />
          </div>

          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Criar nova senha
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors({});
                    setError(null);
                  }}
                  className="pl-10 pr-10 h-11 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-destructive">{fieldErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-foreground">Confirmar nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    setFieldErrors({});
                    setError(null);
                  }}
                  className="pl-10 pr-10 h-11 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.confirm && (
                <p className="text-sm text-destructive">{fieldErrors.confirm}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar nova senha"
              )}
            </Button>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
