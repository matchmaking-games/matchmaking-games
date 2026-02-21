import { useState } from "react";
import { AlertTriangle, ShieldCheck, Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface ImportConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (file: File) => void;
  pdfFile: File | null;
}

export function ImportConfirmModal({
  open,
  onClose,
  onConfirm,
  pdfFile,
}: ImportConfirmModalProps) {
  const [confirmed, setConfirmed] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setConfirmed(false);
      onClose();
    }
  };

  const handleConfirm = () => {
    if (pdfFile && confirmed) {
      setConfirmed(false);
      onConfirm(pdfFile);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Atenção: seus dados serão substituídos
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 pt-2">
              {/* O que será substituído */}
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 space-y-1">
                <p className="text-sm font-medium text-destructive">
                  Ao confirmar, serão substituídos:
                </p>
                <ul className="text-sm text-destructive/90 list-disc list-inside space-y-0.5">
                  <li>Todas as suas experiências profissionais</li>
                  <li>Toda a sua formação acadêmica</li>
                  <li>Suas skills principais</li>
                </ul>
              </div>

              {/* O que será preservado */}
              <div className="rounded-md border border-primary/30 bg-primary/10 p-3 space-y-1">
                <p className="text-sm font-medium text-primary flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  Serão mantidos:
                </p>
                <ul className="text-sm text-primary/90 list-disc list-inside space-y-0.5">
                  <li>Suas informações básicas (bio, localização, telefone)</li>
                  <li>Seus projetos adicionados manualmente</li>
                  <li>Suas configurações de conta</li>
                </ul>
              </div>

              {/* Observação */}
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                Recomendamos usar esta função ao criar seu perfil pela primeira vez ou para atualizações completas. Um backup dos seus dados atuais será criado automaticamente antes da importação.
              </p>

              {/* Checkbox */}
              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <Checkbox
                  checked={confirmed}
                  onCheckedChange={(v) => setConfirmed(v === true)}
                  className="mt-0.5"
                />
                <span className="text-sm text-foreground leading-tight">
                  Entendo que minhas experiências, formações e skills serão substituídas
                </span>
              </label>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={!confirmed}
            onClick={handleConfirm}
          >
            Confirmar importação
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
