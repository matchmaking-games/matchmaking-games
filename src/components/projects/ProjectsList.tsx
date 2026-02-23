import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectCard } from "./ProjectCard";
import type { ProjectWithSkills } from "@/hooks/useProjects";

interface ProjectsListProps {
  projects: ProjectWithSkills[];
  loading: boolean;
  userSlug?: string;
  onEdit: (project: ProjectWithSkills) => void;
  onDelete: (project: ProjectWithSkills) => void;
  onToggleDestaque: (id: string, currentValue: boolean) => void;
  onAddFirst: () => void;
}

export function ProjectsList({
  projects,
  loading,
  userSlug,
  onEdit,
  onDelete,
  onToggleDestaque,
  onAddFirst,
}: ProjectsListProps) {
  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <Briefcase className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Nenhum projeto ainda</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          Mostre seu trabalho para estúdios. Adicione jogos, protótipos ou
          projetos de game jam.
        </p>
        <Button size="lg" onClick={onAddFirst}>
          <Plus className="h-5 w-5 mr-2" />
          Criar Primeiro Projeto
        </Button>
      </div>
    );
  }

  // Project grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          userSlug={userSlug}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleDestaque={onToggleDestaque}
        />
      ))}
    </div>
  );
}
