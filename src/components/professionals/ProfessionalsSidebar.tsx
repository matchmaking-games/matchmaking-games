import { useMemo, useState } from "react";
import { X, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIBGELocations } from "@/hooks/useIBGELocations";
import { supabase } from "@/integrations/supabase/client";
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

export function ProfessionalsSidebar({
  filters,
  onFilterChange,
  onHabilidadesChange,
  onEstadoChange,
  onClearAll,
  activeFilterCount,
}: ProfessionalsSidebarProps) {
  const [skillSearch, setSkillSearch] = useState("");

  const { estados, loadingEstados } = useIBGELocations();

  const { data: allSkills, isLoading: loadingSkills, isError: skillsError } = useQuery({
    queryKey: ["available-skills-sidebar"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habilidades")
        .select("id, nome, categoria")
        .order("nome");
      if (error) throw error;
      return data;
    },
    staleTime: Infinity,
  });

  // Filter skills by search text
  const filteredSkills = useMemo(() => {
    if (!allSkills) return { habilidades: [], softwares: [] };
    const q = skillSearch.toLowerCase().trim();
    const filtered = q
      ? allSkills.filter((s) => s.nome.toLowerCase().includes(q))
      : allSkills;
    return {
      habilidades: filtered.filter((s) => s.categoria === "habilidades"),
      softwares: filtered.filter((s) => s.categoria === "softwares"),
    };
  }, [allSkills, skillSearch]);

  const selectedSkills = filters.habilidades || [];

  const handleModalidadeToggle = (value: string, checked: boolean) => {
    const current = filters.tipoTrabalho || [];
    const next = checked
      ? [...current, value]
      : current.filter((v) => v !== value);
    onFilterChange("trabalho", next.length > 0 ? next.join(",") : null);
  };

  const handleSkillToggle = (id: string, checked: boolean) => {
    const next = checked
      ? [...selectedSkills, id]
      : selectedSkills.filter((s) => s !== id);
    onHabilidadesChange(next);
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Habilidades</Label>
          {selectedSkills.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {selectedSkills.length} selecionada{selectedSkills.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loadingSkills ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : skillsError ? (
          <p className="text-xs text-muted-foreground">
            Não foi possível carregar as habilidades
          </p>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar habilidade..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {filteredSkills.habilidades.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Habilidades
                  </span>
                  {filteredSkills.habilidades.map((skill) => (
                    <div key={skill.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill.id}`}
                        checked={selectedSkills.includes(skill.id)}
                        onCheckedChange={(checked) =>
                          handleSkillToggle(skill.id, !!checked)
                        }
                      />
                      <Label
                        htmlFor={`skill-${skill.id}`}
                        className="text-sm cursor-pointer font-normal"
                      >
                        {skill.nome}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {filteredSkills.softwares.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Softwares
                  </span>
                  {filteredSkills.softwares.map((skill) => (
                    <div key={skill.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill.id}`}
                        checked={selectedSkills.includes(skill.id)}
                        onCheckedChange={(checked) =>
                          handleSkillToggle(skill.id, !!checked)
                        }
                      />
                      <Label
                        htmlFor={`skill-${skill.id}`}
                        className="text-sm cursor-pointer font-normal"
                      >
                        {skill.nome}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {filteredSkills.habilidades.length === 0 &&
                filteredSkills.softwares.length === 0 &&
                skillSearch && (
                  <p className="text-xs text-muted-foreground py-2">
                    Nenhuma habilidade encontrada
                  </p>
                )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
