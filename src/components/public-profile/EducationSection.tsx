import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { PublicEducationData } from "@/hooks/usePublicProfile";

interface EducationSectionProps {
  educations: PublicEducationData[];
}

const typeLabels: Record<string, string> = {
  graduacao: "Graduação",
  pos: "Pós-graduação",
  tecnico: "Técnico",
  curso: "Curso",
  certificacao: "Certificação",
};

const typeColors: Record<string, string> = {
  graduacao: "bg-blue-500/10 text-blue-500",
  pos: "bg-purple-500/10 text-purple-500",
  tecnico: "bg-orange-500/10 text-orange-500",
  curso: "bg-green-500/10 text-green-500",
  certificacao: "bg-yellow-500/10 text-yellow-600",
};

function formatPeriod(inicio: string | null, fim: string | null): string {
  if (!inicio && !fim) return "";
  
  const startYear = inicio ? new Date(inicio).getFullYear() : null;
  const endYear = fim ? new Date(fim).getFullYear() : null;

  if (startYear && endYear) {
    return startYear === endYear ? `${startYear}` : `${startYear} - ${endYear}`;
  }
  if (startYear) return `${startYear} - Atual`;
  if (endYear) return `${endYear}`;
  
  return "";
}

function EducationItem({ education }: { education: PublicEducationData }) {
  return (
    <div className="space-y-3 py-4 first:pt-0 last:pb-0">
      {/* Type badge */}
      <Badge className={`border-0 ${typeColors[education.tipo]}`}>
        {typeLabels[education.tipo] || education.tipo}
      </Badge>

      {/* Title */}
      <div>
        <h3 className="font-semibold text-foreground">
          {education.titulo}
        </h3>
        {education.area && (
          <p className="text-sm text-muted-foreground">
            {education.area}
          </p>
        )}
      </div>

      {/* Institution */}
      <p className="text-muted-foreground">{education.instituicao}</p>

      {/* Period and status */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {(education.inicio || education.fim) && (
          <span className="text-muted-foreground">
            {formatPeriod(education.inicio, education.fim)}
          </span>
        )}
        {education.concluido && (
          <Badge variant="outline" className="text-xs py-0">
            Concluído
          </Badge>
        )}
      </div>

      {/* Credential link */}
      {education.credencial_url && (
        <a
          href={education.credencial_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ver credencial
        </a>
      )}

      {/* Description */}
      {education.descricao && (
        <p className="text-sm text-muted-foreground">
          {education.descricao}
        </p>
      )}
    </div>
  );
}

export function EducationSection({ educations }: EducationSectionProps) {
  return (
    <section id="educacao" className="scroll-mt-20">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-display font-semibold text-foreground">
            Educação
          </h2>
        </CardHeader>
        <CardContent>
          {educations.length === 0 ? (
            <p className="text-muted-foreground italic">
              Nenhuma formação adicionada ainda.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {educations.map((education) => (
                <EducationItem key={education.id} education={education} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
