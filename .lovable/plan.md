

## Prompt 07 — Correção: seção de Habilidades da ProfessionalsSidebar

### 1 arquivo alterado: `src/components/professionals/ProfessionalsSidebar.tsx`

---

### Mudanças

**Imports — remover:**
- `Search` from lucide-react
- `useQuery` from @tanstack/react-query
- `Input`, `Checkbox`, `Skeleton` from UI
- `supabase` from integrations

**Imports — adicionar:**
- `useAvailableSkills, Habilidade` from `@/hooks/useAvailableSkills`
- `MultiSelectCombobox` from `@/components/ui/multi-select-combobox`

**Nota:** `Checkbox` ainda é usado nas seções de Disponibilidade e Modalidade, então NÃO pode ser removido.

**Fora do componente — adicionar** `groupSkillsByCategory` (copiado da JobsSidebar).

**Dentro do componente — substituir:**
- Remover `useState` para `skillSearch`
- Remover `useQuery` inline
- Remover `filteredSkills` useMemo
- Remover `selectedSkills` e `handleSkillToggle`
- Adicionar: `useAvailableSkills()` + `groupSkillsByCategory(availableSkills)`
- Adicionar: `skillOptions` useMemo (idêntico à JobsSidebar)
- Adicionar: `selectedByCategory` useMemo (idêntico à JobsSidebar)
- Adicionar: `handleCategorySelection` (idêntico à JobsSidebar)

**JSX da seção Habilidades (linhas 180-274) — substituir por:**
```tsx
<div className="space-y-4">
  <Label className="text-sm">Habilidades</Label>
  {loadingSkills ? (
    <p className="text-xs text-muted-foreground">Carregando...</p>
  ) : (
    <div className="space-y-3">
      {skillOptions.habilidades.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Habilidades</Label>
          <MultiSelectCombobox ... />
        </div>
      )}
      {skillOptions.softwares.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Softwares</Label>
          <MultiSelectCombobox ... />
        </div>
      )}
    </div>
  )}
</div>
```

Placeholders, search placeholders e empty messages idênticos aos da JobsSidebar.

