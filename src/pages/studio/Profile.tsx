import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Loader2, Camera } from "lucide-react";
import { MonthYearPicker } from "@/components/experience/MonthYearPicker";
import { StudioDashboardLayout } from "@/components/studio/StudioDashboardLayout";
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
import { SpecialtiesInput } from "@/components/studio/SpecialtiesInput";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useStudioMembership } from "@/hooks/useStudioMembership";
import { useIBGELocations } from "@/hooks/useIBGELocations";
import type { Database } from "@/integrations/supabase/types";

type TamanhoEstudio = Database["public"]["Enums"]["tamanho_estudio"];

const studioProfileSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  descricao: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
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
  website: z.string().url("URL inválida").optional().or(z.literal("")),
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

  const { data: membership, isLoading: loadingMembership } =
    useStudioMembership();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Form fields
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [descricao, setDescricao] = useState("");
  const [sobre, setSobre] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [tamanho, setTamanho] = useState<TamanhoEstudio | null>(null);
  const [website, setWebsite] = useState("");
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [fundadoEm, setFundadoEm] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // IBGE Locations hook
  const { estados, loadingEstados, municipios, loadingMunicipios, fetchMunicipios, clearMunicipios } = useIBGELocations();

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
        setDescricao(data.descricao || "");
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
        setWebsite(data.website || "");
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
      navigate("/studio/new");
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

    // Build location string from state + city for validation only
    const localizacao = estado && cidade ? `${cidade}, ${estado}` : "";
    
    const formData = {
      nome,
      descricao,
      sobre,
      localizacao, // Keep for validation schema compatibility
      tamanho: tamanho || null,
      website,
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
        descricao: descricao || null,
        sobre: sobre || null,
        estado: estado || null,
        cidade: cidade || null,
        tamanho: tamanho || null,
        website: website || null,
        especialidades: especialidades.length > 0 ? especialidades : null,
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

    toast({
      title: "Perfil atualizado!",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  if (loadingMembership || isLoading) {
    return (
      <StudioDashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </StudioDashboardLayout>
    );
  }

  return (
    <StudioDashboardLayout>
      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            {/* Header inside Card */}
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground">
                Perfil do Estúdio
              </h1>
              <p className="text-muted-foreground mt-2">
                Gerencie as informações públicas do seu estúdio
              </p>
            </div>

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
                  <Label htmlFor="url">URL pública</Label>
                  <Input
                    id="url"
                    value={`matchmaking.games/studio/${slug}`}
                    disabled
                    className="h-11 bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    O slug do estúdio não pode ser alterado.
                  </p>
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
                    <Label htmlFor="descricao">Descrição curta</Label>
                    <span className="text-xs text-muted-foreground">
                      {descricao.length}/500
                    </span>
                  </div>
                  <Textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Breve descrição do estúdio que aparece em cards e listagens"
                    maxLength={500}
                    rows={3}
                  />
                  {validationErrors.descricao && (
                    <p className="text-sm text-destructive">
                      {validationErrors.descricao}
                    </p>
                  )}
                </div>

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

              {/* Links Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://seuestudio.com"
                    className="h-11"
                  />
                  {validationErrors.website && (
                    <p className="text-sm text-destructive">
                      {validationErrors.website}
                    </p>
                  )}
                </div>

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
                  onClick={() => navigate("/studio/dashboard")}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
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
    </StudioDashboardLayout>
  );
}
