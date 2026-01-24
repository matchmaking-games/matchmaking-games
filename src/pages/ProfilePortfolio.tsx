import { useState, useEffect } from "react";
import { z } from "zod";
import { Loader2, Globe, Linkedin, Github, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProfileNavigation } from "@/components/dashboard/ProfileNavigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const urlSchema = z.string()
  .refine(
    (val) => val === "" || /^https?:\/\/.+/.test(val),
    { message: "URL deve começar com http:// ou https://" }
  )
  .optional()
  .or(z.literal(""));

const linksSchema = z.object({
  website: urlSchema,
  linkedin_url: urlSchema,
  github_url: urlSchema,
  portfolio_url: urlSchema,
});

type ValidationErrors = {
  website?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
};

const ProfilePortfolio = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [website, setWebsite] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("users")
      .select("website, linkedin_url, github_url, portfolio_url")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
    }

    if (data) {
      setWebsite(data.website || "");
      setLinkedinUrl(data.linkedin_url || "");
      setGithubUrl(data.github_url || "");
      setPortfolioUrl(data.portfolio_url || "");
    }

    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const formData = {
      website,
      linkedin_url: linkedinUrl,
      github_url: githubUrl,
      portfolio_url: portfolioUrl,
    };

    const result = linksSchema.safeParse(formData);

    if (!result.success) {
      const errors: ValidationErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ValidationErrors;
        if (field) {
          errors[field] = err.message;
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
        description: "Sessão expirada.", 
        variant: "destructive" 
      });
      setIsSaving(false);
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({
        website: website || null,
        linkedin_url: linkedinUrl || null,
        github_url: githubUrl || null,
        portfolio_url: portfolioUrl || null,
      })
      .eq("id", session.user.id);

    setIsSaving(false);

    if (error) {
      toast({ 
        title: "Erro", 
        description: "Erro ao salvar links.", 
        variant: "destructive" 
      });
      return;
    }

    toast({ 
      title: "Sucesso", 
      description: "Links atualizados!" 
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-foreground mb-4">
          Meu Perfil
        </h1>
        <ProfileNavigation />
        <p className="text-muted-foreground mb-8">
          Adicione links para que recrutadores encontrem mais sobre você
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://seusite.com"
                  className="h-11 pl-10 bg-input border-border"
                />
              </div>
              {validationErrors.website && (
                <p className="text-sm text-destructive">{validationErrors.website}</p>
              )}
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="linkedin_url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/seu-perfil"
                  className="h-11 pl-10 bg-input border-border"
                />
              </div>
              {validationErrors.linkedin_url && (
                <p className="text-sm text-destructive">{validationErrors.linkedin_url}</p>
              )}
            </div>

            {/* GitHub */}
            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub</Label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="github_url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/seu-usuario"
                  className="h-11 pl-10 bg-input border-border"
                />
              </div>
              {validationErrors.github_url && (
                <p className="text-sm text-destructive">{validationErrors.github_url}</p>
              )}
            </div>

            {/* Portfolio Externo */}
            <div className="space-y-2">
              <Label htmlFor="portfolio_url">Portfólio externo</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="portfolio_url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://artstation.com/seu-perfil"
                  className="h-11 pl-10 bg-input border-border"
                />
              </div>
              {validationErrors.portfolio_url && (
                <p className="text-sm text-destructive">{validationErrors.portfolio_url}</p>
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePortfolio;
