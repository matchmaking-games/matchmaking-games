import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import {
  ENGINE_LABELS,
  PLATAFORMA_LABELS,
  GENERO_LABELS,
} from "@/constants/project-labels";
import type { ProjectFilters } from "@/types/project-search";

const ENGINE_OPTIONS = Object.entries(ENGINE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const PLATAFORMA_OPTIONS = Object.entries(PLATAFORMA_LABELS).map(
  ([value, label]) => ({ value, label })
);

const GENERO_OPTIONS = Object.entries(GENERO_LABELS).map(([value, label]) => ({
  value,
  label,
}));

interface ProjectsSidebarProps {
  filters: ProjectFilters;
  onFilterChange: (key: string, value: string | null) => void;
  onPlataformasChange: (items: string[]) => void;
  onGeneroChange: (items: string[]) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}

export function ProjectsSidebar({
  filters,
  onFilterChange,
  onPlataformasChange,
  onGeneroChange,
  onClearAll,
  activeFilterCount,
}: ProjectsSidebarProps) {
  const handleEngineChange = (value: string) => {
    onFilterChange("engine", value === "__all__" ? null : value);
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

      {/* Engine */}
      <div className="space-y-2">
        <Label className="text-sm">Engine</Label>
        <Select
          value={filters.engine || "__all__"}
          onValueChange={handleEngineChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas as engines" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas as engines</SelectItem>
            {ENGINE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Plataformas */}
      <div className="space-y-2">
        <Label className="text-sm">Plataformas</Label>
        <MultiSelectCombobox
          options={PLATAFORMA_OPTIONS}
          selected={filters.plataformas}
          onSelectionChange={onPlataformasChange}
          placeholder="Selecionar plataformas..."
          searchPlaceholder="Buscar plataforma..."
          emptyMessage="Nenhuma plataforma encontrada"
        />
      </div>

      {/* Gênero */}
      <div className="space-y-2">
        <Label className="text-sm">Gênero</Label>
        <MultiSelectCombobox
          options={GENERO_OPTIONS}
          selected={filters.genero}
          onSelectionChange={onGeneroChange}
          placeholder="Selecionar gêneros..."
          searchPlaceholder="Buscar gênero..."
          emptyMessage="Nenhum gênero encontrado"
        />
      </div>
    </Card>
  );
}
