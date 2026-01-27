import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExperienceCard } from "./ExperienceCard";
import type { Experience } from "@/hooks/useExperiences";

interface ExperienceListProps {
  experiences: Experience[];
  loading: boolean;
  onEdit: (experience: Experience) => void;
  onDelete: (experience: Experience) => void;
}

export function ExperienceList({
  experiences,
  loading,
  onEdit,
  onDelete,
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

  // List with timeline
  return (
    <div className="relative">
      {/* Vertical timeline line - desktop only */}
      <div className="hidden md:block absolute left-4 top-6 bottom-6 w-0.5 bg-border" />

      <div className="space-y-4">
        {experiences.map((experience) => (
          <div key={experience.id} className="relative md:pl-10">
            {/* Timeline dot - desktop only */}
            <div className="hidden md:block absolute left-2.5 top-8 w-3 h-3 rounded-full bg-primary border-2 border-background z-10" />
            
            <ExperienceCard
              experience={experience}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
