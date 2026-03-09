
## TASK-E05: Dropdown "Explorar" no Header

### Arquivo único a editar
`src/components/layout/Header.tsx`

### Mudanças exatas

**1. Imports** — Adicionar ao topo:
- `NavigationMenu`, `NavigationMenuContent`, `NavigationMenuItem`, `NavigationMenuList`, `NavigationMenuTrigger` de `@/components/ui/navigation-menu`
- `CalendarRange`, `Users`, `Building2`, `Layers` do `lucide-react` (junto aos ícones já importados)

**2. Array `exploreItems`** — Declarar antes do componente `Header`:
```
Eventos      /events        CalendarRange
Profissionais /professionals Users
Estúdios     /studios       Building2
Projetos     /projects      Layers
```

**3. Desktop (linha 134)** — Após o link "Vagas", antes do bloco `{isLoading ? ...}`, inserir:
```
NavigationMenu
  └─ NavigationMenuList
       └─ NavigationMenuItem
            ├─ NavigationMenuTrigger → "Explorar"
            └─ NavigationMenuContent
                 └─ ul.w-64.p-2
                      └─ {exploreItems.map} → li > Link > div.flex.items-start.gap-3
                           ├─ Icon h-5 w-5 text-muted-foreground mt-0.5
                           └─ div
                                ├─ p.font-medium
                                └─ p.text-sm.text-muted-foreground
```

**4. Mobile (linha 61)** — Após o link "Vagas" (linha 61), antes do bloco `{isAuthenticated && ...}`, inserir 4 links com mesmo padrão visual dos outros links mobile:
- `CalendarRange` → `/events` → "Eventos"
- `Users` → `/professionals` → "Profissionais"  
- `Building2` → `/studios` → "Estúdios"
- `Layers` → `/projects` → "Projetos"

### O que NÃO muda
- Toda lógica de autenticação
- Link "Vagas" desktop e mobile
- Botões "Painel", "Entrar", "Criar Conta", avatar dropdown
- Links "Painel", "Configurações" e "Sair" no mobile
- Logo, altura, z-index, border, bg do header
- Nenhum outro arquivo
