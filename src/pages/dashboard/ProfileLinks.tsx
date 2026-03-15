import { useState, useEffect } from "react";
import { z } from "zod";
import { Loader2, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/shared/use-toast";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProfileNavigation } from "@/components/dashboard/ProfileNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SocialIcon } from "@/components/shared/SocialIcon";

const urlSchema = z
  .string()
  .refine((val) => val === "" || /^https?:\/\/.+/.test(val), {
    message: "URL deve começar com http:// ou https://",
  })
  .optional()
  .or(z.literal(""));

const linksSchema = z.object({
  website: urlSchema,
  linkedin_url: urlSchema,
  github_url: urlSchema,
  portfolio_url: urlSchema,
  artstation_url: urlSchema,
  dribbble_url: urlSchema,
  behance_url: urlSchema,
  facebook_url: urlSchema,
  instagram_url: urlSchema,
  itch_url: urlSchema,
  pinterest_url: urlSchema,
  steam_url: urlSchema,
  telegram_url: urlSchema,
  youtube_url: urlSchema,
  twitch_url: urlSchema,
  twitter_url: urlSchema,
});

type FormFields = z.infer<typeof linksSchema>;
type ValidationErrors = Partial<Record<keyof FormFields, string>>;

const defaultFields: FormFields = {
  website: "",
  linkedin_url: "",
  github_url: "",
  portfolio_url: "",
  artstation_url: "",
  dribbble_url: "",
  behance_url: "",
  facebook_url: "",
  instagram_url: "",
  itch_url: "",
  pinterest_url: "",
  steam_url: "",
  telegram_url: "",
  youtube_url: "",
  twitch_url: "",
  twitter_url: "",
};

const fieldConfig: {
  key: keyof FormFields;
  label: string;
  placeholder: string;
  network?: string;
  isWebsite?: boolean;
}[] = [
  {
    key: "linkedin_url",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/seu-perfil",
    network: "linkedin",
  },
  {
    key: "github_url",
    label: "GitHub",
    placeholder: "https://github.com/seu-usuario",
    network: "github",
  },
  {
    key: "artstation_url",
    label: "ArtStation",
    placeholder: "https://artstation.com/seu-perfil",
    network: "artstation",
  },
  {
    key: "behance_url",
    label: "Behance",
    placeholder: "https://behance.net/seu-perfil",
    network: "behance",
  },
  {
    key: "dribbble_url",
    label: "Dribbble",
    placeholder: "https://dribbble.com/seu-usuario",
    network: "dribbble",
  },
  {
    key: "itch_url",
    label: "itch.io",
    placeholder: "https://seu-usuario.itch.io",
    network: "itch",
  },
  {
    key: "steam_url",
    label: "Steam",
    placeholder: "https://store.steampowered.com/developer/seu-studio",
    network: "steam",
  },
  {
    key: "instagram_url",
    label: "Instagram",
    placeholder: "https://instagram.com/seu-perfil",
    network: "instagram",
  },
  {
    key: "twitter_url",
    label: "X (Twitter)",
    placeholder: "https://x.com/seu-usuario",
    network: "twitter",
  },
  {
    key: "youtube_url",
    label: "YouTube",
    placeholder: "https://youtube.com/@seu-canal",
    network: "youtube",
  },
  {
    key: "twitch_url",
    label: "Twitch",
    placeholder: "https://twitch.tv/seu-canal",
    network: "twitch",
  },
  {
    key: "telegram_url",
    label: "Telegram",
    placeholder: "https://t.me/seu-usuario",
    network: "telegram",
  },
  {
    key: "facebook_url",
    label: "Facebook",
    placeholder: "https://facebook.com/sua-pagina",
    network: "facebook",
  },
  {
    key: "pinterest_url",
    label: "Pinterest",
    placeholder: "https://pinterest.com/seu-perfil",
    network: "pinterest",
  },
];

const ProfileLinks = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fields, setFields] = useState<FormFields>(defaultFields);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("users")
      .select(
        "website, linkedin_url, github_url, portfolio_url, artstation_url, dribbble_url, behance_url, facebook_url, instagram_url, itch_url, pinterest_url, steam_url, telegram_url, youtube_url, twitch_url, twitter_url"
      )
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
    }

    if (data) {
      setFields({
        website: data.website || "",
        linkedin_url: data.linkedin_url || "",
        github_url: data.github_url || "",
        portfolio_url: data.portfolio_url || "",
        artstation_url: data.artstation_url || "",
        dribbble_url: data.dribbble_url || "",
        behance_url: data.behance_url || "",
        facebook_url: data.facebook_url || "",
        instagram_url: data.instagram_url || "",
        itch_url: data.itch_url || "",
        pinterest_url: data.pinterest_url || "",
        steam_url: data.steam_url || "",
        telegram_url: data.telegram_url || "",
        youtube_url: data.youtube_url || "",
        twitch_url: data.twitch_url || "",
        twitter_url: data.twitter_url || "",
      });
    }

    setIsLoading(false);
  };

  const setField = (key: keyof FormFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const result = linksSchema.safeParse(fields);

    if (!result.success) {
      const errors: ValidationErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ValidationErrors;
        if (field) errors[field] = err.message;
      });
      setValidationErrors(errors);
      return;
    }

    setIsSaving(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast({
        title: "Erro",
        description: "Sessão expirada.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    const toNull = (v: string | undefined) => v || null;

    const { error } = await supabase
      .from("users")
      .update({
        website: toNull(fields.website),
        linkedin_url: toNull(fields.linkedin_url),
        github_url: toNull(fields.github_url),
        portfolio_url: toNull(fields.portfolio_url),
        artstation_url: toNull(fields.artstation_url),
        dribbble_url: toNull(fields.dribbble_url),
        behance_url: toNull(fields.behance_url),
        facebook_url: toNull(fields.facebook_url),
        instagram_url: toNull(fields.instagram_url),
        itch_url: toNull(fields.itch_url),
        pinterest_url: toNull(fields.pinterest_url),
        steam_url: toNull(fields.steam_url),
        telegram_url: toNull(fields.telegram_url),
        youtube_url: toNull(fields.youtube_url),
        twitch_url: toNull(fields.twitch_url),
        twitter_url: toNull(fields.twitter_url),
      })
      .eq("id", session.user.id);

    setIsSaving(false);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar links.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Sucesso", description: "Links atualizados!" });
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto">
        <Card>
          <CardContent className="pt-6">
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
                {/* Website — único com ícone Lucide */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="website"
                      value={fields.website}
                      onChange={(e) => setField("website", e.target.value)}
                      placeholder="https://seusite.com"
                      className="h-11 pl-10 bg-input border-border"
                    />
                  </div>
                  {validationErrors.website && (
                    <p className="text-sm text-destructive">{validationErrors.website}</p>
                  )}
                </div>

                {/* Portfólio externo */}
                <div className="space-y-2">
                  <Label htmlFor="portfolio_url">Portfólio externo</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="portfolio_url"
                      value={fields.portfolio_url}
                      onChange={(e) => setField("portfolio_url", e.target.value)}
                      placeholder="https://seu-portfolio.com"
                      className="h-11 pl-10 bg-input border-border"
                    />
                  </div>
                  {validationErrors.portfolio_url && (
                    <p className="text-sm text-destructive">{validationErrors.portfolio_url}</p>
                  )}
                </div>

                {/* Redes sociais via SocialIcon */}
                {fieldConfig.map(({ key, label, placeholder, network }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{label}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center">
                        <SocialIcon network={network!} size={18} />
                      </span>
                      <Input
                        id={key}
                        value={fields[key] as string}
                        onChange={(e) => setField(key, e.target.value)}
                        placeholder={placeholder}
                        className="h-11 pl-10 bg-input border-border"
                      />
                    </div>
                    {validationErrors[key] && (
                      <p className="text-sm text-destructive">{validationErrors[key]}</p>
                    )}
                  </div>
                ))}

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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfileLinks;
