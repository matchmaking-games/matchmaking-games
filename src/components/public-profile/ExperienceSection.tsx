import { useState } from "react";
import { MapPin, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format, differenceInMonths, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PublicExperienceData } from "@/hooks/usePublicProfile";

interface ExperienceSectionProps {
  experiences: PublicExperienceData[];
}

const typeLabels: Record<string, string> = {
  clt: "CLT",
  pj: "PJ",
  freelance: "Freelance",
  estagio: "Estágio",
};

const typeColors: Record<string, string> = {
  clt: "bg-blue-500/10 text-blue-500",
  pj: "bg-purple-500/10 text-purple-500",
  freelance: "bg-orange-500/10 text-orange-500",
  estagio: "bg-green-500/10 text-green-500",
};

function formatPeriod(inicio: string, fim: string | null, atualmente: boolean | null): string {
  const startDate = new Date(inicio);
  const endDate = fim ? new Date(fim) : new Date();
  
  const startFormatted = format(startDate, "MMM yyyy", { locale: ptBR });
  const endFormatted = atualmente || !fim 
    ? "Atualmente" 
    : format(endDate, "MMM yyyy", { locale: ptBR });

  return `${startFormatted} - ${endFormatted}`;
}

function formatDuration(inicio: string, fim: string | null): string {
  const startDate = new Date(inicio);
  const endDate = fim ? new Date(fim) : new Date();
  
  const years = differenceInYears(endDate, startDate);
  const months = differenceInMonths(endDate, startDate) % 12;

  const parts: string[] = [];
  if (years > 0) {
    parts.push(`${years} ${years === 1 ? "ano" : "anos"}`);
  }
  if (months > 0) {
    parts.push(`${months} ${months === 1 ? "mês" : "meses"}`);
  }

  return parts.length > 0 ? `(${parts.join(" e ")})` : "";
}

function ExperienceItem({ experience }: { experience: PublicExperienceData }) {
  const [expanded, setExpanded] = useState(false);
  
  const location = experience.cidade && experience.estado
    ? `${experience.cidade}, ${experience.estado}`
    : experience.localizacao;

  const hasLongDescription = experience.descricao && experience.descricao.length > 300;

  return (
    <div className="space-y-2 py-4 first:pt-0 last:pb-0">
      {/* Title and type */}
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-foreground">
          {experience.titulo_cargo}
        </h3>
        <Badge className={`border-0 ${typeColors[experience.tipo_emprego]}`}>
          {typeLabels[experience.tipo_emprego]}
        </Badge>
      </div>

      {/* Company */}
      <p className="text-muted-foreground">{experience.empresa}</p>

      {/* Period */}
      <p className="text-sm text-muted-foreground">
        {formatPeriod(experience.inicio, experience.fim, experience.atualmente_trabalhando)}{" "}
        <span className="text-muted-foreground/70">
          {formatDuration(experience.inicio, experience.fim)}
        </span>
      </p>

      {/* Location and remote */}
      {(location || experience.remoto) && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {location}
            </span>
          )}
          {experience.remoto && (
            <Badge variant="outline" className="text-xs py-0">
              <Home className="w-3 h-3 mr-1" />
              Remoto
            </Badge>
          )}
        </div>
      )}

      {/* Description */}
      {experience.descricao && (
        <div className="pt-2">
          <p
            className={`text-sm text-muted-foreground whitespace-pre-wrap ${
              !expanded && hasLongDescription ? "line-clamp-4" : ""
            }`}
          >
            {experience.descricao}
          </p>
          {hasLongDescription && (
            <Button
              variant="link"
              size="sm"
              className="px-0 h-auto text-primary"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Ler menos" : "Ler mais"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  return (
    <section id="experiencia" className="scroll-mt-20">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-display font-semibold text-foreground">
            Experiência Profissional
          </h2>
        </CardHeader>
        <CardContent>
          {experiences.length === 0 ? (
            <p className="text-muted-foreground italic">
              Nenhuma experiência adicionada ainda.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {experiences.map((experience) => (
                <ExperienceItem key={experience.id} experience={experience} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
