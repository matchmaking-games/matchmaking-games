import { useState, useEffect } from "react";
import { z } from "zod";
import { Loader2, Globe } from "lucide-react";
import { StudioDashboardLayout } from "@/components/studio/StudioDashboardLayout";
import { StudioProfileNavigation } from "@/components/studio/StudioProfileNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SocialIcon } from "@/components/SocialIcon";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useActiveStudio } from "@/hooks/useActiveStudio";

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
  twitter_url: urlSchema,
  instagram_url: urlSchema,
  facebook_url: urlSchema,
  youtube_url: urlSchema,
  twitch_url: urlSchema,
  telegram_url: urlSchema,
  artstation_url: urlSchema,
  behance_url: urlSchema,
  dribbble_url: urlSchema,
  itch_url: urlSchema,
  pinterest_url: urlSchema,
});

type FormFields = z.infer<typeof linksSchema>;
type ValidationErrors = Partial<Record<keyof FormFields, string>>;

const defaultFields: FormFields = {
  website: "",
  linkedin_url: "",
  github_url: "",
  twitter_url: "",
  instagram_url: "",
  facebook_url: "",
  youtube_url: "",
  twitch_url: "",
  telegram_url: "",
  artstation_url: "",
  behance_url: "",
  dribbble_url: "",
  itch_url: "",
  pinterest_url: "",
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
    placeholder: "https://linkedin.com/company/seu-estudio",
    network: "linkedin",
  },
  {
    key: "github_url",
    label: "GitHub",
    placeholder: "https://github.com/seu-estudio",
    network: "github",
  },
  {
    key: "artstation_url",
    label: "ArtStation",
    placeholder: "https://artstation.com/seu-estudio",
    network: "artstation",
  },
  {
    key: "behance_url",
    label: "Behance",
    placeholder: "https://behance.net/seu-estudio",
    network: "behance",
  },
  {
    key: "dribbble_url",
    label: "Dribbble",
    placeholder: "https://dribbble.com/seu-estudio",
    network: "dribbble",
  },
  {
    key: "itch_url",
    label: "itch.io",
    placeholder: "https://seu-estudio.itch.io",
    network: "itch",
  },
  {
    key: "instagram_url",
    label: "Instagram",
    placeholder: "https://instagram.com/seu-estudio",
    network: "instagram",
  },
  {
    key: "twitter_url",
    label: "X (Twitter)",
    placeholder: "https://x.com/seu-estudio",
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
    placeholder: "https://t.me/seu-estudio",
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
    placeholder: "https://pinterest.com/seu-estudio",
    network: "pinterest",
  },
];

export default function StudioProfileLinks() {
  const { toast } = useToast();
  const { activeStudio: membership, isLoading: loadingMembership } = useActiveStudio();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fields, setFields] = useState<FormFields>(defaultFields);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    async function fetchData() {
      if (!membership?.estudio.id) return;

      const { data, error } = await supabase
        .from("estudios")
        .select(
          "website, linkedin_url, github_url, twitter_url, instagram_url, facebook_url, youtube_url, twitch_url, telegram_url, artstation_url, behance_url, dribbble_url, itch_url, pinterest_url"
        )
        .eq("id", membership.estudio.id)
        .single();

      if (error) {
        console.error("Error fetching studio links:", error);
      }

      if (data) {
        setFields({
          website: data.website || "",
          linkedin_url: data.linkedin_url || "",
          github_url: data.github_url || "",
          twitter_url: data.twitter_url || "",
          instagram_url: data.instagram_url || "",
          facebook_url: data.facebook_url || "",
          youtube_url: data.youtube_url || "",
          twitch_url: data.twitch_url || "",
          telegram_url: data.telegram_url || "",
          artstation_url: data.artstation_url || "",
          behance_url: data.behance_url || "",
          dribbble_url: data.dribbble_url || "",
          itch_url: data.itch_url || "",
          pinterest_url: data.pinterest_url || "",
        });
      }

      setIsLoading(false);
    }

    if (!loadingMembership && membership) {
      fetchData();
    } else if (!loadingMembership && !membership) {
      setIsLoading(false);
    }
  }, [membership, loadingMembership]);

  const setField = (key: keyof FormFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    if (!membership?.estudio.id) return;

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

    const toNull = (v: string | undefined) => v || null;

    const { error } = await supabase
      .from("estudios")
      .update({
        website: toNull(fields.website),
        linkedin_url: toNull(fields.linkedin_url),
        github_url: toNull(fields.github_url),
        twitter_url: toNull(fields.twitter_url),
        instagram_url: toNull(fields.instagram_url),
        facebook_url: toNull(fields.facebook_url),
        youtube_url: toNull(fields.youtube_url),
        twitch_url: toNull(fields.twitch_url),
        telegram_url: toNull(fields.telegram_url),
        artstation_url: toNull(fields.artstation_url),
        behance_url: toNull(fields.behance_url),
        dribbble_url: toNull(fields.dribbble_url),
        itch_url: toNull(fields.itch_url),
        pinterest_url: toNull(fields.pinterest_url),
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", membership.estudio.id);

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
            <div className="mb-4">
              <h1 className="font-display text-3xl font-bold text-foreground">
                Perfil do Estúdio
              </h1>
              <p className="text-muted-foreground mt-2">
                Gerencie as informações públicas do seu estúdio
              </p>
            </div>

            <StudioProfileNavigation />

            <p className="text-muted-foreground mb-8">
              Adicione links para que profissionais encontrem mais sobre o estúdio
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="website"
                    value={fields.website}
                    onChange={(e) => setField("website", e.target.value)}
                    placeholder="https://seuestudio.com"
                    className="h-11 pl-10 bg-input border-border"
                  />
                </div>
                {validationErrors.website && (
                  <p className="text-sm text-destructive">{validationErrors.website}</p>
                )}
              </div>

              {/* Redes sociais */}
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
          </CardContent>
        </Card>
      </div>
    </StudioDashboardLayout>
  );
}
