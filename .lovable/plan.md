

## Plan: Reorganize DashboardSidebar Navigation into Groups

**Single file edit:** `src/components/dashboard/DashboardSidebar.tsx`

### What changes

1. **Add icon imports**: `Users`, `Building2`, `Layers`, `CalendarDays` from lucide-react

2. **Replace single `navItems` array** (lines 47-51) with three arrays:

```ts
const personalItems = [
  { title: "Visão geral", url: "/dashboard", icon: LayoutDashboard },
  { title: "Meu perfil", url: "/dashboard/profile", icon: User },
];

const discoveryItems = [
  { title: "Buscar vagas", url: "/jobs", icon: Briefcase },
  { title: "Buscar profissionais", url: "/professionals", icon: Users },
  { title: "Buscar estúdios", url: "/studios", icon: Building2 },
  { title: "Buscar projetos", url: "/projects", icon: Layers },
];

const communityItems = [
  { title: "Meus eventos", url: "/dashboard/events", icon: CalendarDays },
];
```

3. **Replace single SidebarGroup** (lines 88-108) with three groups, each with a label and its items. Group labels styled as `text-xs text-muted-foreground uppercase tracking-wider px-3 mb-1`. Second and third groups get `mt-4` for spacing. The `end` prop on NavLink applies only when `url === "/dashboard"`.

### What stays untouched

- SidebarHeader (logo)
- SidebarFooter (avatar, dropdown, profile switching, sign out)
- All hooks, imports, and logic outside the nav section

