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
import { useIBGELocations } from "@/hooks/shared/useIBGELocations";
import type { StudioFilters } from "@/types/studio";

const ESPECIALIDADES_OPTIONS = [
  { value: "Mobile", label: "Mobile" },
  { value: "PC", label: "PC" },
  { value: "Console", label: "Console" },
  { value: "VR", label: "VR" },
  { value: "Casual", label: "Casual" },
  { value: "Indie", label: "Indie" },
  { value: "AA", label: "AA" },
  { value: "AAA", label: "AAA" },
  { value: "F2P", label: "F2P" },
];

interface StudiosSidebarProps {
  filters: StudioFilters;
  onFilterChange: (key: string, value: string | null) => void;
  onEspecialidadesChange: (items: string[]) => void;
  onEstadoChange: (uf: string | null) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}

export function StudiosSidebar({
  filters,
  onFilterChange,
  onEspecialidadesChange,
  onEstadoChange,
  onClearAll,
  activeFilterCount,
}: StudiosSidebarProps) {
  const { estados, loadingEstados } = useIBGELocations();

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

      {/* Tamanho */}
      <div className="space-y-2">
        <Label className="text-sm">Tamanho</Label>
        <Select
          value={filters.tamanho || "__all__"}
          onValueChange={(v) => onFilterChange("tamanho", v === "__all__" ? null : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os tamanhos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos os tamanhos</SelectItem>
            <SelectItem value="micro">Micro (1–10 pessoas)</SelectItem>
            <SelectItem value="pequeno">Pequeno (11–50 pessoas)</SelectItem>
            <SelectItem value="medio">Médio (51–200 pessoas)</SelectItem>
            <SelectItem value="grande">Grande (200+ pessoas)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Especialidades */}
      <div className="space-y-2">
        <Label className="text-sm">Especialidades</Label>
        <MultiSelectCombobox
          options={ESPECIALIDADES_OPTIONS}
          selected={filters.especialidades}
          onSelectionChange={onEspecialidadesChange}
          placeholder="Selecione especialidades..."
          searchPlaceholder="Buscar especialidade..."
          emptyMessage="Nenhuma especialidade encontrada"
        />
      </div>
    </Card>
  );
}
