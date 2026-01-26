

## Plano: Alterar URL de Perfil Publico de /profile/ para /p/

### Visao Geral

Alterar a estrutura de URLs dos perfis publicos de `/profile/{username}` para `/p/{username}`, seguindo o padrao de mercado (LinkedIn usa `/in/`) e facilitando o compartilhamento.

**Importante**: As rotas do dashboard (`/dashboard/profile`, `/dashboard/profile/portfolio`, etc.) NAO serao alteradas.

---

### Arquivos que Precisam ser Alterados

| Arquivo | Tipo de Alteracao | Descricao |
|---------|-------------------|-----------|
| `src/pages/Index.tsx` | Modificar | Atualizar prefixo do input de username |
| `src/pages/Signup.tsx` | Modificar | Atualizar mensagem de reserva de username |
| `src/pages/Onboarding.tsx` | Modificar | Atualizar prefixo do input de username |
| `src/components/projects/ProjectForm.tsx` | Modificar | Atualizar preview de URL do projeto |

---

### Detalhamento das Alteracoes

#### 1. src/pages/Index.tsx (Linha 143)

**Antes:**
```tsx
<span className="pl-4 pr-2 text-muted-foreground font-medium text-sm whitespace-nowrap">
  matchmaking.games/
</span>
```

**Depois:**
```tsx
<span className="pl-4 pr-2 text-muted-foreground font-medium text-sm whitespace-nowrap">
  matchmaking.games/p/
</span>
```

---

#### 2. src/pages/Signup.tsx (Linha 159)

**Antes:**
```tsx
<span className="text-primary font-semibold">
  matchmaking.games/{slug}
</span>
```

**Depois:**
```tsx
<span className="text-primary font-semibold">
  matchmaking.games/p/{slug}
</span>
```

---

#### 3. src/pages/Onboarding.tsx (Linha 248)

**Antes:**
```tsx
<span className="pl-3 pr-2 text-muted-foreground text-sm whitespace-nowrap">
  matchmaking.games/
</span>
```

**Depois:**
```tsx
<span className="pl-3 pr-2 text-muted-foreground text-sm whitespace-nowrap">
  matchmaking.games/p/
</span>
```

---

#### 4. src/components/projects/ProjectForm.tsx (Linha 285)

**Antes:**
```tsx
<p className="text-xs text-muted-foreground">
  matchmaking.games/profile/{userSlug}#{slugValue}
</p>
```

**Depois:**
```tsx
<p className="text-xs text-muted-foreground">
  matchmaking.games/p/{userSlug}#{slugValue}
</p>
```

---

### Nota sobre Rotas em App.tsx

Atualmente NAO existe uma rota `/profile/:slug` definida em `App.tsx`. Quando a pagina publica de perfil for implementada futuramente, ela devera usar o path `/p/:slug`:

```tsx
// Futura implementacao (NAO FAZER AGORA):
<Route path="/p/:slug" element={<PublicProfile />} />
```

---

### Rotas NAO Alteradas (Dashboard)

As seguintes rotas permanecem inalteradas:
- `/dashboard/profile`
- `/dashboard/profile/portfolio`
- `/dashboard/profile/skills`
- `/dashboard/profile/experience`
- `/dashboard/profile/education`
- `/dashboard/profile/projects`

---

### Resultado Esperado

| URL | Resultado |
|-----|-----------|
| `matchmaking.games/p/joaosilva` | Perfil publico (quando implementado) |
| `matchmaking.games/profile/joaosilva` | 404 (rota nao existe) |
| `matchmaking.games/dashboard/profile` | Dashboard de edicao (nao alterado) |

---

### Ordem de Implementacao

1. `src/pages/Index.tsx` - Alterar prefixo para `matchmaking.games/p/`
2. `src/pages/Signup.tsx` - Alterar mensagem de reserva para `/p/{slug}`
3. `src/pages/Onboarding.tsx` - Alterar prefixo para `matchmaking.games/p/`
4. `src/components/projects/ProjectForm.tsx` - Alterar preview para `/p/{userSlug}#`

