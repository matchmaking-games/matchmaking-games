import { useState } from "react";
import { Plus } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProfileNavigation } from "@/components/dashboard/ProfileNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExperienceList } from "@/components/experience/ExperienceList";
import { ExperienceModal } from "@/components/experience/ExperienceModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useExperiences, type ExperienceWithCargos } from "@/hooks/useExperiences";
import { useToast } from "@/hooks/use-toast";

export default function ExperiencePage() {
  const { experiences, loading, error, refetch, deleteExperience } = useExperiences();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "add-position">("create");
  const [editingExperience, setEditingExperience] = useState<ExperienceWithCargos | null>(null);
  const [parentExperience, setParentExperience] = useState<ExperienceWithCargos | null>(null);
  const [deletingExperience, setDeletingExperience] = useState<ExperienceWithCargos | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAdd = () => {
    setModalMode("create");
    setEditingExperience(null);
    setParentExperience(null);
    setIsModalOpen(true);
  };

  const handleEdit = (experience: ExperienceWithCargos) => {
    setModalMode("edit");
    setEditingExperience(experience);
    setParentExperience(null);
    setIsModalOpen(true);
  };

  const handleAddCargo = (experience: ExperienceWithCargos) => {
    setModalMode("add-position");
    setEditingExperience(null);
    setParentExperience(experience);
    setIsModalOpen(true);
  };

  const handleDelete = (experience: ExperienceWithCargos) => {
    setDeletingExperience(experience);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingExperience(null);
    setParentExperience(null);
    refetch();
  };

  const confirmDelete = async () => {
    if (!deletingExperience) return;

    try {
      setIsDeleting(true);
      await deleteExperience(deletingExperience.id);
      toast({
        title: "Experiência removida",
        description: "A experiência foi removida com sucesso.",
      });
      refetch();
    } catch (err) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a experiência.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletingExperience(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">Meu Perfil</h1>

            <ProfileNavigation />

            <div className="flex items-start justify-between gap-4 mb-6">
              <p className="text-muted-foreground">Adicione suas experiências profissionais na indústria de games</p>
              <Button onClick={handleAdd} className="flex-shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>

            {error && <div className="text-destructive text-sm mb-4">{error}</div>}

            <ExperienceList
              experiences={experiences}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddCargo={handleAddCargo}
            />
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <ExperienceModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingExperience={editingExperience}
        onSuccess={handleSuccess}
        mode={modalMode}
        parentExperience={parentExperience}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingExperience} onOpenChange={(open) => !open && setDeletingExperience(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover experiência?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a experiência de <strong>{deletingExperience?.titulo_cargo}</strong> na{" "}
              <strong>{deletingExperience?.empresa}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? "Removendo..." : "Remover"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
