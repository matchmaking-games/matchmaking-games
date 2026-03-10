import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfessionalCard as ProfessionalCardType } from "@/types/professional";

interface ProfessionalCardProps {
  professional: ProfessionalCardType;
}

const getInitials = (name: string): string => {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const { nome_completo, slug, avatar_url, titulo_profissional, cidade, estado, disponivel_para_trabalho, habilidades, total_habilidades } = professional;

  const location =
    cidade && estado ? `${cidade}, ${estado}` :
    estado ? estado :
    cidade ? cidade : null;

  const visibleSkills = habilidades.slice(0, 4);
  const extraCount = total_habilidades > 4 ? total_habilidades - 4 : 0;

  return (
    <a
      href={`/p/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <Card className="p-4 cursor-pointer bg-card/50 border-border/50 hover:border-border/80 hover:bg-card/70 transition-all duration-200">
        {/* Header: Avatar + Info + Badge */}
        <div className="flex gap-4 items-start">
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={avatar_url || undefined} alt={nome_completo} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {getInitials(nome_completo)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate leading-tight">
                  {nome_completo}
                </p>
                {titulo_profissional && (
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">
                    {titulo_profissional}
                  </p>
                )}
                {location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{location}</span>
                  </p>
                )}
              </div>

              {disponivel_para_trabalho && (
                <Badge className="bg-primary/10 text-primary border-0 text-xs flex-shrink-0 pointer-events-none">
                  Disponível
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Footer: Skills */}
        {habilidades.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-border/50">
            {visibleSkills.map((skill) => (
              <Badge
                key={skill.id}
                variant="secondary"
                className="text-xs bg-muted/80"
              >
                {skill.nome}
              </Badge>
            ))}
            {extraCount > 0 && (
              <span className="text-xs text-muted-foreground">
                +{extraCount} mais
              </span>
            )}
          </div>
        )}
      </Card>
    </a>
  );
}
