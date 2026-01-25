import { GraduationCap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EducationCard } from "./EducationCard";
import type { Education } from "@/hooks/useEducations";

interface EducationListProps {
  educations: Education[];
  loading: boolean;
  onEdit: (education: Education) => void;
  onDelete: (education: Education) => void;
}

export function EducationList({
  educations,
  loading,
  onEdit,
  onDelete,
}: EducationListProps) {
  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  // Empty state
  if (educations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <GraduationCap className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground max-w-sm mb-6">
          Você ainda não adicionou formação acadêmica
        </p>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Primeira Educação
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
        {educations.map((education) => (
          <div key={education.id} className="relative md:pl-10">
            {/* Timeline dot - desktop only */}
            <div className="hidden md:block absolute left-2.5 top-8 w-3 h-3 rounded-full bg-primary border-2 border-background z-10" />
            
            <EducationCard
              education={education}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
