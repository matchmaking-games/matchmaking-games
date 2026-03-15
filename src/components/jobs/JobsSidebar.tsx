import { useEffect, useMemo, useState } from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { useAvailableSkills, Habilidade } from "@/hooks/shared/useAvailableSkills";
import { useIBGELocations } from "@/hooks/shared/useIBGELocations";
import { useTiposFuncao } from "@/hooks/shared/useTiposFuncao";
import { JobFilters } from "@/hooks/search/useJobFilters";
import { cn } from "@/lib/utils";

interface JobsSidebarProps {
  filters: JobFilters;
  onFilterChange: (key: string, value: string | null) => void;
  onHabilidadesChange: (ids: string[]) => void;
  onEstadoChange: (uf: string | null) => void;
  onCidadeChange: (nome: string | null) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}

function groupSkillsByCategory(skills: Habilidade[]) {
  return {
    habilidades: skills.filter((s) => s.categoria === "habilidades"),
    softwares: skills.filter((s) => s.categoria === "softwares"),
  };
}

export function JobsSidebar({
  filters,
  onFilterChange,
  onHabilidadesChange,
  onEstadoChange,
  onCidadeChange,
  onClearAll,
  activeFilterCount,
}: JobsSidebarProps) {
  const { availableSkills, loading: loadingSkills } = useAvailableSkills();
  const groupedSkills = groupSkillsByCategory(availableSkills);

  const {
    estados,
    loadingEstados,
    municipios,
    loadingMunicipios,
    fetchMunicipios,
    clearMunicipios,
  } = useIBGELocations();

  // Load municipalities when estado is in URL on mount or when estado changes
  useEffect(() => {
    if (filters.estado) {
      fetchMunicipios(filters.estado);
    } else {
      clearMunicipios();
    }
  }, [filters.estado, fetchMunicipios, clearMunicipios]);

  // Convert skills to combobox options format
  const skillOptions = useMemo(() => ({
    habilidades: groupedSkills.habilidades.map((s) => ({ value: s.id, label: s.nome })),
    softwares: groupedSkills.softwares.map((s) => ({ value: s.id, label: s.nome })),
  }), [groupedSkills]);

  // Get selected skills per category
  const selectedByCategory = useMemo(() => {
    const selected = filters.habilidades || [];
    return {
      habilidades: selected.filter((id) => groupedSkills.habilidades.some((s) => s.id === id)),
      softwares: selected.filter((id) => groupedSkills.softwares.some((s) => s.id === id)),
    };
  }, [filters.habilidades, groupedSkills]);

  // Handle category-specific skill selection
  const handleCategorySelection = (category: keyof typeof selectedByCategory, newSelected: string[]) => {
    const otherCategories = Object.keys(selectedByCategory)
      .filter((k) => k !== category)
      .flatMap((k) => selectedByCategory[k as keyof typeof selectedByCategory]);
    
    onHabilidadesChange([...otherCategories, ...newSelected]);
  };

  // Handle estado change
  const handleEstadoChange = (value: string) => {
    if (value === "__all__") {
      onEstadoChange(null);
    } else {
      onEstadoChange(value);
    }
  };

  // Handle cidade change
  const handleCidadeChange = (value: string) => {
    if (value === "__all__") {
      onCidadeChange(null);
    } else {
      onCidadeChange(value);
    }
  };

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

      {/* Botão Limpar Filtros - MOVIDO PARA O TOPO */}
      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={onClearAll}>
          <X className="w-4 h-4 mr-2" />
          Limpar filtros
        </Button>
      )}

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

      {/* Estado */}
      <div className="space-y-2">
        <Label className="text-sm">Estado</Label>
        <Select
          value={filters.estado || "__all__"}
          onValueChange={handleEstadoChange}
          disabled={loadingEstados}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingEstados ? "Carregando..." : "Selecione estado..."} />
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

      {/* Cidade - só aparece se estado selecionado */}
      {filters.estado && (
        <div className="space-y-2 ml-4 border-l-2 border-border pl-4">
          <Label className="text-sm">Cidade</Label>
          <Select
            value={filters.cidade || "__all__"}
            onValueChange={handleCidadeChange}
            disabled={loadingMunicipios}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingMunicipios ? "Carregando..." : "Selecione cidade..."} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas as cidades</SelectItem>
              {municipios.map((municipio) => (
                <SelectItem key={municipio.id} value={municipio.nome}>
                  {municipio.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Tipo de Função */}
      <TipoFuncaoFilter
        value={filters.tipoFuncao}
        onChange={(v) => onFilterChange("funcao", v)}
      />

      {/* Habilidades - 4 Combobox independentes */}
      <div className="space-y-4">
        <Label className="text-sm">Habilidades</Label>

        {loadingSkills ? (
          <p className="text-xs text-muted-foreground">Carregando...</p>
        ) : (
          <div className="space-y-3">
            {/* Habilidades */}
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

            {/* Softwares */}
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

// --- Tipo de Função Combobox Filter ---

interface TipoFuncaoFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

function TipoFuncaoFilter({ value, onChange }: TipoFuncaoFilterProps) {
  const { tiposFuncao, loading } = useTiposFuncao();
  const [open, setOpen] = useState(false);

  const selectedLabel = value
    ? tiposFuncao.find((t) => t.id === value)?.nome ?? "Carregando..."
    : "Todos os tipos";

  return (
    <div className="space-y-2">
      <Label className="text-sm">Tipo de Função</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={loading}
          >
            <span className="truncate">
              {loading ? "Carregando..." : selectedLabel}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar função..." />
            <CommandList className="max-h-[200px] overflow-y-auto scrollbar-thin">
              <CommandEmpty>Nenhuma função encontrada</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="__all__"
                  onSelect={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", !value ? "opacity-100" : "opacity-0")} />
                  Todos os tipos
                </CommandItem>
                {tiposFuncao.map((tipo) => (
                  <CommandItem
                    key={tipo.id}
                    value={tipo.nome}
                    onSelect={() => {
                      onChange(tipo.id);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === tipo.id ? "opacity-100" : "opacity-0")} />
                    {tipo.nome}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
