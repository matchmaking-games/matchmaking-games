import { useState, useEffect } from "react";
import { z } from "zod";
import { Loader2, Mail, Phone, Eye, EyeOff, Check, X, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProfileNavigation } from "@/components/dashboard/ProfileNavigation";
import { AvatarUpload } from "@/components/dashboard/AvatarUpload";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIBGELocations } from "@/hooks/useIBGELocations";
import { useDebounce } from "@/hooks/useDebounce";

const telefoneRegex = /^\(\d{2}\) \d{5}-\d{4}$|^$/;
const slugRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

const profileSchema = z.object({
  nome_completo: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Máximo 100 caracteres"),
  slug: z.string()
    .min(3, "Mínimo 3 caracteres")
    .max(30, "Máximo 30 caracteres")
    .regex(slugRegex, "Use apenas letras minúsculas, números e hífen"),
  pronomes: z.string().max(30, "Máximo 30 caracteres").optional().or(z.literal("")),
  titulo_profissional: z.string().max(150, "Máximo 150 caracteres").optional().or(z.literal("")),
  bio_curta: z.string().max(200, "Máximo 200 caracteres").optional().or(z.literal("")),
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

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

const cleanPhone = (phone: string): string => phone.replace(/\D/g, "");

const formatPhone = (phone: string | null): string => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return phone;
};

const formatPhoneInput = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return digits.length > 0 ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

const filterSlugInput = (value: string): string => {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30);
};

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [slug, setSlug] = useState("");
  const [originalSlug, setOriginalSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [pronomes, setPronomes] = useState("");
  const [tituloProfissional, setTituloProfissional] = useState("");
  const [disponivelParaTrabalho, setDisponivelParaTrabalho] = useState(false);
  const [bioCurta, setBioCurta] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mostrarEmail, setMostrarEmail] = useState(false);
  const [mostrarTelefone, setMostrarTelefone] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const debouncedSlug = useDebounce(slug, 500);
  const { estados, municipios, loadingEstados, loadingMunicipios, fetchMunicipios } = useIBGELocations();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (estado) fetchMunicipios(estado);
  }, [estado, fetchMunicipios]);

  // Slug availability check
  useEffect(() => {
    if (!debouncedSlug || !userId) return;

    // Validate format first
    if (debouncedSlug.length < 3) {
      setSlugStatus("invalid");
      return;
    }
    if (!slugRegex.test(debouncedSlug)) {
      setSlugStatus("invalid");
      return;
    }

    // If unchanged, it's available
    if (debouncedSlug === originalSlug) {
      setSlugStatus("available");
      return;
    }

    const checkAvailability = async () => {
      setSlugStatus("checking");
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("slug", debouncedSlug)
        .maybeSingle();

      if (error) {
        setSlugStatus("invalid");
        return;
      }
      setSlugStatus(!data || data.id === userId ? "available" : "taken");
    };

    checkAvailability();
  }, [debouncedSlug, originalSlug, userId]);

  // Update slug status on typing (before debounce)
  const handleSlugChange = (value: string) => {
    const filtered = filterSlugInput(value);
    setSlug(filtered);
    if (!filtered || filtered.length < 3) {
      setSlugStatus("invalid");
    } else if (!slugRegex.test(filtered)) {
      setSlugStatus("invalid");
    } else if (filtered === originalSlug) {
      setSlugStatus("available");
    } else {
      setSlugStatus("checking");
    }
  };

  const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setUserId(session.user.id);

    const { data, error } = await supabase
      .from("users")
      .select("nome_completo, titulo_profissional, bio_curta, estado, cidade, avatar_url, email, telefone, mostrar_email, mostrar_telefone, slug, pronomes, disponivel_para_trabalho")
      .eq("id", session.user.id)
      .single();

    if (data) {
      setNomeCompleto(data.nome_completo || "");
      setTituloProfissional(data.titulo_profissional || "");
      setBioCurta(data.bio_curta || "");
      setEstado(data.estado || "");
      setCidade(data.cidade || "");
      setAvatarUrl(data.avatar_url);
      setEmail(data.email || "");
      setTelefone(formatPhone(data.telefone));
      setMostrarEmail(data.mostrar_email ?? false);
      setMostrarTelefone(data.mostrar_telefone ?? false);
      setSlug(data.slug || "");
      setOriginalSlug(data.slug || "");
      setPronomes(data.pronomes || "");
      setDisponivelParaTrabalho(data.disponivel_para_trabalho ?? false);
      if (data.slug) setSlugStatus("available");
    }

    if (error) console.error("Erro ao carregar perfil:", error);
    setIsLoading(false);
  };

  const handleEstadoChange = (uf: string) => {
    setEstado(uf);
    setCidade("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    if (slugStatus === "checking" || slugStatus === "taken" || slugStatus === "invalid") {
      toast({ title: "Erro", description: "Corrija o username antes de salvar.", variant: "destructive" });
      return;
    }

    const formData = {
      nome_completo: nomeCompleto,
      slug,
      pronomes,
      titulo_profissional: tituloProfissional,
      bio_curta: bioCurta,
      telefone: telefone,
    };

    const result = profileSchema.safeParse(formData);

    if (!result.success) {
      const errors: ValidationErrors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0] as string] = err.message;
      });
      setValidationErrors(errors);
      return;
    }

    setIsSaving(true);

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      toast({ title: "Erro", description: "Sessão expirada. Faça login novamente.", variant: "destructive" });
      setIsSaving(false);
      return;
    }

    const cleanedPhone = cleanPhone(telefone);

    const { error } = await supabase
      .from("users")
      .update({
        nome_completo: nomeCompleto,
        slug,
        pronomes: pronomes || null,
        titulo_profissional: tituloProfissional || null,
        bio_curta: bioCurta || null,
        estado: estado || null,
        cidade: cidade || null,
        telefone: cleanedPhone || null,
        mostrar_email: mostrarEmail,
        mostrar_telefone: mostrarTelefone,
        disponivel_para_trabalho: disponivelParaTrabalho,
      })
      .eq("id", session.user.id);

    setIsSaving(false);

    if (error) {
      console.error("Erro ao salvar perfil:", error);
      toast({ title: "Erro", description: "Erro ao salvar perfil. Tente novamente.", variant: "destructive" });
      return;
    }

    setOriginalSlug(slug);
    toast({ title: "Sucesso", description: "Perfil atualizado com sucesso" });
  };

  const slugIcon = () => {
    switch (slugStatus) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case "available":
        return <Check className="h-4 w-4 text-primary" />;
      case "taken":
        return <X className="h-4 w-4 text-destructive" />;
      case "invalid":
        return slug.length > 0 ? <AlertTriangle className="h-4 w-4 text-yellow-500" /> : null;
      default:
        return null;
    }
  };

  const slugMessage = () => {
    if (!slug) return null;
    switch (slugStatus) {
      case "checking":
        return <span className="text-muted-foreground">Verificando disponibilidade...</span>;
      case "available":
        return <span className="text-primary">✓ Username disponível</span>;
      case "taken":
        return <span className="text-destructive">✗ Este username já está em uso</span>;
      case "invalid":
        if (slug.length < 3) return <span className="text-yellow-500">Mínimo 3 caracteres</span>;
        return <span className="text-yellow-500">Use apenas letras minúsculas, números e hífen</span>;
      default:
        return null;
    }
  };

  const isSaveDisabled = isSaving || slugStatus === "checking" || slugStatus === "taken" || slugStatus === "invalid";

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              Meu Perfil
            </h1>
            <ProfileNavigation />
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4 pb-6 border-b border-border">
                  <AvatarUpload
                    userId={userId || ""}
                    currentAvatarUrl={avatarUrl}
                    nomeCompleto={nomeCompleto}
                    onAvatarUpdated={setAvatarUrl}
                  />
                </div>

                {/* Form Fields */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="nome_completo">
                      Nome <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nome_completo"
                      value={nomeCompleto}
                      onChange={(e) => setNomeCompleto(e.target.value)}
                      placeholder="Seu nome"
                      maxLength={100}
                      className="h-11 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    {validationErrors.nome_completo && (
                      <p className="text-sm text-destructive">{validationErrors.nome_completo}</p>
                    )}
                  </div>

                  {/* Slug */}
                  <div className="space-y-2">
                    <Label htmlFor="slug">
                      Slug <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="slug"
                        value={slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="seu-username"
                        maxLength={30}
                        className="h-11 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 lowercase pr-10"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {slugIcon()}
                      </div>
                    </div>
                    {slug && (
                      <p className="text-xs text-muted-foreground">
                        matchmaking.games/p/{slug}
                      </p>
                    )}
                    {slugMessage() && (
                      <p className="text-sm">{slugMessage()}</p>
                    )}
                    {validationErrors.slug && (
                      <p className="text-sm text-destructive">{validationErrors.slug}</p>
                    )}
                  </div>

                  {/* Pronomes */}
                  <div className="space-y-2">
                    <Label htmlFor="pronomes">Pronomes</Label>
                    <Input
                      id="pronomes"
                      value={pronomes}
                      onChange={(e) => setPronomes(e.target.value)}
                      placeholder="Ex: ele/dele, ela/dela, elu/delu"
                      maxLength={30}
                      className="h-11 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="text-xs text-muted-foreground">Como você prefere ser chamado(a)</p>
                    {validationErrors.pronomes && (
                      <p className="text-sm text-destructive">{validationErrors.pronomes}</p>
                    )}
                  </div>

                  {/* Título Profissional */}
                  <div className="space-y-2">
                    <Label htmlFor="titulo_profissional">Título profissional</Label>
                    <Input
                      id="titulo_profissional"
                      value={tituloProfissional}
                      onChange={(e) => setTituloProfissional(e.target.value)}
                      placeholder="Ex: Game Designer, Desenvolvedor Unity"
                      maxLength={150}
                      className="h-11 bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    {validationErrors.titulo_profissional && (
                      <p className="text-sm text-destructive">{validationErrors.titulo_profissional}</p>
                    )}
                  </div>

                  {/* Disponível para trabalho */}
                  <div className="space-y-3 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="disponivel_para_trabalho" className="cursor-pointer">
                        Disponível para trabalho
                      </Label>
                      <Switch
                        id="disponivel_para_trabalho"
                        checked={disponivelParaTrabalho}
                        onCheckedChange={setDisponivelParaTrabalho}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {disponivelParaTrabalho ? (
                        <span className="flex items-center gap-1 text-primary">
                          <Check className="h-4 w-4" />
                          Seu perfil mostra que você está aberto a oportunidades
                        </span>
                      ) : (
                        "Seu perfil não indica que você está procurando oportunidades"
                      )}
                    </p>
                  </div>

                  {/* Bio Curta */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio_curta">Bio curta</Label>
                    <Textarea
                      id="bio_curta"
                      value={bioCurta}
                      onChange={(e) => setBioCurta(e.target.value)}
                      placeholder="Uma breve descrição sobre você (máx. 200 caracteres)"
                      maxLength={200}
                      className="min-h-[100px] bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                    {validationErrors.bio_curta && (
                      <p className="text-sm text-destructive">{validationErrors.bio_curta}</p>
                    )}
                  </div>

                  {/* Estado */}
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={estado} onValueChange={handleEstadoChange}>
                      <SelectTrigger className="h-11 bg-input border-border">
                        <SelectValue placeholder={loadingEstados ? "Carregando..." : "Selecione o estado"} />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((est) => (
                          <SelectItem key={est.sigla} value={est.sigla}>
                            {est.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cidade */}
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Select value={cidade} onValueChange={setCidade} disabled={!estado}>
                      <SelectTrigger className="h-11 bg-input border-border">
                        <SelectValue placeholder={
                          !estado
                            ? "Selecione um estado primeiro"
                            : loadingMunicipios
                              ? "Carregando..."
                              : "Selecione a cidade"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {municipios.map((mun) => (
                          <SelectItem key={mun.id} value={mun.nome}>
                            {mun.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      <Label htmlFor="mostrar_email" className="text-sm text-muted-foreground cursor-pointer">
                        {mostrarEmail ? (
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" /> Visível no perfil público
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <EyeOff className="h-4 w-4" /> Oculto no perfil público
                          </span>
                        )}
                      </Label>
                    </div>
                  </div>

                  {/* Telefone */}
                  <div className="space-y-3">
                    <Label htmlFor="telefone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="telefone"
                        type="tel"
                        value={telefone}
                        onChange={(e) => setTelefone(formatPhoneInput(e.target.value))}
                        placeholder="(XX) XXXXX-XXXX"
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
                      <Label htmlFor="mostrar_telefone" className="text-sm text-muted-foreground cursor-pointer">
                        {mostrarTelefone ? (
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" /> Visível no perfil público
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <EyeOff className="h-4 w-4" /> Oculto no perfil público
                          </span>
                        )}
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button
                    type="submit"
                    disabled={isSaveDisabled}
                    className="min-w-[140px]"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar alterações"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
