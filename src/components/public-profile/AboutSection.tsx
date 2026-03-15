import { Globe, Briefcase, Mail, Phone, Copy } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/shared/use-toast";
import { SocialIcon } from "@/components/shared/SocialIcon";
import type { PublicUserData } from "@/hooks/public/usePublicProfile";

interface AboutSectionProps {
  user: PublicUserData;
}

export function AboutSection({ user }: AboutSectionProps) {
  const { toast } = useToast();
  const showEmail = user.mostrar_email && user.email;
  const showPhone = user.mostrar_telefone && user.telefone;
  const hasContact = showEmail || showPhone;

  const allSocialLinks = [
    { key: "website", url: user.website, isLucide: true, label: "Website" },
    { key: "linkedin", url: user.linkedin_url, label: "LinkedIn" },
    { key: "github", url: user.github_url, label: "GitHub" },
    { key: "twitter", url: user.twitter_url, label: "X / Twitter" },
    { key: "instagram", url: user.instagram_url, label: "Instagram" },
    { key: "facebook", url: user.facebook_url, label: "Facebook" },
    { key: "youtube", url: user.youtube_url, label: "YouTube" },
    { key: "twitch", url: user.twitch_url, label: "Twitch" },
    { key: "telegram", url: user.telegram_url, label: "Telegram" },
    { key: "artstation", url: user.artstation_url, label: "ArtStation" },
    { key: "behance", url: user.behance_url, label: "Behance" },
    { key: "dribbble", url: user.dribbble_url, label: "Dribbble" },
    { key: "itch", url: user.itch_url, label: "itch.io" },
    { key: "pinterest", url: user.pinterest_url, label: "Pinterest" },
    { key: "steam", url: user.steam_url, label: "Steam" },
    { key: "portfolio", url: user.portfolio_url, isLucide: true, label: "Portfólio" },
  ].filter((l) => l.url);

  const handleCopyUrl = async () => {
    const url = `https://matchmaking.games/p/${user.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: "O link do perfil foi copiado para a área de transferência.",
      });
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card id="sobre" className="scroll-mt-32">
      <CardHeader>
        <h2 className="text-xl font-display font-semibold text-foreground">
          Sobre
        </h2>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bio */}
        {user.bio_curta && (
          <p className="text-foreground leading-relaxed">{user.bio_curta}</p>
        )}

        {/* Sobre completo */}
        {user.sobre && (
          <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {user.sobre}
          </div>
        )}

        {/* Links sociais + copiar URL */}
        <div className="flex flex-wrap gap-1">
          {allSocialLinks.map(({ key, url, isLucide, label }) => (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <a
                  href={url!.startsWith("http") ? url! : `https://${url!}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={label}
                >
                  {isLucide ? (
                    key === "portfolio" ? (
                      <Briefcase className="w-5 h-5" />
                    ) : (
                      <Globe className="w-5 h-5" />
                    )
                  ) : (
                    <SocialIcon network={key} size={20} />
                  )}
                </a>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ))}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCopyUrl}
                className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Copy className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Copiar link do perfil</TooltipContent>
          </Tooltip>
        </div>

        {/* Contato */}
        {hasContact && (
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Contato
            </h3>
            <div className="flex flex-wrap gap-4">
              {showEmail && (
                <a
                  href={`mailto:${user.email}`}
                  className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </a>
              )}
              {showPhone && (
                <a
                  href={`tel:${user.telefone}`}
                  className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{user.telefone}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {!user.bio_curta && !user.sobre && allSocialLinks.length === 0 && !hasContact && (
          <p className="text-muted-foreground italic">
            Nenhuma informação disponível ainda.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
