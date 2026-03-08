import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { ChevronLeft, Check, X, Loader2, Building2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCheckStudioSlug } from "@/hooks/useCheckStudioSlug";
import { useIBGELocations } from "@/hooks/useIBGELocations";

const createStudioSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  slug: z
    .string()
    .min(3, "Slug deve ter pelo menos 3 caracteres")
    .max(50, "Slug muito longo")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen")
    .refine((slug) => !slug.startsWith("-") && !slug.endsWith("-"), "Slug não pode começar ou terminar com hífen"),
  estado: z.string().length(2, "Selecione o estado"),
  cidade: z.string().min(1, "Selecione a cidade"),
  tamanho: z.enum(["micro", "pequeno", "medio", "grande"], {
    errorMap: () => ({ message: "Selecione o tamanho do estúdio" }),
  }),
});

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9]+/g, "-") // Substitui espaços e especiais por hífen
    .replace(/^-+|-+$/g, "") // Remove hífens do início/fim
    .substring(0, 50); // Limita a 50 caracteres
}

export default function NewStudio() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Form states
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [tamanho, setTamanho] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // IBGE Locations hook
  const { estados, loadingEstados, municipios, loadingMunicipios, fetchMunicipios } = useIBGELocations();

  // Verificar validade do slug para o hook
  const slugValidation = createStudioSchema.shape.slug.safeParse(slug);
  const isSlugFormatValid = slugValidation.success;

  // Hook de verificação de disponibilidade
  const { isChecking, isAvailable } = useCheckStudioSlug(slug, isSlugFormatValid);

  // Quando o nome muda, gerar slug automaticamente (se usuário não editou manualmente)
  useEffect(() => {
    if (!slugTouched && nome) {
      setSlug(generateSlug(nome));
    }
  }, [nome, slugTouched]);

  // Handler para quando usuário edita o slug manualmente
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(value);
    setSlugTouched(true);
  };

  // Handle state change - fetch municipalities and clear city
  const handleEstadoChange = (sigla: string) => {
    setEstado(sigla);
    setCidade("");
    fetchMunicipios(sigla);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Validar com Zod
    const formData = { nome, slug, estado, cidade, tamanho };
    const result = createStudioSchema.safeParse(formData);

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

    // Verificar se slug está disponível
    if (!isAvailable) {
      setValidationErrors({ slug: "Este slug não está disponível" });
      return;
    }

    setIsSubmitting(true);

    // Buscar ID do usuário
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Erro",
        description: "Sessão expirada. Faça login novamente.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    // Inserir estúdio
    const { data: newStudio, error: insertError } = await supabase
      .from("estudios")
      .insert({
        nome: nome,
        slug: slug,
        estado: estado,
        cidade: cidade,
        tamanho: tamanho as "micro" | "pequeno" | "medio" | "grande",
        criado_por: session.user.id,
      })
      .select("id")
      .single();

    setIsSubmitting(false);

    if (insertError) {
      console.error("Error creating studio:", insertError);

      // Verificar se é erro de slug duplicado
      if (insertError.code === "23505") {
        setValidationErrors({ slug: "Este slug já foi registrado. Tente outro." });
        return;
      }

      toast({
        title: "Erro",
        description: "Erro ao criar estúdio. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    // Sucesso!
    toast({
      title: "Estúdio criado!",
      description: "Seu estúdio foi criado com sucesso.",
    });

    // Invalidar query has-studio para atualizar menu
    await queryClient.invalidateQueries({ queryKey: ["has-studio"] });
    await queryClient.invalidateQueries({ queryKey: ["studio-memberships"] });

    // Redirecionar para dashboard do estúdio
    navigate(`/studio/manage/dashboard?studio=${newStudio.id}`);
  };

  const renderSlugStatus = () => {
    if (!slug || slug.length < 3) return null;

    if (!isSlugFormatValid) {
      return <X className="w-4 h-4 text-destructive" />;
    }

    if (isChecking) {
      return <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />;
    }

    if (isAvailable === true) {
      return <Check className="w-4 h-4 text-primary" />;
    }

    if (isAvailable === false) {
      return <X className="w-4 h-4 text-destructive" />;
    }

    return null;
  };

  const isButtonDisabled =
    isSubmitting ||
    !nome ||
    !slug ||
    !estado ||
    !cidade ||
    !tamanho ||
    !isSlugFormatValid ||
    isChecking ||
    isAvailable !== true;

  return (
    <DashboardLayout>
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/dashboard">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Link>
          </Button>

          <h1 className="font-display text-3xl font-bold text-foreground">Criar Estúdio</h1>
          <p className="text-muted-foreground mt-2">Configure a página do seu estúdio para começar a publicar vagas</p>
        </div>

        {/* Form Card */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome do Estúdio */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do estúdio *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Nebula Game Studio"
                    className="pl-10 h-11"
                    maxLength={100}
                    disabled={isSubmitting}
                  />
                </div>
                {validationErrors.nome && <p className="text-sm text-destructive">{validationErrors.nome}</p>}
              </div>

              {/* Slug (URL) */}
              <div className="space-y-2">
                <Label htmlFor="slug">URL do estúdio *</Label>
                <div className="flex items-center bg-input border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all">
                  <span className="pl-3 pr-2 text-muted-foreground text-sm whitespace-nowrap">
                    matchmaking.games/studio/
                  </span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="seu-estudio"
                    maxLength={50}
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-11 lowercase"
                    disabled={isSubmitting}
                  />
                  <div className="px-3">{renderSlugStatus()}</div>
                </div>
                <p className="text-xs text-muted-foreground">Este será o endereço público do seu estúdio</p>
                {validationErrors.slug && <p className="text-sm text-destructive">{validationErrors.slug}</p>}
                {!validationErrors.slug && isSlugFormatValid && isAvailable === false && (
                  <p className="text-sm text-destructive">Este slug já está em uso</p>
                )}
                {!validationErrors.slug && isSlugFormatValid && isAvailable === true && (
                  <p className="text-sm text-primary">Slug disponível!</p>
                )}
              </div>

              {/* State and City Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estado *</Label>
                  <Select value={estado} onValueChange={handleEstadoChange} disabled={loadingEstados || isSubmitting}>
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
                  {validationErrors.estado && <p className="text-sm text-destructive">{validationErrors.estado}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Cidade *</Label>
                  <Select
                    value={cidade}
                    onValueChange={setCidade}
                    disabled={!estado || loadingMunicipios || isSubmitting}
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
                  {validationErrors.cidade && <p className="text-sm text-destructive">{validationErrors.cidade}</p>}
                </div>
              </div>

              {/* Tamanho do Estúdio */}
              <div className="space-y-3">
                <Label>Tamanho do estúdio *</Label>
                <RadioGroup
                  value={tamanho}
                  onValueChange={setTamanho}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  disabled={isSubmitting}
                >
                  <div className="flex items-center space-x-3 rounded-md border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="micro" id="micro" />
                    <Label htmlFor="micro" className="cursor-pointer font-normal">
                      <span className="font-medium">Micro</span>
                      <span className="text-muted-foreground ml-1">(1-10 funcionários)</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 rounded-md border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="pequeno" id="pequeno" />
                    <Label htmlFor="pequeno" className="cursor-pointer font-normal">
                      <span className="font-medium">Pequeno</span>
                      <span className="text-muted-foreground ml-1">(11-50 funcionários)</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 rounded-md border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="medio" id="medio" />
                    <Label htmlFor="medio" className="cursor-pointer font-normal">
                      <span className="font-medium">Médio</span>
                      <span className="text-muted-foreground ml-1">(51-200 funcionários)</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 rounded-md border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="grande" id="grande" />
                    <Label htmlFor="grande" className="cursor-pointer font-normal">
                      <span className="font-medium">Grande</span>
                      <span className="text-muted-foreground ml-1">(200+ funcionários)</span>
                    </Label>
                  </div>
                </RadioGroup>
                {validationErrors.tamanho && <p className="text-sm text-destructive">{validationErrors.tamanho}</p>}
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={isButtonDisabled} className="w-full h-12 text-base font-semibold">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando estúdio...
                  </>
                ) : (
                  "Criar Estúdio"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
