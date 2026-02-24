import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/hooks/useForgotPassword";
import matchmakingLogo from "@/assets/matchmaking-logo.png";

const emailSchema = z.string().trim().email("Informe um email válido.");

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const { isLoading, error, isSuccess, sendResetEmail, setError } = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setFieldError(result.error.errors[0].message);
      return;
    }

    await sendResetEmail(result.data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-glow-primary" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-xl border border-border bg-card p-8">
          <div className="flex justify-center mb-6">
            <img src={matchmakingLogo} alt="Matchmaking" className="h-10" />
          </div>

          {isSuccess ? (
            <div className="text-center space-y-4">
              <h1 className="font-display text-2xl font-bold text-foreground">
                ✉️ Verifique seu email
              </h1>
              <p className="text-sm text-muted-foreground">
                Enviamos um link para <span className="font-medium text-foreground">{email}</span>.
                Clique no link do email para criar uma nova senha.
              </p>
              <p className="text-xs text-muted-foreground">
                Não recebeu? Verifique a pasta de spam ou tente novamente.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium mt-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Recuperar senha
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Informe seu email e enviaremos um link para você criar uma nova senha.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setFieldError(null);
                        setError(null);
                      }}
                      className="pl-10 h-11 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  {fieldError && (
                    <p className="text-sm text-destructive">{fieldError}</p>
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
                      Enviando...
                    </>
                  ) : (
                    "Enviar link de recuperação"
                  )}
                </Button>

                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}
              </form>

              <div className="text-center mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para o login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
