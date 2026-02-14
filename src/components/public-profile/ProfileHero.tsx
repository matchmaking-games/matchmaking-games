import { MapPin, CheckCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { PublicUserData } from "@/hooks/usePublicProfile";

interface ProfileHeroProps {
  user: PublicUserData;
}

export function ProfileHero({ user }: ProfileHeroProps) {
  const displayName = user.nome_completo;
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

      {/* Content container */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative">
          {/* Avatar - positioned to overlap banner */}
          <div className="absolute -top-[60px] md:-top-[70px] lg:-top-[80px]">
            <Avatar className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] lg:w-[160px] lg:h-[160px] border-4 border-background shadow-lg">
              <AvatarImage src={user.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="text-2xl md:text-3xl lg:text-4xl font-semibold bg-muted">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Info section */}
          <div className="pt-[70px] md:pt-[80px] lg:pt-[90px] pb-6 space-y-3">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground">
                {displayName}
                {user.pronomes && (
                  <span className="text-base md:text-lg text-muted-foreground font-normal ml-2">
                    · {user.pronomes}
                  </span>
                )}
              </h1>
              {user.titulo_profissional && (
                <p className="text-lg text-muted-foreground mt-1">
                  {user.titulo_profissional}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {(user.cidade && user.estado) && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{user.cidade}, {user.estado}</span>
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
        </div>
      </div>
    </div>
  );
}
