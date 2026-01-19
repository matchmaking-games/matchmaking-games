import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, X, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import matchmakingLogo from "@/assets/matchmaking-logo.png";

const Index = () => {
  const [username, setUsername] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const validateUsername = (value: string): string => {
    if (value.length === 0) return "";
    if (value.length < 3) return "Mínimo 3 caracteres";
    if (value.length > 30) return "Máximo 30 caracteres";
    if (!/^[a-z0-9-]+$/.test(value)) return "Use apenas letras, números e hífen";
    if (value.startsWith("-") || value.endsWith("-")) return "Não pode começar ou terminar com hífen";
    return "";
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setUsername(value);
    setValidationError(validateUsername(value));
    setIsAvailable(null);
  };

  // Debounced availability check
  useEffect(() => {
    if (!username || validationError) {
      setIsAvailable(null);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.rpc('check_slug_availability', {
        slug_to_check: username
      });
      
      if (error) {
        console.error('Error checking slug availability:', error);
        setIsAvailable(false); // Assume unavailable on error for security
      } else {
        setIsAvailable(data);
      }
      setIsChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [username, validationError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || validationError || isChecking || !isAvailable) {
      return;
    }
    navigate(`/signup?slug=${username}`);
  };

  // Determine status icon
  const renderStatusIcon = () => {
    if (!username || username.length < 3) return null;
    
    if (validationError) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    
    if (isChecking) {
      return <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />;
    }
    
    if (isAvailable === true) {
      return <Check className="w-4 h-4 text-green-500" />;
    }
    
    if (isAvailable === false) {
      return <X className="w-4 h-4 text-red-500" />;
    }
    
    return null;
  };

  // Determine status message
  const getStatusMessage = () => {
    if (!username) {
      return { text: "Reserve seu username antes que seja tarde!", className: "text-muted-foreground" };
    }
    
    if (validationError) {
      return { text: validationError, className: "text-destructive" };
    }
    
    if (isChecking) {
      return { text: "Reserve seu username antes que seja tarde!", className: "text-muted-foreground" };
    }
    
    if (isAvailable === true) {
      return { text: "Boa escolha! Esse username está livre.", className: "text-green-500" };
    }
    
    if (isAvailable === false) {
      return { text: "Ops, esse username já foi pego. Tente outro.", className: "text-destructive" };
    }
    
    return { text: "Reserve seu username antes que seja tarde!", className: "text-muted-foreground" };
  };

  const isButtonDisabled = !username || !!validationError || isChecking || isAvailable !== true;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background grid pattern - 24px for connection feel */}
      <div className="absolute inset-0 bg-grid-pattern" />
      
      {/* Subtle green glow - decorative only */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] rounded-full bg-glow-primary" />

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <img src={matchmakingLogo} alt="Matchmaking" className="h-12" />
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
              maxLength={30}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-12 text-foreground placeholder:text-muted-foreground/50"
            />
            <div className="px-2">
              {renderStatusIcon()}
            </div>
            <Button 
              type="submit" 
              size="sm" 
              className="m-1.5 h-9 px-4 rounded-md"
              disabled={isButtonDisabled}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>

        <p className={`text-sm mb-6 ${getStatusMessage().className}`}>
          {getStatusMessage().text}
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
