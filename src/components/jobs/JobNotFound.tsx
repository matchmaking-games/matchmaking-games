import { Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function JobNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
        <Briefcase className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-2">
        Vaga não encontrada
      </h1>
      <p className="text-muted-foreground max-w-md mb-6">
        A vaga que você procura não existe ou já expirou.
      </p>
      <Button asChild>
        <Link to="/jobs">Ver todas as vagas</Link>
      </Button>
    </div>
  );
}
