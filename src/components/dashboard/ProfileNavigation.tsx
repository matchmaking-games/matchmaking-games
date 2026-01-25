import { useLocation, Link } from "react-router-dom";

const navItems = [
  { label: "Perfil", to: "/dashboard/profile", value: "perfil" },
  { label: "Portfólio", to: "/dashboard/profile/portfolio", value: "portfolio" },
  { label: "Habilidades", to: "/dashboard/profile/skills", value: "habilidades" },
  { label: "Experiência", to: "/dashboard/profile/experience", value: "experiencia" },
];

export function ProfileNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const getActiveTab = () => {
    if (currentPath === "/dashboard/profile") return "perfil";
    if (currentPath.includes("/portfolio")) return "portfolio";
    if (currentPath.includes("/skills")) return "habilidades";
    if (currentPath.includes("/experience")) return "experiencia";
    return "perfil";
  };

  const activeTab = getActiveTab();

  return (
    <nav className="relative mb-6">
      {/* Scroll container with hidden scrollbar */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-6 border-b border-border min-w-max">
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
      {/* Fade indicator for mobile scroll */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none sm:hidden" />
    </nav>
  );
}
