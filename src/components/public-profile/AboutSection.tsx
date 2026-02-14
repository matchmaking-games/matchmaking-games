import { Globe, Linkedin, Github, Briefcase, Mail, Phone, Copy } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import type { PublicUserData } from "@/hooks/usePublicProfile";

interface AboutSectionProps {
  user: PublicUserData;
}

export function AboutSection({ user }: AboutSectionProps) {
  const { toast } = useToast();
  const showEmail = user.mostrar_email && user.email;
  const showPhone = user.mostrar_telefone && user.telefone;
  const hasContact = showEmail || showPhone;

  const socialLinks = [
    { url: user.website, icon: Globe, label: "Website" },
    { url: user.linkedin_url, icon: Linkedin, label: "LinkedIn" },
    { url: user.github_url, icon: Github, label: "GitHub" },
    { url: user.portfolio_url, icon: Briefcase, label: "Portfolio" },
  ].filter((link) => link.url);

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
        <div className="flex flex-wrap gap-2">
          {socialLinks.map((link) => (
            <Tooltip key={link.label}>
              <TooltipTrigger asChild>
                <a
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center p-2.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                </a>
              </TooltipTrigger>
              <TooltipContent>{link.label}</TooltipContent>
            </Tooltip>
          ))}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCopyUrl}
                className="inline-flex items-center justify-center p-2.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4" />
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
        {!user.bio_curta && !user.sobre && socialLinks.length === 0 && !hasContact && (
          <p className="text-muted-foreground italic">
            Nenhuma informação disponível ainda.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
