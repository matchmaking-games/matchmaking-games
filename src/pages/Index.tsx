import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gamepad2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateUsername = (value: string): string => {
    if (value.length === 0) return "";
    if (value.length < 3) return "Mínimo 3 caracteres";
    if (!/^[a-z0-9_]+$/.test(value)) return "Apenas letras minúsculas, números e _";
    return "";
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(value);
    setError(validateUsername(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (username.length === 0) {
      setError("Digite um username");
      return;
    }
    navigate(`/signup?username=${username}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background grid pattern - 24px for connection feel */}
      <div className="absolute inset-0 bg-grid-pattern" />
      
      {/* Subtle green glow - decorative only */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] rounded-full bg-glow-primary" />

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Gamepad2 className="w-7 h-7 text-primary" />
          </div>
          <span className="font-display text-2xl font-bold text-foreground">Matchmaking</span>
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
          Conecte-se aos melhores{" "}
          <span className="text-gradient-primary">talentos de games</span>
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          A plataforma que conecta estúdios a profissionais qualificados da indústria de jogos.
        </p>

        {/* Username Input */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-4">
          <div className="flex items-center bg-input border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <span className="pl-4 pr-2 text-muted-foreground font-medium text-sm whitespace-nowrap">
              matchmaking.games/
            </span>
            <Input
              type="text"
              placeholder="seu-username"
              value={username}
              onChange={handleUsernameChange}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-12 text-foreground placeholder:text-muted-foreground/50"
            />
            <Button 
              type="submit" 
              size="sm" 
              className="m-1.5 h-9 px-4 rounded-md"
              disabled={username.length === 0 || !!error}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          {error && (
            <p className="text-destructive text-sm mt-2 text-left">{error}</p>
          )}
        </form>

        <p className="text-sm text-muted-foreground mb-6">
          Reserve seu username antes que seja tarde!
        </p>

        <p className="text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Index;
