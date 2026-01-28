import { Globe, Linkedin, Github, Briefcase, Mail, Phone } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { PublicUserData } from "@/hooks/usePublicProfile";

interface AboutSectionProps {
  user: PublicUserData;
}

export function AboutSection({ user }: AboutSectionProps) {
  const hasLinks = user.website || user.linkedin_url || user.github_url || user.portfolio_url;
  const showEmail = user.mostrar_email && user.email;
  const showPhone = user.mostrar_telefone && user.telefone;
  const hasContact = showEmail || showPhone;

  const socialLinks = [
    { url: user.website, icon: Globe, label: "Website" },
    { url: user.linkedin_url, icon: Linkedin, label: "LinkedIn" },
    { url: user.github_url, icon: Github, label: "GitHub" },
    { url: user.portfolio_url, icon: Briefcase, label: "Portfolio" },
  ].filter((link) => link.url);

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

        {/* Links sociais */}
        {hasLinks && (
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.url!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <link.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{link.label}</span>
              </a>
            ))}
          </div>
        )}

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
        {!user.bio_curta && !user.sobre && !hasLinks && !hasContact && (
          <p className="text-muted-foreground italic">
            Nenhuma informação disponível ainda.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
