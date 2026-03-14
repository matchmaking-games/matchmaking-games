import { MapPin, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { StudioCard as StudioCardType } from "@/types/studio";

interface StudioCardProps {
  studio: StudioCardType;
}

const sizeLabels: Record<string, string> = {
  micro: "Micro",
  pequeno: "Pequeno",
  medio: "Médio",
  grande: "Grande",
};

export function StudioCard({ studio }: StudioCardProps) {
  const { nome, slug, logo_url, cidade, estado, tamanho, especialidades: rawEspecialidades, website } = studio;
  const especialidades = rawEspecialidades ?? [];

  const location =
    cidade && estado ? `${cidade}, ${estado}` :
    estado ? estado :
    cidade ? cidade : null;

  const visibleSpecs = especialidades.slice(0, 3);
  const extraCount = especialidades.length > 3 ? especialidades.length - 3 : 0;

  return (
    <a
      href={`/studio/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <Card className="p-4 cursor-pointer bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
        {/* Header: Logo + Info + Size Badge */}
        <div className="flex gap-4 items-start">
          <Avatar className="w-12 h-12 flex-shrink-0 rounded-lg">
            <AvatarImage src={logo_url || undefined} alt={nome} className="rounded-lg" />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold rounded-lg">
              {nome.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-display font-semibold text-foreground truncate leading-tight">
                  {nome}
                </p>
                {location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{location}</span>
                  </p>
                )}
                {website && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                    <a
                      href={website.startsWith("http") ? website : `https://${website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-primary hover:underline truncate"
                    >
                      Website
                    </a>
                  </p>
                )}
              </div>

              {tamanho && (
                <Badge variant="secondary" className="text-xs flex-shrink-0 pointer-events-none">
                  {sizeLabels[tamanho] || tamanho}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Especialidades */}
        {especialidades.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-border/50">
            {visibleSpecs.map((spec) => (
              <Badge key={spec} variant="outline" className="text-xs">
                {spec}
              </Badge>
            ))}
            {extraCount > 0 && (
              <span className="text-xs text-muted-foreground">
                +{extraCount}
              </span>
            )}
          </div>
        )}
      </Card>
    </a>
  );
}
