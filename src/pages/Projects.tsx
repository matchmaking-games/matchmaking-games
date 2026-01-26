import { useState } from "react";
import { Plus } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProfileNavigation } from "@/components/dashboard/ProfileNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useProjects, type ProjectWithSkills } from "@/hooks/useProjects";
import { ProjectsList } from "@/components/projects/ProjectsList";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { ProjectDeleteDialog } from "@/components/projects/ProjectDeleteDialog";

export default function ProjectsPage() {
  const {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    toggleDestaque,
    saveProjectSkills,
  } = useProjects();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithSkills | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectWithSkills | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAdd = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEdit = (project: ProjectWithSkills) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = (project: ProjectWithSkills) => {
    setDeletingProject(project);
  };

  const handleToggleDestaque = async (id: string, currentValue: boolean) => {
    try {
      await toggleDestaque(id, currentValue);
      toast({
        title: currentValue ? "Destaque removido" : "Projeto destacado!",
      });
    } catch {
      toast({
        title: "Erro ao atualizar destaque",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    try {
      await deleteProject(deletingProject.id);
      toast({ title: "Projeto excluído" });
      setDeletingProject(null);
    } catch {
      toast({ title: "Erro ao excluir projeto", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              Meu Perfil
            </h1>

            <ProfileNavigation />

            <div className="flex items-start justify-between gap-4 mb-6">
              <p className="text-muted-foreground">
                Adicione seus projetos e jogos para mostrar seu trabalho
              </p>
              {projects.length > 0 && (
                <Button onClick={handleAdd} className="flex-shrink-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Projeto
                </Button>
              )}
            </div>

            <ProjectsList
              projects={projects}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleDestaque={handleToggleDestaque}
              onAddFirst={handleAdd}
            />
          </CardContent>
        </Card>
      </div>

      <ProjectForm
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingProject={editingProject}
        onSuccess={handleSuccess}
        createProject={createProject}
        updateProject={updateProject}
        saveProjectSkills={saveProjectSkills}
      />

      <ProjectDeleteDialog
        open={!!deletingProject}
        onOpenChange={(open) => !open && setDeletingProject(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        projectTitle={deletingProject?.titulo}
      />
    </DashboardLayout>
  );
}
