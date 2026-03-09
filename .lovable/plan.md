
## Prompt 02 — Componentes: ProfessionalCard + ProfessionalCardSkeleton

### 2 arquivos novos, nenhum arquivo existente alterado

---

### Arquivo 1 — `src/components/professionals/ProfessionalCard.tsx`

**Estrutura visual** (segue JobCard como referência de estilo):

```
<a href="/p/:slug" target="_blank" rel="noopener noreferrer">
  <Card className="p-4 cursor-pointer bg-card/50 border-border/50 hover:border-border/80 hover:bg-card/70 transition-all duration-200">
    
    {/* Cabeçalho: Avatar + Info + Badge Disponível */}
    <div className="flex gap-4 items-start">
      <Avatar 48x48 rounded-full>
        <AvatarImage src={avatar_url} />
        <AvatarFallback>  ← iniciais: split nome por espaço → [0][0] + [last][0]
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-foreground truncate">  ← nome_completo
            {titulo_profissional && <p className="text-sm text-muted-foreground">}
            {localização && <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin w-3 h-3 /> cidade+estado / só estado / só cidade
            }
          </div>
          {disponivel_para_trabalho && (
            <Badge className="bg-primary text-primary-foreground text-xs flex-shrink-0">
              Disponível
            </Badge>
          )}
        </div>
      </div>
    </div>
    
    {/* Rodapé: Habilidades (só se length > 0) */}
    {habilidades.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/50">
        {habilidades.slice(0,4).map → Badge variant="secondary" text-xs bg-muted/80}
        {total_habilidades > 4 && <span className="text-xs text-muted-foreground">+{total_habilidades - 4} mais</span>}
      </div>
    )}
  </Card>
</a>
```

**Lógica de iniciais:**
```ts
const getInitials = (name: string) => {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
```

**Lógica de localização:**
```ts
const location =
  cidade && estado ? `${cidade}, ${estado}` :
  estado ? estado :
  cidade ? cidade : null;
```

---

### Arquivo 2 — `src/components/professionals/ProfessionalCardSkeleton.tsx`

**`ProfessionalCardSkeleton`** — espelha estrutura do card real:
```
<Card className="p-4">
  <div className="flex gap-4 items-start">
    <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36" />   ← nome
          <Skeleton className="h-3 w-28" />   ← título
          <Skeleton className="h-3 w-20" />   ← localização
        </div>
        <Skeleton className="h-5 w-20" />     ← badge disponível
      </div>
    </div>
  </div>
  <div className="flex gap-1.5 mt-3 pt-3 border-t border-border/50">
    <Skeleton className="h-5 w-16" />
    <Skeleton className="h-5 w-12" />
    <Skeleton className="h-5 w-20" />
    <Skeleton className="h-5 w-14" />
  </div>
</Card>
```

**`ProfessionalCardSkeletonGrid`** — 6 skeletons no grid da página:
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
  {Array.from({ length: 6 }).map((_, i) => <ProfessionalCardSkeleton key={i} />)}
</div>
```

Exports: `ProfessionalCard`, `ProfessionalCardSkeleton`, `ProfessionalCardSkeletonGrid`.

---

### O que NÃO muda
Nenhum arquivo existente é tocado.
