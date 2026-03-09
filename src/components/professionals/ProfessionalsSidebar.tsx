import { useMemo } from "react";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { useAvailableSkills, Habilidade } from "@/hooks/useAvailableSkills";
import { useIBGELocations } from "@/hooks/useIBGELocations";
import type { ProfessionalFilters } from "@/types/professional";

interface ProfessionalsSidebarProps {
  filters: ProfessionalFilters;
  onFilterChange: (key: string, value: string | null) => void;
  onHabilidadesChange: (ids: string[]) => void;
  onEstadoChange: (uf: string | null) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}

const MODALIDADES = [
  { value: "remoto", label: "Remoto" },
  { value: "hibrido", label: "Híbrido" },
  { value: "presencial", label: "Presencial" },
] as const;

function groupSkillsByCategory(skills: Habilidade[]) {
  return {
    habilidades: skills.filter((s) => s.categoria === "habilidades"),
    softwares: skills.filter((s) => s.categoria === "softwares"),
  };
}

export function ProfessionalsSidebar({
  filters,
  onFilterChange,
  onHabilidadesChange,
  onEstadoChange,
  onClearAll,
  activeFilterCount,
}: ProfessionalsSidebarProps) {
  const { availableSkills, loading: loadingSkills } = useAvailableSkills();
  const groupedSkills = groupSkillsByCategory(availableSkills);

  const { estados, loadingEstados } = useIBGELocations();

  const skillOptions = useMemo(() => ({
    habilidades: groupedSkills.habilidades.map((s) => ({ value: s.id, label: s.nome })),
    softwares: groupedSkills.softwares.map((s) => ({ value: s.id, label: s.nome })),
  }), [groupedSkills]);

  const selectedByCategory = useMemo(() => {
    const selected = filters.habilidades || [];
    return {
      habilidades: selected.filter((id) => groupedSkills.habilidades.some((s) => s.id === id)),
      softwares: selected.filter((id) => groupedSkills.softwares.some((s) => s.id === id)),
    };
  }, [filters.habilidades, groupedSkills]);

  const handleCategorySelection = (category: keyof typeof selectedByCategory, newSelected: string[]) => {
    const otherCategories = Object.keys(selectedByCategory)
      .filter((k) => k !== category)
      .flatMap((k) => selectedByCategory[k as keyof typeof selectedByCategory]);
    onHabilidadesChange([...otherCategories, ...newSelected]);
  };

  const handleModalidadeToggle = (value: string, checked: boolean) => {
    const current = filters.tipoTrabalho || [];
    const next = checked
      ? [...current, value]
      : current.filter((v) => v !== value);
    onFilterChange("trabalho", next.length > 0 ? next.join(",") : null);
  };

  const handleEstadoChange = (value: string) => {
    onEstadoChange(value === "__all__" ? null : value);
  };

  return (
    <Card className="p-4 space-y-6 lg:sticky lg:top-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Filtros</h2>
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeFilterCount} {activeFilterCount === 1 ? "ativo" : "ativos"}
          </Badge>
        )}
      </div>

      {/* Limpar filtros */}
      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={onClearAll}>
          <X className="w-4 h-4 mr-2" />
          Limpar filtros
        </Button>
      )}

      {/* Disponibilidade */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="disponivel"
            checked={filters.disponivel === true}
            onCheckedChange={(checked) =>
              onFilterChange("disponivel", checked ? "true" : null)
            }
          />
          <Label htmlFor="disponivel" className="text-sm cursor-pointer">
            Apenas disponíveis para trabalho
          </Label>
        </div>
      </div>

      {/* Modalidade */}
      <div className="space-y-2">
        <Label className="text-sm">Modalidade</Label>
        <div className="space-y-2">
          {MODALIDADES.map((m) => (
            <div key={m.value} className="flex items-center space-x-2">
              <Checkbox
                id={`modalidade-${m.value}`}
                checked={(filters.tipoTrabalho || []).includes(m.value)}
                onCheckedChange={(checked) =>
                  handleModalidadeToggle(m.value, !!checked)
                }
              />
              <Label
                htmlFor={`modalidade-${m.value}`}
                className="text-sm cursor-pointer"
              >
                {m.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Estado */}
      <div className="space-y-2">
        <Label className="text-sm">Estado</Label>
        <Select
          value={filters.estado || "__all__"}
          onValueChange={handleEstadoChange}
          disabled={loadingEstados}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={loadingEstados ? "Carregando..." : "Selecione estado..."}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos os estados</SelectItem>
            {estados.map((estado) => (
              <SelectItem key={estado.sigla} value={estado.sigla}>
                {estado.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Habilidades */}
      <div className="space-y-4">
        <Label className="text-sm">Habilidades</Label>

        {loadingSkills ? (
          <p className="text-xs text-muted-foreground">Carregando...</p>
        ) : (
          <div className="space-y-3">
            {skillOptions.habilidades.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Habilidades</Label>
                <MultiSelectCombobox
                  options={skillOptions.habilidades}
                  selected={selectedByCategory.habilidades}
                  onSelectionChange={(ids) => handleCategorySelection("habilidades", ids)}
                  placeholder="Selecione habilidades..."
                  searchPlaceholder="Buscar habilidade..."
                  emptyMessage="Nenhuma habilidade encontrada"
                />
              </div>
            )}

            {skillOptions.softwares.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Softwares</Label>
                <MultiSelectCombobox
                  options={skillOptions.softwares}
                  selected={selectedByCategory.softwares}
                  onSelectionChange={(ids) => handleCategorySelection("softwares", ids)}
                  placeholder="Selecione softwares..."
                  searchPlaceholder="Buscar software..."
                  emptyMessage="Nenhum software encontrado"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
