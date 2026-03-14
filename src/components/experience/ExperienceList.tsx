import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExperienceCard } from "./ExperienceCard";
import type { ExperienceWithCargos } from "@/hooks/dashboard/useExperiences";

interface ExperienceListProps {
  experiences: ExperienceWithCargos[];
  loading: boolean;
  onEdit: (experience: ExperienceWithCargos) => void;
  onDelete: (experience: ExperienceWithCargos) => void;
  onAddCargo: (experience: ExperienceWithCargos) => void;
}

export function ExperienceList({
  experiences,
  loading,
  onEdit,
  onDelete,
  onAddCargo,
}: ExperienceListProps) {
  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  // Empty state
  if (experiences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Briefcase className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground max-w-sm mb-6">
          Você ainda não adicionou experiências profissionais
        </p>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Primeira Experiência
        </Button>
      </div>
    );
  }

  // List without global timeline (timeline is now internal to cards with multiple cargos)
  return (
    <div className="space-y-4">
      {experiences.map((experience) => (
        <ExperienceCard
          key={experience.id}
          experience={experience}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddCargo={onAddCargo}
        />
      ))}
    </div>
  );
}
