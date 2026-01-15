import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad2, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
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
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'var(--gradient-radial-subtle)',
          filter: 'blur(120px)'
        }}
      />

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Gamepad2 className="w-7 h-7 text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground">Matchmaking</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
          Conecte-se aos melhores{" "}
          <span className="text-primary">talentos de games</span>
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          A plataforma que conecta estúdios a profissionais qualificados da indústria de jogos.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-base h-12 px-8">
            <Link to="/signup">
              Começar agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base h-12 px-8">
            <Link to="/login">
              Já tenho conta
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
