import { useState, useEffect } from "react";
import { z } from "zod";
import { CheckCircle, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  const [inviteCreated, setInviteCreated] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setEmail("");
      setRole("member");
      setEmailError(null);
      setIsSubmitting(false);
      setInviteCreated(false);
      setInviteLink("");
      setCopiedLink(false);
      setEmailSent(false);
    }
  }, [open]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      toast({ title: "Link copiado para área de transferência!" });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast({
        title: "Erro ao copiar link",
        description: "Tente selecionar e copiar manualmente.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    if (inviteCreated) onSuccess();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
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

      // Create invite and get token back
      const { data: newInvite, error } = await supabase
        .from("estudio_convites")
        .insert({
          estudio_id: estudioId,
          email_convidado: normalizedEmail,
          role: role,
          convidado_por: currentUserId,
        })
        .select("id, token")
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/invite/${newInvite.token}`;
      setInviteLink(link);
      setInviteCreated(true);

      // Try sending email (non-blocking)
      try {
        const { data: emailData, error: emailError } = await supabase.functions.invoke("send-invite-email", {
          body: { inviteId: newInvite.id },
        });

        if (emailError || !emailData?.success) {
          console.error("Erro ao enviar email de convite:", { error: emailError, data: emailData });
          setEmailSent(false);
          toast({
            title: "Convite criado! Compartilhe o link manualmente.",
            variant: "default",
          });
        } else {
          setEmailSent(true);
          toast({ title: `Email enviado para ${normalizedEmail}!` });
        }
      } catch (emailErr) {
        console.error("Erro ao enviar email de convite:", emailErr);
        setEmailSent(false);
        toast({
          title: "Convite criado! Compartilhe o link manualmente.",
          variant: "default",
        });
      }
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {inviteCreated ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Convite Criado!
              </DialogTitle>
              <DialogDescription>
                {emailSent
                  ? "Email enviado com sucesso! Ou compartilhe o link abaixo:"
                  : "Compartilhe este link com a pessoa convidada:"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Invite info */}
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email convidado:</span>
                  <span className="text-sm font-medium text-foreground">{email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Permissão:</span>
                  <Badge variant={role === "super_admin" ? "default" : "secondary"}>
                    {role === "super_admin" ? "Super Admin" : "Membro"}
                  </Badge>
                </div>
              </div>

              {/* Copyable link */}
              <div className="space-y-2">
                <Label>Link do convite:</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={inviteLink}
                    className="text-xs"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={handleCopyLink}
                  >
                    {copiedLink ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  💡 Você pode compartilhar este link diretamente com a pessoa convidada via WhatsApp, email ou qualquer outro meio. O link expira em 7 dias.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full sm:w-auto">
                Fechar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
