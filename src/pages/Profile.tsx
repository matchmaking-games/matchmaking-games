import { useState, useEffect } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const profileSchema = z.object({
  nome_completo: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  nome_exibicao: z.string().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
  titulo_profissional: z.string().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
  bio_curta: z.string().max(200, "Máximo 200 caracteres").optional().or(z.literal("")),
  localizacao: z.string().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
});

type ValidationErrors = {
  [key: string]: string;
};

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [nomeExibicao, setNomeExibicao] = useState("");
  const [tituloProfissional, setTituloProfissional] = useState("");
  const [bioCurta, setBioCurta] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("users")
      .select("nome_completo, nome_exibicao, titulo_profissional, bio_curta, localizacao")
      .eq("id", session.user.id)
      .single();

    if (data) {
      setNomeCompleto(data.nome_completo || "");
      setNomeExibicao(data.nome_exibicao || "");
      setTituloProfissional(data.titulo_profissional || "");
      setBioCurta(data.bio_curta || "");
      setLocalizacao(data.localizacao || "");
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

    const { error } = await supabase
      .from("users")
      .update({
        nome_completo: nomeCompleto,
        nome_exibicao: nomeExibicao || null,
        titulo_profissional: tituloProfissional || null,
        bio_curta: bioCurta || null,
        localizacao: localizacao || null,
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
      <div className="max-w-xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">
          Meu Perfil
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
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
        )}
      </div>
    </DashboardLayout>
  );
}
