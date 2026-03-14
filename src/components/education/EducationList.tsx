import { GraduationCap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EducationCard } from "./EducationCard";
import type { Education } from "@/hooks/dashboard/useEducations";

interface EducationListProps {
  educations: Education[];
  loading: boolean;
  onEdit: (education: Education) => void;
  onDelete: (education: Education) => void;
}

export function EducationList({ educations, loading, onEdit, onDelete }: EducationListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

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

  return (
    <div className="space-y-4">
      {educations.map((education) => (
        <EducationCard
          key={education.id}
          education={education}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
