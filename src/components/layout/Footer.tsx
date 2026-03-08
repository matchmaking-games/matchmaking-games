import { Link } from "react-router-dom";
import { SocialIcon } from "@/components/SocialIcon";
import matchmakingLogo from "@/assets/matchmaking-logo.png";

const socials = [
  { network: "linkedin", href: "https://www.linkedin.com/company/matchmaking-games/" },
  { network: "instagram", href: "https://www.instagram.com/matchmaking.games/" },
  { network: "tiktok", href: "https://www.tiktok.com/@matchmaking.games" },
  { network: "youtube", href: "https://www.youtube.com/@Negócios-em-Jogo" },
  { network: "linktree", href: "https://linktr.ee/matchmaking.games" },
];

export function Footer() {
  return (
    <footer style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 24px" }}>
      <div className="flex flex-col md:flex-row items-center justify-center gap-5 md:gap-12">
        <img src={matchmakingLogo} alt="Matchmaking" className="h-8" style={{ opacity: 0.65 }} />

        <div className="flex items-center gap-5">
          {socials.map((s) => (
            <a
              key={s.network}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.35)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)";
              }}
            >
              <SocialIcon network={s.network} size={18} className="fill-current" />
            </a>
          ))}
        </div>
      </div>

      <p className="text-center" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 16 }}>
        Matchmaking · Feito para quem vive de games
      </p>
      <p className="text-center" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
        <Link to="/terms" className="hover:underline" style={{ color: "inherit" }}>
          Termos de Uso
        </Link>
        {" · "}
        <Link to="/privacy" className="hover:underline" style={{ color: "inherit" }}>
          Política de Privacidade
        </Link>
      </p>
    </footer>
  );
}
