import { Link } from "react-router-dom";
import { Sparkles, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatNivelVaga, formatTipoContrato, formatTipoTrabalho } from "@/lib/formatters";
import { VagaListItem } from "@/hooks/useJobs";

interface JobCardProps {
  job: VagaListItem;
}

export function JobCard({ job }: JobCardProps) {
  const isDestaque = job.tipo_publicacao === "destaque";

  // Show ALL skills (required + optional), not just required ones
  const allSkills = job.vaga_habilidades.filter((vh) => vh.habilidade !== null).map((vh) => vh.habilidade!);

  const visibleSkills = allSkills.slice(0, 5);
  const extraCount = allSkills.length - 5;

  const studioName = job.estudio?.nome || "Estúdio";

  // Build location string from estado/cidade
  const getLocationString = () => {
    const estudioLocation =
      job.estudio?.cidade && job.estudio?.estado ? `${job.estudio.cidade}, ${job.estudio.estado}` : null;
    const jobLocation = job.cidade && job.estado ? `${job.cidade}, ${job.estado}` : null;
    return estudioLocation || jobLocation;
  };
  const studioLocation = getLocationString();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <Link to={`/jobs/${job.slug}`} className="block">
      <Card
        className={cn(
          "p-4 cursor-pointer transition-all duration-200",
          isDestaque
            ? "bg-muted/50 border-border hover:border-primary/40 hover:shadow-[0_0_20px_rgba(34,228,122,0.15)]"
            : "bg-card/50 border-border/50 hover:border-border/70 hover:bg-card/70",
        )}
      >
        <div className="flex gap-4">
          {/* Studio Logo 48x48 */}
          <Avatar className="w-12 h-12 rounded-lg flex-shrink-0">
            <AvatarImage src={job.estudio?.logo_url || undefined} alt={studioName} />
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-sm">
              {getInitials(studioName)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header: Studio name + Destaque badge */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="font-medium text-foreground truncate block">{studioName}</span>
                {studioLocation && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{studioLocation}</span>
                  </p>
                )}
              </div>
              {isDestaque && (
                <Badge className="bg-primary/10 text-primary border-0 flex-shrink-0 pointer-events-none">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Destaque
                </Badge>
              )}
            </div>

            {/* Job Title */}
            <h3 className="font-semibold text-lg text-foreground leading-tight">{job.titulo}</h3>

            {/* Badges: Contract, Level, Work Model */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                {formatTipoContrato(job.tipo_emprego)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {formatNivelVaga(job.nivel)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {formatTipoTrabalho(job.remoto)}
              </Badge>
            </div>

            {/* Skills - show up to 5 + "+X" badge for remaining */}
            {allSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {visibleSkills.map((skill, index) => (
                  <Badge key={skill.id || index} variant="secondary" className="text-xs bg-muted/80">
                    {skill.nome}
                  </Badge>
                ))}
                {extraCount > 0 && (
                  <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                    +{extraCount}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
