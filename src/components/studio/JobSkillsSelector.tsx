import { useState, useMemo } from "react";
import { X, Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAvailableSkills, type Habilidade } from "@/hooks/useAvailableSkills";
import { cn } from "@/lib/utils";

interface JobSkillsSelectorProps {
  label: string;
  helperText?: string;
  selectedSkillIds: string[];
  onSkillsChange: (skillIds: string[]) => void;
  excludeSkillIds?: string[];
  disabled?: boolean;
  maxSkills?: number;
}

function getSkillBadgeClasses(categoria: Habilidade["categoria"]): string {
  const map: Record<string, string> = {
    engine: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    linguagem: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    ferramenta: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    soft_skill: "bg-green-500/20 text-green-300 border-green-500/30",
  };
  return map[categoria] || "bg-muted text-muted-foreground border-border";
}

function getCategoryLabel(categoria: Habilidade["categoria"]): string {
  const map: Record<string, string> = {
    engine: "Engine",
    linguagem: "Linguagem",
    ferramenta: "Ferramenta",
    soft_skill: "Soft Skill",
  };
  return map[categoria] || categoria;
}

// Order categories for display
const categoryOrder: Habilidade["categoria"][] = ["engine", "linguagem", "ferramenta", "soft_skill"];

export function JobSkillsSelector({
  label,
  helperText,
  selectedSkillIds,
  onSkillsChange,
  excludeSkillIds = [],
  disabled,
  maxSkills = 15,
}: JobSkillsSelectorProps) {
  const { availableSkills, loading } = useAvailableSkills();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Get selected skills with full data
  const selectedSkills = useMemo(() => {
    return availableSkills.filter((s) => selectedSkillIds.includes(s.id));
  }, [availableSkills, selectedSkillIds]);

  // Filter and group available skills (excluding already selected and excluded)
  const filteredSkills = useMemo(() => {
    const notSelected = availableSkills.filter(
      (skill) =>
        !selectedSkillIds.includes(skill.id) &&
        !excludeSkillIds.includes(skill.id) &&
        skill.nome.toLowerCase().includes(search.toLowerCase()),
    );

    // Group by category
    const grouped: Record<string, Habilidade[]> = {};
    for (const skill of notSelected) {
      if (!grouped[skill.categoria]) {
        grouped[skill.categoria] = [];
      }
      grouped[skill.categoria].push(skill);
    }

    return grouped;
  }, [availableSkills, selectedSkillIds, excludeSkillIds, search]);

  const addSkill = (skillId: string) => {
    if (selectedSkillIds.length >= maxSkills) return;
    onSkillsChange([...selectedSkillIds, skillId]);
    setSearch("");
  };

  const removeSkill = (skillId: string) => {
    onSkillsChange(selectedSkillIds.filter((id) => id !== skillId));
  };

  const hasAvailableSkills = Object.values(filteredSkills).some((arr) => arr.length > 0);
  const isMaxReached = selectedSkillIds.length >= maxSkills;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>

      {/* Helper text */}
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}

      {/* Skill selector popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            disabled={disabled || loading || isMaxReached}
            className="w-full justify-between text-muted-foreground font-normal"
          >
            {loading
              ? "Carregando..."
              : isMaxReached
                ? `Máximo de ${maxSkills} habilidades`
                : "Adicionar habilidade..."}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          {/* Search input */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar habilidade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>

          {/* Skills list */}
          <ScrollArea className="max-h-[250px]">
            {hasAvailableSkills ? (
              <div className="p-2 space-y-3">
                {categoryOrder.map((categoria) => {
                  const skills = filteredSkills[categoria];
                  if (!skills || skills.length === 0) return null;

                  return (
                    <div key={categoria}>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5 px-1">
                        {getCategoryLabel(categoria)}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map((skill) => (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => {
                              addSkill(skill.id);
                              setIsOpen(false);
                            }}
                            className={cn(
                              "px-2 py-1 rounded text-xs border transition-colors",
                              "hover:opacity-80",
                              getSkillBadgeClasses(skill.categoria),
                            )}
                          >
                            {skill.nome}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {search ? "Nenhuma habilidade encontrada" : "Todas as habilidades já foram selecionadas"}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Selected skills badges */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-md bg-muted/50 border border-border">
          {selectedSkills.map((skill) => (
            <span
              key={skill.id}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm border",
                getSkillBadgeClasses(skill.categoria),
              )}
            >
              {skill.nome}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeSkill(skill.id)}
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
