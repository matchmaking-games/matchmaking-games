import { useState } from "react";
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
import { useToast } from "@/hooks/shared/use-toast";
import type { StudioVaga } from "@/hooks/studio/useStudioJobs";

interface JobsDeleteDialogProps {
  vaga: StudioVaga | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function JobsDeleteDialog({ vaga, open, onOpenChange, onConfirm }: JobsDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    if (!vaga) return;

    try {
      setIsDeleting(true);
      await onConfirm();

      toast({
        title: "Vaga excluída com sucesso",
        description: `A vaga "${vaga.titulo}" foi removida.`,
      });

      onOpenChange(false);
    } catch (err) {
      console.error("Error deleting vaga:", err);
      toast({
        title: "Erro ao excluir vaga",
        description: "Não foi possível excluir a vaga. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir vaga</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a vaga "{vaga?.titulo}"?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
