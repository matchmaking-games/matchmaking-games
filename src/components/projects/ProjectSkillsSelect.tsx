import { useState, useMemo } from "react";
import { X, Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { useAvailableSkills, type Habilidade } from "@/hooks/useAvailableSkills";
import { cn } from "@/lib/utils";

interface ProjectSkillsSelectProps {
  selectedSkillIds: string[];
  onSkillsChange: (skillIds: string[]) => void;
  disabled?: boolean;
}

// --- Single category selector (internal) ---

interface CategorySelectorProps {
  label: string;
  categoria: Habilidade["categoria"];
  allSkills: Habilidade[];
  selectedSkillIds: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

function CategorySelector({
  label,
  categoria,
  allSkills,
  selectedSkillIds,
  onAdd,
  onRemove,
  disabled,
  loading,
}: CategorySelectorProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const categorySkills = useMemo(
    () => allSkills.filter((s) => s.categoria === categoria),
    [allSkills, categoria],
  );

  const selectedSkills = useMemo(
    () => categorySkills.filter((s) => selectedSkillIds.includes(s.id)),
    [categorySkills, selectedSkillIds],
  );

  const filteredSkills = useMemo(
    () =>
      categorySkills.filter(
        (s) =>
          !selectedSkillIds.includes(s.id) &&
          s.nome.toLowerCase().includes(search.toLowerCase()),
      ),
    [categorySkills, selectedSkillIds, search],
  );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* Selector popover (FIRST) */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            disabled={disabled || loading}
            className="w-full justify-between text-muted-foreground font-normal"
          >
            {loading ? "Carregando..." : `Adicionar ${label.toLowerCase()}...`}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>
          <ScrollArea className="max-h-[250px]">
            {filteredSkills.length > 0 ? (
              <div className="p-2 flex flex-wrap gap-1.5">
                {filteredSkills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => {
                      onAdd(skill.id);
                      setSearch("");
                      setIsOpen(false);
                    }}
                    className="px-2 py-1 rounded text-xs border transition-colors hover:opacity-80 bg-muted text-foreground/80 border-border"
                  >
                    {skill.nome}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {search
                  ? "Nenhum resultado encontrado"
                  : "Todos já foram selecionados"}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Selected badges (BELOW the selector) */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-md bg-muted/50 border border-border">
          {selectedSkills.map((skill) => (
            <span
              key={skill.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm border bg-muted text-foreground/80 border-border"
            >
              {skill.nome}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onRemove(skill.id)}
                  className="ml-1 hover:bg-background/20 rounded p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main component ---

export function ProjectSkillsSelect({
  selectedSkillIds,
  onSkillsChange,
  disabled,
}: ProjectSkillsSelectProps) {
  const { availableSkills, loading } = useAvailableSkills();

  const addSkill = (id: string) => {
    onSkillsChange([...selectedSkillIds, id]);
  };

  const removeSkill = (id: string) => {
    onSkillsChange(selectedSkillIds.filter((s) => s !== id));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CategorySelector
        label="Habilidades"
        categoria="habilidades"
        allSkills={availableSkills}
        selectedSkillIds={selectedSkillIds}
        onAdd={addSkill}
        onRemove={removeSkill}
        disabled={disabled}
        loading={loading}
      />
      <CategorySelector
        label="Softwares"
        categoria="softwares"
        allSkills={availableSkills}
        selectedSkillIds={selectedSkillIds}
        onAdd={addSkill}
        onRemove={removeSkill}
        disabled={disabled}
        loading={loading}
      />
    </div>
  );
}
