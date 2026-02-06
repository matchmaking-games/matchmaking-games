import { useState, useEffect } from "react";
import { z } from "zod";
import { Loader2, Mail, Phone, Eye, EyeOff } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProfileNavigation } from "@/components/dashboard/ProfileNavigation";
import { AvatarUpload } from "@/components/dashboard/AvatarUpload";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const telefoneRegex = /^\(\d{2}\) \d{5}-\d{4}$|^$/;

const profileSchema = z.object({
  nome_completo: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  nome_exibicao: z.string().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
  titulo_profissional: z.string().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
  bio_curta: z.string().max(200, "Máximo 200 caracteres").optional().or(z.literal("")),
  localizacao: z.string().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
  telefone: z.string()
    .max(20, "Máximo 20 caracteres")
    .refine((val) => val === "" || telefoneRegex.test(val), {
      message: "Formato inválido. Use (XX) XXXXX-XXXX",
    })
    .optional()
    .or(z.literal("")),
});

type ValidationErrors = {
  [key: string]: string;
};

// Helper to remove mask characters from phone
const cleanPhone = (phone: string): string => {
  return phone.replace(/\D/g, "");
};

// Helper to format phone for display (from database)
const formatPhone = (phone: string | null): string => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return phone;
};

// Helper to format phone as user types
const formatPhoneInput = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : "";
  }
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [nomeExibicao, setNomeExibicao] = useState("");
  const [tituloProfissional, setTituloProfissional] = useState("");
  const [bioCurta, setBioCurta] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mostrarEmail, setMostrarEmail] = useState(false);
  const [mostrarTelefone, setMostrarTelefone] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setUserId(session.user.id);

    const { data, error } = await supabase
      .from("users")
      .select("nome_completo, nome_exibicao, titulo_profissional, bio_curta, estado, cidade, avatar_url, email, telefone, mostrar_email, mostrar_telefone")
      .eq("id", session.user.id)
      .single();

    if (data) {
      setNomeCompleto(data.nome_completo || "");
      setNomeExibicao(data.nome_exibicao || "");
      setTituloProfissional(data.titulo_profissional || "");
      setBioCurta(data.bio_curta || "");
      // Build localizacao from estado/cidade for display
      const loc = data.cidade && data.estado ? `${data.cidade}, ${data.estado}` : "";
      setLocalizacao(loc);
      setAvatarUrl(data.avatar_url);
      setEmail(data.email || "");
      setTelefone(formatPhone(data.telefone));
      setMostrarEmail(data.mostrar_email ?? false);
      setMostrarTelefone(data.mostrar_telefone ?? false);
    }

    if (error) {
      console.error("Erro ao carregar perfil:", error);
    }

    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const formData = {
      nome_completo: nomeCompleto,
      nome_exibicao: nomeExibicao,
      titulo_profissional: tituloProfissional,
      bio_curta: bioCurta,
      localizacao: localizacao,
      telefone: telefone,
    };

    const result = profileSchema.safeParse(formData);

    if (!result.success) {
      const errors: ValidationErrors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      return;
    }

    setIsSaving(true);

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      toast({
        title: "Erro",
        description: "Sessão expirada. Faça login novamente.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    // Clean phone number before saving (remove mask characters)
    const cleanedPhone = cleanPhone(telefone);

    // Parse localizacao back to estado/cidade for saving
    const [cidadeParsed, estadoParsed] = localizacao.includes(", ") 
      ? localizacao.split(", ") 
      : [null, null];

    const { error } = await supabase
      .from("users")
      .update({
        nome_completo: nomeCompleto,
        nome_exibicao: nomeExibicao || null,
        titulo_profissional: tituloProfissional || null,
        bio_curta: bioCurta || null,
        estado: estadoParsed || null,
        cidade: cidadeParsed || null,
        telefone: cleanedPhone || null,
        mostrar_email: mostrarEmail,
        mostrar_telefone: mostrarTelefone,
      })
      .eq("id", session.user.id);

    setIsSaving(false);

    if (error) {
      console.error("Erro ao salvar perfil:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar perfil. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Perfil atualizado com sucesso",
    });
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto">
        <Card className="w-full">
          <CardContent className="pt-6">
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              Meu Perfil
            </h1>
            <ProfileNavigation />

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Avatar Upload */}
                {userId && (
                  <AvatarUpload
                    userId={userId}
                    currentAvatarUrl={avatarUrl}
                    nomeCompleto={nomeCompleto}
                    onAvatarUpdated={(newUrl) => setAvatarUrl(newUrl)}
                  />
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nome Completo */}
                  <div className="space-y-2">
                    <Label htmlFor="nome_completo">Nome completo *</Label>
                    <Input
                      id="nome_completo"
                      value={nomeCompleto}
                      onChange={(e) => setNomeCompleto(e.target.value)}
                      className="h-11 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    {validationErrors.nome_completo && (
                      <p className="text-sm text-destructive">{validationErrors.nome_completo}</p>
                    )}
                  </div>

                  {/* Nome de Exibição */}
                  <div className="space-y-2">
                    <Label htmlFor="nome_exibicao">Nome de exibição</Label>
                    <Input
                      id="nome_exibicao"
                      value={nomeExibicao}
                      onChange={(e) => setNomeExibicao(e.target.value)}
                      className="h-11 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="text-xs text-muted-foreground">Como você aparece publicamente</p>
                    {validationErrors.nome_exibicao && (
                      <p className="text-sm text-destructive">{validationErrors.nome_exibicao}</p>
                    )}
                  </div>

                  {/* Título Profissional */}
                  <div className="space-y-2">
                    <Label htmlFor="titulo_profissional">Título profissional</Label>
                    <Input
                      id="titulo_profissional"
                      value={tituloProfissional}
                      onChange={(e) => setTituloProfissional(e.target.value)}
                      placeholder="Ex: Game Developer | Unity Specialist"
                      className="h-11 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    {validationErrors.titulo_profissional && (
                      <p className="text-sm text-destructive">{validationErrors.titulo_profissional}</p>
                    )}
                  </div>

                  {/* Bio Curta */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="bio_curta">Bio curta</Label>
                      <span className="text-xs text-muted-foreground">{bioCurta.length}/200</span>
                    </div>
                    <Textarea
                      id="bio_curta"
                      value={bioCurta}
                      onChange={(e) => setBioCurta(e.target.value)}
                      maxLength={200}
                      className="min-h-[100px] bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                    {validationErrors.bio_curta && (
                      <p className="text-sm text-destructive">{validationErrors.bio_curta}</p>
                    )}
                  </div>

                  {/* Localização */}
                  <div className="space-y-2">
                    <Label htmlFor="localizacao">Localização</Label>
                    <Input
                      id="localizacao"
                      value={localizacao}
                      onChange={(e) => setLocalizacao(e.target.value)}
                      placeholder="Ex: São Paulo, SP"
                      className="h-11 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    {validationErrors.localizacao && (
                      <p className="text-sm text-destructive">{validationErrors.localizacao}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-3">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        readOnly
                        disabled
                        className="h-11 pl-10 bg-muted border-border cursor-not-allowed"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="mostrar_email"
                        checked={mostrarEmail}
                        onCheckedChange={setMostrarEmail}
                      />
                      <label
                        htmlFor="mostrar_email"
                        className="text-sm text-muted-foreground flex items-center gap-1.5 cursor-pointer"
                      >
                        {mostrarEmail ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                        Mostrar email no portfólio público
                      </label>
                    </div>
                  </div>

                  {/* Telefone */}
                  <div className="space-y-3">
                    <Label htmlFor="telefone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="telefone"
                        value={telefone}
                        onChange={(e) => {
                          const formatted = formatPhoneInput(e.target.value);
                          setTelefone(formatted);
                        }}
                        placeholder="(11) 98765-4321"
                        maxLength={15}
                        className="h-11 pl-10 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    {validationErrors.telefone && (
                      <p className="text-sm text-destructive">{validationErrors.telefone}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Switch
                        id="mostrar_telefone"
                        checked={mostrarTelefone}
                        onCheckedChange={setMostrarTelefone}
                      />
                      <label
                        htmlFor="mostrar_telefone"
                        className="text-sm text-muted-foreground flex items-center gap-1.5 cursor-pointer"
                      >
                        {mostrarTelefone ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                        Mostrar telefone no portfólio público
                      </label>
                    </div>
                  </div>

                  {/* Botão Submit */}
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full h-12 text-base font-semibold"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Alterações"
                    )}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
