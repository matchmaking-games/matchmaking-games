import { useEffect, useMemo } from "react";
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
import { useAvailableSkills, Habilidade } from "@/hooks/useAvailableSkills";
import { useIBGELocations } from "@/hooks/useIBGELocations";
import { JobFilters } from "@/hooks/useJobFilters";

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
    engine: groupedSkills.engine.map((s) => ({ value: s.id, label: s.nome })),
    linguagem: groupedSkills.linguagem.map((s) => ({ value: s.id, label: s.nome })),
    ferramenta: groupedSkills.ferramenta.map((s) => ({ value: s.id, label: s.nome })),
    soft_skill: groupedSkills.soft_skill.map((s) => ({ value: s.id, label: s.nome })),
  }), [groupedSkills]);

  // Get selected skills per category
  const selectedByCategory = useMemo(() => {
    const selected = filters.habilidades || [];
    return {
      engine: selected.filter((id) => groupedSkills.engine.some((s) => s.id === id)),
      linguagem: selected.filter((id) => groupedSkills.linguagem.some((s) => s.id === id)),
      ferramenta: selected.filter((id) => groupedSkills.ferramenta.some((s) => s.id === id)),
      soft_skill: selected.filter((id) => groupedSkills.soft_skill.some((s) => s.id === id)),
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

      {/* Habilidades - 4 Combobox independentes */}
      <div className="space-y-4">
        <Label className="text-sm">Habilidades</Label>

        {loadingSkills ? (
          <p className="text-xs text-muted-foreground">Carregando...</p>
        ) : (
          <div className="space-y-3">
            {/* Engines */}
            {skillOptions.engine.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Engines</Label>
                <MultiSelectCombobox
                  options={skillOptions.engine}
                  selected={selectedByCategory.engine}
                  onSelectionChange={(ids) => handleCategorySelection("engine", ids)}
                  placeholder="Selecione engines..."
                  searchPlaceholder="Buscar engine..."
                  emptyMessage="Nenhuma engine encontrada"
                />
              </div>
            )}

            {/* Linguagens */}
            {skillOptions.linguagem.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Linguagens</Label>
                <MultiSelectCombobox
                  options={skillOptions.linguagem}
                  selected={selectedByCategory.linguagem}
                  onSelectionChange={(ids) => handleCategorySelection("linguagem", ids)}
                  placeholder="Selecione linguagens..."
                  searchPlaceholder="Buscar linguagem..."
                  emptyMessage="Nenhuma linguagem encontrada"
                />
              </div>
            )}

            {/* Ferramentas */}
            {skillOptions.ferramenta.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Ferramentas</Label>
                <MultiSelectCombobox
                  options={skillOptions.ferramenta}
                  selected={selectedByCategory.ferramenta}
                  onSelectionChange={(ids) => handleCategorySelection("ferramenta", ids)}
                  placeholder="Selecione ferramentas..."
                  searchPlaceholder="Buscar ferramenta..."
                  emptyMessage="Nenhuma ferramenta encontrada"
                />
              </div>
            )}

            {/* Soft Skills */}
            {skillOptions.soft_skill.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Soft Skills</Label>
                <MultiSelectCombobox
                  options={skillOptions.soft_skill}
                  selected={selectedByCategory.soft_skill}
                  onSelectionChange={(ids) => handleCategorySelection("soft_skill", ids)}
                  placeholder="Selecione soft skills..."
                  searchPlaceholder="Buscar soft skill..."
                  emptyMessage="Nenhuma soft skill encontrada"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
