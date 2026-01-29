import { X, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAvailableSkills, Habilidade } from "@/hooks/useAvailableSkills";
import { JobFilters } from "@/hooks/useJobFilters";

interface JobsSidebarProps {
  filters: JobFilters;
  onFilterChange: (key: string, value: string | null) => void;
  onHabilidadesChange: (ids: string[]) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}

function groupSkillsByCategory(skills: Habilidade[]) {
  return {
    engine: skills.filter((s) => s.categoria === "engine"),
    linguagem: skills.filter((s) => s.categoria === "linguagem"),
    ferramenta: skills.filter((s) => s.categoria === "ferramenta"),
    soft_skill: skills.filter((s) => s.categoria === "soft_skill"),
  };
}

export function JobsSidebar({
  filters,
  onFilterChange,
  onHabilidadesChange,
  onClearAll,
  activeFilterCount,
}: JobsSidebarProps) {
  const { availableSkills, loading: loadingSkills } = useAvailableSkills();
  const groupedSkills = groupSkillsByCategory(availableSkills);

  const handleSkillToggle = (skillId: string, checked: boolean) => {
    const current = filters.habilidades || [];
    const next = checked
      ? [...current, skillId]
      : current.filter((id) => id !== skillId);
    onHabilidadesChange(next);
  };

  const removeSkill = (skillId: string) => {
    const next = (filters.habilidades || []).filter((id) => id !== skillId);
    onHabilidadesChange(next);
  };

  const selectedSkillNames = (filters.habilidades || [])
    .map((id) => availableSkills.find((s) => s.id === id))
    .filter(Boolean) as Habilidade[];

  return (
    <Card className="p-4 space-y-6 lg:sticky lg:top-24">
      {/* Header com contador */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Filtros</h2>
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeFilterCount} {activeFilterCount === 1 ? "ativo" : "ativos"}
          </Badge>
        )}
      </div>

      {/* Nivel */}
      <div className="space-y-2">
        <Label className="text-sm">Nível</Label>
        <Select
          value={filters.nivel || "__all__"}
          onValueChange={(v) => onFilterChange("nivel", v === "__all__" ? null : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os níveis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos os níveis</SelectItem>
            <SelectItem value="iniciante">Iniciante</SelectItem>
            <SelectItem value="junior">Júnior</SelectItem>
            <SelectItem value="pleno">Pleno</SelectItem>
            <SelectItem value="senior">Sênior</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tipo de Contrato */}
      <div className="space-y-2">
        <Label className="text-sm">Tipo de Contrato</Label>
        <Select
          value={filters.tipoContrato || "__all__"}
          onValueChange={(v) => onFilterChange("contrato", v === "__all__" ? null : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos os tipos</SelectItem>
            <SelectItem value="clt">CLT</SelectItem>
            <SelectItem value="pj">PJ</SelectItem>
            <SelectItem value="freelance">Freelance</SelectItem>
            <SelectItem value="estagio">Estágio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Modelo de Trabalho */}
      <div className="space-y-2">
        <Label className="text-sm">Modelo de Trabalho</Label>
        <Select
          value={filters.modeloTrabalho || "__all__"}
          onValueChange={(v) => onFilterChange("modelo", v === "__all__" ? null : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os modelos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos os modelos</SelectItem>
            <SelectItem value="presencial">Presencial</SelectItem>
            <SelectItem value="hibrido">Híbrido</SelectItem>
            <SelectItem value="remoto">Remoto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Localizacao */}
      <div className="space-y-2">
        <Label className="text-sm">Localização</Label>
        <Input
          placeholder="Ex: São Paulo"
          value={filters.localizacao || ""}
          onChange={(e) => onFilterChange("local", e.target.value || null)}
        />
      </div>

      {/* Habilidades com Collapsible por categoria */}
      <div className="space-y-3">
        <Label className="text-sm">Habilidades</Label>

        {/* Badges das habilidades selecionadas */}
        {selectedSkillNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pb-2">
            {selectedSkillNames.map((skill) => (
              <Badge
                key={skill.id}
                variant="secondary"
                className="text-xs gap-1 pr-1"
              >
                {skill.nome}
                <button
                  type="button"
                  onClick={() => removeSkill(skill.id)}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {loadingSkills ? (
          <p className="text-xs text-muted-foreground">Carregando...</p>
        ) : (
          <div className="space-y-2">
            <SkillCategoryCollapsible
              label="Engines"
              skills={groupedSkills.engine}
              selectedIds={filters.habilidades || []}
              onToggle={handleSkillToggle}
            />
            <SkillCategoryCollapsible
              label="Linguagens"
              skills={groupedSkills.linguagem}
              selectedIds={filters.habilidades || []}
              onToggle={handleSkillToggle}
            />
            <SkillCategoryCollapsible
              label="Ferramentas"
              skills={groupedSkills.ferramenta}
              selectedIds={filters.habilidades || []}
              onToggle={handleSkillToggle}
            />
            <SkillCategoryCollapsible
              label="Soft Skills"
              skills={groupedSkills.soft_skill}
              selectedIds={filters.habilidades || []}
              onToggle={handleSkillToggle}
            />
          </div>
        )}
      </div>

      {/* Botao Limpar Filtros */}
      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={onClearAll}>
          <X className="w-4 h-4 mr-2" />
          Limpar filtros
        </Button>
      )}
    </Card>
  );
}

function SkillCategoryCollapsible({
  label,
  skills,
  selectedIds,
  onToggle,
}: {
  label: string;
  skills: Habilidade[];
  selectedIds: string[];
  onToggle: (id: string, checked: boolean) => void;
}) {
  const selectedCount = skills.filter((s) => selectedIds.includes(s.id)).length;

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm text-left hover:bg-muted/50 rounded px-2 -mx-2">
        <span className="text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <Badge variant="secondary" className="text-xs h-5 px-1.5">
              {selectedCount}
            </Badge>
          )}
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pt-2 pb-1">
        {skills.map((skill) => (
          <label
            key={skill.id}
            className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/30 rounded px-2 py-1 -mx-2"
          >
            <Checkbox
              checked={selectedIds.includes(skill.id)}
              onCheckedChange={(checked) => onToggle(skill.id, !!checked)}
            />
            <span>{skill.nome}</span>
          </label>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
