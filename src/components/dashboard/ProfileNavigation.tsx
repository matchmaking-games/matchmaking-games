import { useLocation, Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const navItems = [
  { label: "Perfil", to: "/dashboard/profile", value: "perfil" },
  { label: "Portfólio", to: "/dashboard/profile/portfolio", value: "portfolio" },
  { label: "Projetos", to: "/dashboard/profile/projects", value: "projetos" },
  { label: "Habilidades", to: "/dashboard/profile/skills", value: "habilidades" },
  { label: "Experiência", to: "/dashboard/profile/experience", value: "experiencia" },
  { label: "Educação", to: "/dashboard/profile/education", value: "educacao" },
];

export function ProfileNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const getActiveTab = () => {
    if (currentPath === "/dashboard/profile") return "perfil";
    if (currentPath.includes("/portfolio")) return "portfolio";
    if (currentPath.includes("/projects")) return "projetos";
    if (currentPath.includes("/skills")) return "habilidades";
    if (currentPath.includes("/experience")) return "experiencia";
    if (currentPath.includes("/education")) return "educacao";
    return "perfil";
  };

  const activeTab = getActiveTab();

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const hasOverflow = el.scrollWidth > el.clientWidth;
    setCanScrollLeft(hasOverflow && el.scrollLeft > 2);
    setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) {
        el.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  return (
    <nav className="relative mb-6 w-full max-w-full overflow-hidden">
      {/* Left fade indicator */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent pointer-events-none z-10 flex items-center justify-start transition-opacity duration-200 ${
          canScrollLeft ? "opacity-100" : "opacity-0"
        }`}
      >
        <ChevronLeft className="h-4 w-4 text-muted-foreground ml-0.5" />
      </div>

      {/* Scroll container with hidden scrollbar */}
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto scrollbar-hide"
      >
        <div className="flex gap-6 border-b border-border min-w-max px-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.value;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                  isActive
                    ? "text-foreground border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right fade indicator */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none z-10 flex items-center justify-end transition-opacity duration-200 ${
          canScrollRight ? "opacity-100" : "opacity-0"
        }`}
      >
        <ChevronRight className="h-4 w-4 text-muted-foreground mr-0.5" />
      </div>
    </nav>
  );
}
