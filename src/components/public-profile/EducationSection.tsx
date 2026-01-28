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
  graduacao: "bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30",
  pos: "bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30",
  tecnico: "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30",
  curso: "bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30",
  certificacao: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30",
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

export function EducationSection({ educations }: EducationSectionProps) {
  return (
    <Card id="educacao" className="scroll-mt-32">
      <CardHeader>
        <h2 className="text-xl font-display font-semibold text-foreground">Educação</h2>
      </CardHeader>
      <CardContent>
        {educations.length === 0 ? (
          <p className="text-muted-foreground italic">Nenhuma formação adicionada ainda.</p>
        ) : (
          <div className="divide-y divide-border">
            {educations.map((education, index) => (
              <div key={education.id} className={index === 0 ? "pb-6" : "py-6"}>
                <div className="space-y-3">
                  {/* Type badge */}
                  <Badge className={`border-0 ${typeColors[education.tipo]}`}>
                    {typeLabels[education.tipo] || education.tipo}
                  </Badge>

                  {/* Title */}
                  <div>
                    <h3 className="font-semibold text-foreground">{education.titulo}</h3>
                    {education.area && <p className="text-sm text-muted-foreground">{education.area}</p>}
                  </div>

                  {/* Institution */}
                  <p className="text-muted-foreground">{education.instituicao}</p>

                  {/* Period and status */}
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {(education.inicio || education.fim) && (
                      <span className="text-muted-foreground">{formatPeriod(education.inicio, education.fim)}</span>
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
                    <p className="text-sm text-muted-foreground pt-2 border-t border-border">{education.descricao}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
