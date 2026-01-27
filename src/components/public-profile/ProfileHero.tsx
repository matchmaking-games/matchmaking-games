import { Share2, MapPin, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { PublicUserData } from "@/hooks/usePublicProfile";

interface ProfileHeroProps {
  user: PublicUserData;
}

export function ProfileHero({ user }: ProfileHeroProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = `https://matchmaking.games/p/${user.slug}`;
    
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: "O link do perfil foi copiado para a área de transferência.",
      });
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const displayName = user.nome_exibicao || user.nome_completo;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative">
      {/* Banner */}
      <div className="h-40 md:h-[200px] lg:h-[240px] w-full overflow-hidden">
        {user.banner_url ? (
          <img
            src={user.banner_url}
            alt="Banner do perfil"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-primary/5 to-background" />
        )}
      </div>

      {/* Card container with negative margin to overlap banner */}
      <div className="max-w-4xl mx-auto px-4">
        <Card className="relative mt-[-60px] md:mt-[-70px] lg:mt-[-80px]">
          <CardContent className="pt-6">
            {/* Avatar - positioned to overlap the card top */}
            <div className="absolute -top-[60px] md:-top-[70px] lg:-top-[80px] left-6">
              <Avatar className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] lg:w-[160px] lg:h-[160px] border-4 border-background shadow-lg">
                <AvatarImage src={user.avatar_url || undefined} alt={displayName} />
                <AvatarFallback className="text-2xl md:text-3xl lg:text-4xl font-semibold bg-muted">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Share button - absolute positioned */}
            <div className="absolute right-6 top-4">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>

            {/* Info section with padding for avatar */}
            <div className="pt-[70px] md:pt-[80px] lg:pt-[90px] space-y-3">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground">
                  {displayName}
                </h1>
                {user.titulo_profissional && (
                  <p className="text-lg text-muted-foreground mt-1">
                    {user.titulo_profissional}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {user.localizacao && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{user.localizacao}</span>
                  </div>
                )}

                {user.disponivel_para_trabalho && (
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    Disponível para trabalho
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
