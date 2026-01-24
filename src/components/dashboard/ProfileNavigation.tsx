import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Perfil", to: "/dashboard/profile", end: true },
  { label: "Portfólio", to: "/dashboard/profile/portfolio", end: false },
];

export function ProfileNavigation() {
  return (
    <nav className="flex gap-6 border-b border-border mb-6">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              isActive
                ? "text-foreground border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
