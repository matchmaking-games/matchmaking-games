import { useState } from "react";
import { MapPin, Home, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, differenceInMonths, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PublicExperienceData, PublicCargoData } from "@/hooks/usePublicProfile";
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
  const startFormatted = format(startDate, "MMM yyyy", {
    locale: ptBR,
  });
  const endFormatted =
    atualmente || !fim
      ? "Atualmente"
      : format(endDate, "MMM yyyy", {
          locale: ptBR,
        });
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

// Component for individual cargo in timeline
function CargoItem({ cargo }: { cargo: PublicCargoData }) {
  const [expanded, setExpanded] = useState(false);
  const hasLongDescription = cargo.descricao && cargo.descricao.length > 300;
  return (
    <div className="relative pb-6 last:pb-0">
      {/* Timeline dot */}
      <div className="absolute left-0 top-1.5 h-4 w-4 -translate-x-1/2 -translate-x-px rounded-full bg-primary border-2 border-background" />

      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-medium text-foreground">{cargo.titulo_cargo}</h4>
          <Badge className={`border-0 ${typeColors[cargo.tipo_emprego]}`}>{typeLabels[cargo.tipo_emprego]}</Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          {formatPeriod(cargo.inicio, cargo.fim, cargo.atualmente_trabalhando)}{" "}
          <span className="text-muted-foreground/70">{formatDuration(cargo.inicio, cargo.fim)}</span>
        </p>

        {cargo.descricao && (
          <div className="pt-1">
            <p
              className={`text-sm text-muted-foreground whitespace-pre-wrap ${!expanded && hasLongDescription ? "line-clamp-3" : ""}`}
            >
              {cargo.descricao}
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
    </div>
  );
}
function ExperienceItem({ experience }: { experience: PublicExperienceData }) {
  const [expanded, setExpanded] = useState(false);
  const hasCargos = experience.cargos && experience.cargos.length > 0;
  const location =
    experience.cidade && experience.estado ? `${experience.cidade}, ${experience.estado}` : experience.localizacao;

  // Layout COM multiplos cargos (timeline interna)
  if (hasCargos) {
    return (
      <div className="space-y-4">
        {/* Header da empresa */}
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-semibold text-foreground">{experience.empresa}</h3>
            {(location || experience.remoto) && (
              <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
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
              </p>
            )}
          </div>
        </div>

        {/* Timeline interna de cargos */}
        <div className="relative ml-5 pl-6 border-l-2 border-border">
          {experience.cargos.map((cargo) => (
            <CargoItem key={cargo.id} cargo={cargo} />
          ))}
        </div>
      </div>
    );
  }

  // Layout SEM cargos extras (cargo unico - layout original sem timeline)
  const hasLongDescription = experience.descricao && experience.descricao.length > 300;
  return (
    <div className="space-y-2">
      {/* Title and type */}
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-foreground">{experience.titulo_cargo}</h3>
        <Badge className={`border-0 ${typeColors[experience.tipo_emprego]}`}>
          {typeLabels[experience.tipo_emprego]}
        </Badge>
      </div>

      {/* Company */}
      <p className="text-muted-foreground">{experience.empresa}</p>

      {/* Period */}
      <p className="text-sm text-muted-foreground">
        {formatPeriod(experience.inicio, experience.fim, experience.atualmente_trabalhando)}{" "}
        <span className="text-muted-foreground/70">{formatDuration(experience.inicio, experience.fim)}</span>
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
            className={`text-sm text-muted-foreground whitespace-pre-wrap ${!expanded && hasLongDescription ? "line-clamp-4" : ""}`}
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
    <section id="experiencia" className="scroll-mt-20 space-y-6">
      <h2 className="text-xl font-display font-semibold text-foreground">Experiência Profissional</h2>

      {experiences.length === 0 ? (
        <p className="text-muted-foreground italic">Nenhuma experiência adicionada ainda.</p>
      ) : (
        <div className="space-y-8">
          {experiences.map((experience) => (
            <ExperienceItem key={experience.id} experience={experience} />
          ))}
        </div>
      )}
    </section>
  );
}
