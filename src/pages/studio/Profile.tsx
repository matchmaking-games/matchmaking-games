import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Loader2, Camera, Check, X, AlertTriangle } from "lucide-react";
import { MonthYearPicker } from "@/components/experience/MonthYearPicker";

import { StudioProfileNavigation } from "@/components/studio-manage/StudioProfileNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpecialtiesInput } from "@/components/studio-manage/SpecialtiesInput";
import { useToast } from "@/hooks/shared/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useActiveStudio } from "@/hooks/studio/useActiveStudio";
import { useIBGELocations } from "@/hooks/shared/useIBGELocations";
import { useDebounce } from "@/hooks/shared/useDebounce";
import type { Database } from "@/integrations/supabase/types";

type TamanhoEstudio = Database["public"]["Enums"]["tamanho_estudio"];
type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

const slugRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

const filterSlugInput = (value: string): string => {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30);
};

const studioProfileSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  slug: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(30, "Máximo 30 caracteres")
    .regex(slugRegex, "Use apenas letras minúsculas, números e hífen"),
  sobre: z
    .string()
    .max(5000, "Máximo 5000 caracteres")
    .optional()
    .or(z.literal("")),
  localizacao: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  tamanho: z
    .enum(["micro", "pequeno", "medio", "grande"])
    .nullable()
    .optional(),
  especialidades: z.array(z.string()).optional(),
  fundado_em: z.string().optional().or(z.literal("")),
});

const TAMANHO_OPTIONS = [
  { value: "micro", label: "Micro (1-10 pessoas)" },
  { value: "pequeno", label: "Pequeno (11-50 pessoas)" },
  { value: "medio", label: "Médio (51-200 pessoas)" },
  { value: "grande", label: "Grande (200+ pessoas)" },
];

export default function StudioProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { activeStudio: membership, isLoading: loadingMembership } =
    useActiveStudio();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Form fields
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [originalSlug, setOriginalSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [sobre, setSobre] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [tamanho, setTamanho] = useState<TamanhoEstudio | null>(null);
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [fundadoEm, setFundadoEm] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const debouncedSlug = useDebounce(slug, 500);

  // IBGE Locations hook
  const { estados, loadingEstados, municipios, loadingMunicipios, fetchMunicipios, clearMunicipios } = useIBGELocations();

  // Slug availability check
  useEffect(() => {
    if (!debouncedSlug || !membership?.estudio.id) return;

    if (debouncedSlug.length < 3) {
      setSlugStatus("invalid");
      return;
    }
    if (!slugRegex.test(debouncedSlug)) {
      setSlugStatus("invalid");
      return;
    }

    if (debouncedSlug === originalSlug) {
      setSlugStatus("available");
      return;
    }

    const checkAvailability = async () => {
      setSlugStatus("checking");
      const { data, error } = await supabase
        .from("estudios")
        .select("id")
        .eq("slug", debouncedSlug)
        .maybeSingle();

      if (error) {
        setSlugStatus("invalid");
        return;
      }
      setSlugStatus(!data || data.id === membership.estudio.id ? "available" : "taken");
    };

    checkAvailability();
  }, [debouncedSlug, originalSlug, membership?.estudio.id]);

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
        return <span className="text-primary">✓ Slug disponível</span>;
      case "taken":
        return <span className="text-destructive">✗ Este slug já está em uso</span>;
      case "invalid":
        if (slug.length < 3) return <span className="text-yellow-500">Mínimo 3 caracteres</span>;
        return <span className="text-yellow-500">Use apenas letras minúsculas, números e hífen</span>;
      default:
        return null;
    }
  };

  useEffect(() => {
    async function fetchStudioData() {
      if (!membership?.estudio.id) return;

      const { data, error } = await supabase
        .from("estudios")
        .select("*")
        .eq("id", membership.estudio.id)
        .single();

      if (error) {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do estúdio.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data) {
        setNome(data.nome || "");
        setSlug(data.slug || "");
        setOriginalSlug(data.slug || "");
        if (data.slug) setSlugStatus("available");
        setSobre(data.sobre || "");
        
        // Use estado and cidade directly from database
        if (data.estado) {
          setEstado(data.estado);
          fetchMunicipios(data.estado);
        }
        if (data.cidade) {
          setCidade(data.cidade);
        }
        
        setTamanho(data.tamanho);
        setEspecialidades(data.especialidades || []);
        // Convert YYYY-MM-DD to YYYY-MM for MonthYearPicker
        setFundadoEm(data.fundado_em ? data.fundado_em.substring(0, 7) : "");
        setLogoUrl(data.logo_url);
      }

      setIsLoading(false);
    }

    if (!loadingMembership && membership) {
      fetchStudioData();
    } else if (!loadingMembership && !membership) {
      navigate("/studio/manage/new");
    }
  }, [membership, loadingMembership, navigate, toast, fetchMunicipios]);

  // Handle state change - fetch municipalities and clear city
  const handleEstadoChange = (sigla: string) => {
    setEstado(sigla);
    setCidade("");
    fetchMunicipios(sigla);
  };

  // Handle city change
  const handleCidadeChange = (nomeCidade: string) => {
    setCidade(nomeCidade);
  };

  const handleLogoUpload = async (file: File) => {
    if (!membership?.estudio.id) return;

    if (membership.role !== "super_admin") {
      toast({
        title: "Sem permissão",
        description: "Apenas o administrador do estúdio pode alterar o logo.",
        variant: "destructive",
      });
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Use apenas JPG, PNG ou WebP",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "Máximo 3MB permitido",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingLogo(true);

    const extension = file.type.split("/")[1];
    const filePath = `${membership.estudio.id}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("studio-logos")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a imagem.",
        variant: "destructive",
      });
      setIsUploadingLogo(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("studio-logos")
      .getPublicUrl(filePath);

    const newLogoUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    setLogoUrl(newLogoUrl);
    setIsUploadingLogo(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    if (!membership?.estudio.id) return;

    if (slugStatus === "checking" || slugStatus === "taken" || slugStatus === "invalid") {
      toast({ title: "Erro", description: "Corrija o slug antes de salvar.", variant: "destructive" });
      return;
    }

    // Build location string from state + city for validation only
    const localizacao = estado && cidade ? `${cidade}, ${estado}` : "";
    
    const formData = {
      nome,
      slug,
      sobre,
      localizacao,
      tamanho: tamanho || null,
      especialidades,
      fundado_em: fundadoEm,
    };

    const result = studioProfileSchema.safeParse(formData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      return;
    }

    setIsSaving(true);

    const { error } = await supabase
      .from("estudios")
      .update({
        nome,
        slug,
        sobre: sobre || null,
        estado: estado || null,
        cidade: cidade || null,
        tamanho: tamanho || null,
        especialidades: (especialidades.length > 0 ? especialidades : null) as any,
        fundado_em: fundadoEm || null,
        logo_url: logoUrl,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", membership.estudio.id);

    setIsSaving(false);

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return;
    }

    setOriginalSlug(slug);
    toast({
      title: "Perfil atualizado!",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  if (loadingMembership || isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  return (
      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            {/* Header inside Card */}
            <div className="mb-4">
              <h1 className="font-display text-3xl font-bold text-foreground">
                Perfil do Estúdio
              </h1>
              <p className="text-muted-foreground mt-2">
                Gerencie as informações públicas do seu estúdio
              </p>
            </div>

            <StudioProfileNavigation />

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Logo Upload Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={logoUrl || undefined} alt={nome} />
                    <AvatarFallback className="text-2xl font-semibold bg-muted">
                      {nome.slice(0, 2).toUpperCase() || "ST"}
                    </AvatarFallback>
                  </Avatar>
                  {isUploadingLogo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  )}
                </div>
                {membership?.role === "super_admin" && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingLogo}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Alterar foto
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG ou WebP. Máximo 3MB.
                    </p>
                  </div>
                )}
              </div>

              {/* Basic Info Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">
                    Nome do estúdio <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome do estúdio"
                    className="h-11"
                  />
                  {validationErrors.nome && (
                    <p className="text-sm text-destructive">
                      {validationErrors.nome}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">
                    Slug <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="slug-do-estudio"
                      maxLength={30}
                      className="h-11 lowercase pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {slugIcon()}
                    </div>
                  </div>
                  {slug && (
                    <p className="text-xs text-muted-foreground">
                      matchmaking.games/studio/{slug}
                    </p>
                  )}
                  {slugMessage() && (
                    <p className="text-sm">{slugMessage()}</p>
                  )}
                  {validationErrors.slug && (
                    <p className="text-sm text-destructive">
                      {validationErrors.slug}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select 
                      value={estado} 
                      onValueChange={handleEstadoChange}
                      disabled={loadingEstados}
                    >
                      <SelectTrigger className="h-11">
                        {loadingEstados ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Carregando...</span>
                          </div>
                        ) : (
                          <SelectValue placeholder="Selecione o estado" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((uf) => (
                          <SelectItem key={uf.sigla} value={uf.sigla}>
                            {uf.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Select
                      value={cidade}
                      onValueChange={handleCidadeChange}
                      disabled={!estado || loadingMunicipios}
                    >
                      <SelectTrigger className="h-11">
                        {loadingMunicipios ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Carregando...</span>
                          </div>
                        ) : (
                          <SelectValue placeholder="Selecione a cidade" />
                        )}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tamanho">Tamanho do estúdio</Label>
                  <Select
                    value={tamanho || ""}
                    onValueChange={(value) =>
                      setTamanho(value as TamanhoEstudio)
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione o tamanho" />
                    </SelectTrigger>
                    <SelectContent>
                      {TAMANHO_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* About Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sobre">Sobre</Label>
                    <span className="text-xs text-muted-foreground">
                      {sobre.length}/5000
                    </span>
                  </div>
                  <Textarea
                    id="sobre"
                    value={sobre}
                    onChange={(e) => setSobre(e.target.value)}
                    placeholder="Conte a história do estúdio, missão, valores, cultura e diferenciais"
                    maxLength={5000}
                    rows={8}
                  />
                  {validationErrors.sobre && (
                    <p className="text-sm text-destructive">
                      {validationErrors.sobre}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Specialties Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Especialidades</Label>
                  <SpecialtiesInput
                    value={especialidades}
                    onChange={setEspecialidades}
                    disabled={isSaving}
                  />
                </div>
              </div>

              <Separator />

              {/* Foundation Section */}
              <div className="space-y-2">
                <Label>Data de fundação</Label>
                <div className="w-full md:w-64">
                  <MonthYearPicker
                    value={fundadoEm}
                    onChange={setFundadoEm}
                    placeholder="Selecione mês e ano"
                  />
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/studio/manage/dashboard")}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving || slugStatus === "checking" || slugStatus === "taken" || slugStatus === "invalid"}>
                  {isSaving && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  );
}
