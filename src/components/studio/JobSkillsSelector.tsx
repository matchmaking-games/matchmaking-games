import { useState, useMemo } from "react";
import { X, Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAvailableSkills, type Habilidade } from "@/hooks/useAvailableSkills";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type CategoriaHabilidade = Database["public"]["Enums"]["categoria_habilidade"];

interface JobSkillsSelectorProps {
  label: React.ReactNode;
  helperText?: string;
  selectedSkillIds: string[];
  onSkillsChange: (skillIds: string[]) => void;
  excludeSkillIds?: string[];
  disabled?: boolean;
  maxSkills?: number;
  /** Filter by category */
  categoria?: CategoriaHabilidade;
}

function getSkillBadgeClasses(categoria: Habilidade["categoria"]): string {
  const map: Record<string, string> = {
    habilidades: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    softwares: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  };
  return map[categoria] || "bg-muted text-muted-foreground border-border";
}

export function JobSkillsSelector({
  label,
  helperText,
  selectedSkillIds,
  onSkillsChange,
  excludeSkillIds = [],
  disabled,
  maxSkills = 15,
  categoria,
}: JobSkillsSelectorProps) {
  const { availableSkills, loading } = useAvailableSkills();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Get selected skills filtered by this category
  const selectedSkills = useMemo(() => {
    const skills = availableSkills.filter((s) => selectedSkillIds.includes(s.id));
    if (categoria) return skills.filter((s) => s.categoria === categoria);
    return skills;
  }, [availableSkills, selectedSkillIds, categoria]);

  // Filter available skills
  const filteredSkills = useMemo(() => {
    return availableSkills.filter(
      (skill) =>
        !selectedSkillIds.includes(skill.id) &&
        !excludeSkillIds.includes(skill.id) &&
        (!categoria || skill.categoria === categoria) &&
        skill.nome.toLowerCase().includes(search.toLowerCase()),
    );
  }, [availableSkills, selectedSkillIds, excludeSkillIds, search, categoria]);

  const addSkill = (skillId: string) => {
    if (selectedSkillIds.length >= maxSkills) return;
    onSkillsChange([...selectedSkillIds, skillId]);
    setSearch("");
  };

  const removeSkill = (skillId: string) => {
    onSkillsChange(selectedSkillIds.filter((id) => id !== skillId));
  };

  const isMaxReached = selectedSkillIds.length >= maxSkills;

  const placeholderText = categoria === "softwares" ? "Buscar software..." : "Buscar habilidade...";

  return (
    <div className="space-y-2">
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
                ? `Máximo de ${maxSkills}`
                : categoria === "softwares"
                  ? "Softwares"
                  : "Habilidades"}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          {/* Search input */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={placeholderText}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>

          {/* Skills list */}
          <ScrollArea className="h-[200px]">
            {filteredSkills.length > 0 ? (
              <div className="p-2">
                <div className="flex flex-wrap gap-1.5">
                  {filteredSkills.map((skill) => (
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
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {search ? "Nenhuma encontrada" : "Todas já selecionadas"}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Selected skills badges */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
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
