import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProfileNavigation } from "@/components/dashboard/ProfileNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useSkills, type UserSkill } from "@/hooks/useSkills";
import { SkillCard } from "@/components/skills/SkillCard";
import { SkillModal } from "@/components/skills/SkillModal";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type NivelHabilidade = Database["public"]["Enums"]["nivel_habilidade"];

export default function Skills() {
  const { skills, loading, addSkill, updateSkill, deleteSkill } = useSkills();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<UserSkill | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<UserSkill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const existingSkillIds = skills.map((s) => s.habilidade.id);

  const handleOpenAddModal = () => {
    setEditingSkill(null);
    setModalOpen(true);
  };

  const handleEdit = (skill: UserSkill) => {
    setEditingSkill(skill);
    setModalOpen(true);
  };

  const handleDeleteClick = (skill: UserSkill) => {
    setSkillToDelete(skill);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!skillToDelete) return;

    try {
      setIsDeleting(true);
      await deleteSkill(skillToDelete.id);
      toast({
        title: "Habilidade removida",
        description: "A habilidade foi removida do seu perfil.",
      });
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a habilidade. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSkillToDelete(null);
    }
  };

  const handleSave = async (habilidadeId: string, nivel: NivelHabilidade) => {
    try {
      if (editingSkill) {
        await updateSkill(editingSkill.id, nivel);
        toast({
          title: "Habilidade atualizada!",
          description: "O nível de proficiência foi atualizado.",
        });
      } else {
        await addSkill(habilidadeId, nivel);
        toast({
          title: "Habilidade adicionada!",
          description: "A habilidade foi adicionada ao seu perfil.",
        });
      }
    } catch (error) {
      console.error("Error saving skill:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a habilidade. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <DashboardLayout>
      <ProfileNavigation />
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle className="text-2xl font-display font-semibold">
            Minhas Habilidades
          </CardTitle>
          <Button onClick={handleOpenAddModal}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Habilidade
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))}
            </div>
          ) : skills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground max-w-sm">
                Nenhuma habilidade cadastrada. Adicione suas skills para aparecer no seu portfólio.
              </p>
              <Button onClick={handleOpenAddModal} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Habilidade
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SkillModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editingSkill={editingSkill}
        existingSkillIds={existingSkillIds}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover habilidade?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A habilidade será removida do seu perfil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
