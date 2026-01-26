import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <p className="text-8xl font-display font-bold text-muted-foreground/30">
          404
        </p>
        <div className="space-y-2">
          <h1 className="text-2xl font-display font-semibold text-foreground">
            Perfil não encontrado
          </h1>
          <p className="text-muted-foreground">
            O perfil que você procura não existe ou foi removido.
          </p>
        </div>
        <Button asChild>
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Voltar para Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
