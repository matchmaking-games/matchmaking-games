import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/shared/use-toast";
import { useAccountSettings } from "@/hooks/dashboard/useAccountSettings";
import { supabase } from "@/integrations/supabase/client";

// ─── Email schema ────────────────────────────────────────────────────────────
const createEmailSchema = (currentEmail: string) =>
  z.object({
    newEmail: z
      .string()
      .min(1, "E-mail é obrigatório")
      .email("Formato de e-mail inválido")
      .refine((val) => val !== currentEmail, {
        message: "O novo e-mail deve ser diferente do atual",
      }),
  });

type EmailFormValues = { newEmail: string };

// ─── Password schema ─────────────────────────────────────────────────────────
const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function Settings() {
  const { toast } = useToast();
  const { updateEmail, updatePassword, isUpdatingEmail, isUpdatingPassword } = useAccountSettings();

  const [currentEmail, setCurrentEmail] = useState("");
  const [isEmailProvider, setIsEmailProvider] = useState(false);

  // Fetch current session info
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) return;
      setCurrentEmail(user.email ?? "");
      const provider = user.app_metadata?.provider;
      setIsEmailProvider(provider === "email");
    });
  }, []);

  // ── Email form ──────────────────────────────────────────────────────────────
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(createEmailSchema(currentEmail)),
    defaultValues: { newEmail: "" },
  });

  // Re-validate when currentEmail loads
  useEffect(() => {
    emailForm.clearErrors();
  }, [currentEmail]);

  const handleEmailSubmit = async (values: EmailFormValues) => {
    const { error } = await updateEmail(values.newEmail);
    if (error) {
      toast({ title: "Erro ao atualizar e-mail", description: error, variant: "destructive" });
      return;
    }
    toast({
      title: "Confirmação enviada",
      description: `Um link de confirmação foi enviado para ${values.newEmail}. A alteração será efetivada após a confirmação.`,
    });
    emailForm.reset();
  };

  // ── Password form ───────────────────────────────────────────────────────────
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    const { error } = await updatePassword(values.newPassword);
    if (error) {
      toast({ title: "Erro ao atualizar senha", description: error, variant: "destructive" });
      return;
    }
    toast({ title: "Senha atualizada", description: "Sua senha foi alterada com sucesso." });
    passwordForm.reset();
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="font-display text-3xl font-bold text-foreground">Configurações</h1>

        {/* ── Email Card ───────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">E-mail</CardTitle>
            <CardDescription>
              Após a alteração, um link de confirmação será enviado para o novo endereço. A mudança só será efetivada
              após você clicar no link de confirmação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                {/* Current email (read-only) */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">E-mail atual</Label>
                  <Input
                    value={currentEmail}
                    readOnly
                    disabled
                    className="text-muted-foreground cursor-default"
                  />
                </div>

                {/* New email */}
                <FormField
                  control={emailForm.control}
                  name="newEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Novo e-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="novo@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isUpdatingEmail}>
                    {isUpdatingEmail ? "Salvando..." : "Salvar novo e-mail"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* ── Password Card (email provider only) ─────────────────────────── */}
        {isEmailProvider && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Senha</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Mínimo 8 caracteres" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar nova senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Repita a nova senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isUpdatingPassword}>
                      {isUpdatingPassword ? "Salvando..." : "Atualizar senha"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
