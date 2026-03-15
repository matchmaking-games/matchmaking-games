import { useState } from "react";
import { Plus } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProfileNavigation } from "@/components/dashboard/ProfileNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EducationList } from "@/components/education/EducationList";
import { EducationModal } from "@/components/education/EducationModal";
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
import { useEducations, type Education } from "@/hooks/dashboard/useEducations";
import { useToast } from "@/hooks/shared/use-toast";

export default function EducationPage() {
  const { educations, loading, error, refetch, deleteEducation, addEducation, updateEducation } = useEducations();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [deletingEducation, setDeletingEducation] = useState<Education | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAdd = () => {
    setEditingEducation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (education: Education) => {
    setEditingEducation(education);
    setIsModalOpen(true);
  };

  const handleDelete = (education: Education) => {
    setDeletingEducation(education);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingEducation(null);
    refetch();
  };

  const confirmDelete = async () => {
    if (!deletingEducation) return;

    try {
      setIsDeleting(true);
      await deleteEducation(deletingEducation.id);
      toast({
        title: "Formação removida",
        description: "A formação foi removida com sucesso.",
      });
      refetch();
    } catch (err) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a formação.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletingEducation(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">Meu Perfil</h1>

            <ProfileNavigation />

            <div className="flex items-start justify-between gap-3 mb-6">
              <p className="text-sm text-muted-foreground flex-1">Adicione sua formação acadêmica e certificações</p>
              <Button onClick={handleAdd} size="sm" className="flex-shrink-0">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>

            {error && <div className="text-destructive text-sm mb-4">{error}</div>}

            <EducationList educations={educations} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <EducationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingEducation={editingEducation}
        onSuccess={handleSuccess}
        addEducation={addEducation}
        updateEducation={updateEducation}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingEducation} onOpenChange={(open) => !open && setDeletingEducation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover formação?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{deletingEducation?.titulo}</strong> na{" "}
              <strong>{deletingEducation?.instituicao}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} variant="destructive">
              {isDeleting ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
