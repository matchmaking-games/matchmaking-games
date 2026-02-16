import { useState, useEffect } from "react";
import { z } from "zod";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["user_role"];

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estudioId: string;
  currentUserId: string;
  onSuccess: () => void;
}

const emailSchema = z.string().email("Email inválido");

export function InviteMemberDialog({
  open, onOpenChange, estudioId, currentUserId, onSuccess,
}: InviteMemberDialogProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setEmail("");
      setRole("member");
      setEmailError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    // Validate email
    const parsed = emailSchema.safeParse(email.trim());
    if (!parsed.success) {
      setEmailError("Email inválido");
      return;
    }
    setEmailError(null);

    const normalizedEmail = email.trim().toLowerCase();

    setIsSubmitting(true);
    try {
      // Check if email is already an active member
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (existingUser) {
        const { data: existingMember } = await supabase
          .from("estudio_membros")
          .select("id")
          .eq("user_id", existingUser.id)
          .eq("estudio_id", estudioId)
          .eq("ativo", true)
          .maybeSingle();

        if (existingMember) {
          setEmailError("Este email já é membro do estúdio");
          return;
        }
      }

      // Check for pending invite
      const { data: pendingInvite } = await supabase
        .from("estudio_convites")
        .select("id")
        .eq("email_convidado", normalizedEmail)
        .eq("estudio_id", estudioId)
        .eq("aceito", false)
        .gt("expira_em", new Date().toISOString())
        .maybeSingle();

      if (pendingInvite) {
        setEmailError("Já existe um convite pendente para este email");
        return;
      }

      // Create invite
      const { error } = await supabase.from("estudio_convites").insert({
        estudio_id: estudioId,
        email_convidado: normalizedEmail,
        role: role,
        convidado_por: currentUserId,
      });

      if (error) throw error;

      toast({
        title: "Convite enviado",
        description: `Convite enviado para ${normalizedEmail}!`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Erro ao enviar convite",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar Novo Membro</DialogTitle>
          <DialogDescription>
            Um convite será criado e ficará válido por 7 dias. A pessoa convidada precisará acessar o link de convite para aceitar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
              disabled={isSubmitting}
            />
            {emailError && (
              <p className="text-sm text-destructive">{emailError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role">Permissão</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)} disabled={isSubmitting}>
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Membro</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !email.trim()}>
            {isSubmitting ? "Enviando..." : "Enviar Convite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
