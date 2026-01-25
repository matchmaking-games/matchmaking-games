import { useState, useEffect } from "react";
import { z } from "zod";
import { Check, ChevronsUpDown, Gamepad2, Code, Wrench, Brain } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAvailableSkills, type Habilidade } from "@/hooks/useAvailableSkills";
import type { UserSkill } from "@/hooks/useSkills";
import type { Database } from "@/integrations/supabase/types";

type NivelHabilidade = Database["public"]["Enums"]["nivel_habilidade"];

interface SkillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSkill: UserSkill | null;
  existingSkillIds: string[];
  onSave: (habilidadeId: string, nivel: NivelHabilidade) => Promise<void>;
}

const skillFormSchema = z.object({
  habilidade_id: z.string().uuid("Selecione uma habilidade"),
  nivel: z.enum(["basico", "intermediario", "avancado", "expert"]),
});

const categoryConfig = {
  engine: { label: "Engines", icon: Gamepad2 },
  linguagem: { label: "Linguagens", icon: Code },
  ferramenta: { label: "Ferramentas", icon: Wrench },
  soft_skill: { label: "Soft Skills", icon: Brain },
};

const levelOptions = [
  { value: "basico", label: "Básico", description: "Conhecimento básico, ainda aprendendo" },
  { value: "intermediario", label: "Intermediário", description: "Uso frequentemente, confortável" },
  { value: "avancado", label: "Avançado", description: "Domínio profissional, posso ensinar" },
  { value: "expert", label: "Expert", description: "Referência na área, anos de experiência" },
] as const;

export function SkillModal({
  open,
  onOpenChange,
  editingSkill,
  existingSkillIds,
  onSave,
}: SkillModalProps) {
  const { availableSkills, loading: loadingSkills } = useAvailableSkills();
  const [selectedSkillId, setSelectedSkillId] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<NivelHabilidade>("intermediario");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ habilidade_id?: string; nivel?: string }>({});

  const isEditMode = !!editingSkill;

  // Reset form when modal opens/closes or editing skill changes
  useEffect(() => {
    if (open) {
      if (editingSkill) {
        setSelectedSkillId(editingSkill.habilidade.id);
        setSelectedLevel(editingSkill.nivel);
      } else {
        setSelectedSkillId("");
        setSelectedLevel("intermediario");
      }
      setErrors({});
    }
  }, [open, editingSkill]);

  // Group skills by category
  const groupedSkills = availableSkills.reduce((acc, skill) => {
    if (!acc[skill.categoria]) {
      acc[skill.categoria] = [];
    }
    acc[skill.categoria].push(skill);
    return acc;
  }, {} as Record<string, Habilidade[]>);

  const selectedSkill = availableSkills.find((s) => s.id === selectedSkillId);

  const handleSave = async () => {
    // Validate
    const result = skillFormSchema.safeParse({
      habilidade_id: selectedSkillId,
      nivel: selectedLevel,
    });

    if (!result.success) {
      const fieldErrors: { habilidade_id?: string; nivel?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field as keyof typeof fieldErrors] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Check for duplicates (only in create mode)
    if (!isEditMode && existingSkillIds.includes(selectedSkillId)) {
      setErrors({ habilidade_id: "Você já adicionou esta habilidade" });
      return;
    }

    try {
      setSaving(true);
      await onSave(selectedSkillId, selectedLevel);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving skill:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Habilidade" : "Adicionar Habilidade"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Atualize o nível de proficiência desta habilidade."
              : "Selecione uma habilidade e seu nível de proficiência."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Skill Combobox */}
          <div className="space-y-2">
            <Label>Habilidade</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between"
                  disabled={isEditMode || loadingSkills}
                >
                  {selectedSkill ? selectedSkill.nome : "Selecione uma habilidade..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder="Buscar habilidade..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma habilidade encontrada.</CommandEmpty>
                    {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map(
                      (category) => {
                        const skills = groupedSkills[category] || [];
                        if (skills.length === 0) return null;

                        const config = categoryConfig[category];
                        const CategoryIcon = config.icon;

                        return (
                          <CommandGroup
                            key={category}
                            heading={
                              <span className="flex items-center gap-2">
                                <CategoryIcon className="h-4 w-4" />
                                {config.label}
                              </span>
                            }
                          >
                            {skills.map((skill) => {
                              const isDisabled =
                                !isEditMode && existingSkillIds.includes(skill.id);

                              return (
                                <CommandItem
                                  key={skill.id}
                                  value={skill.nome}
                                  disabled={isDisabled}
                                  onSelect={() => {
                                    if (!isDisabled) {
                                      setSelectedSkillId(skill.id);
                                      setComboboxOpen(false);
                                      setErrors((prev) => ({ ...prev, habilidade_id: undefined }));
                                    }
                                  }}
                                  className={cn(isDisabled && "opacity-50")}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedSkillId === skill.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {skill.nome}
                                  {isDisabled && (
                                    <span className="ml-auto text-xs text-muted-foreground">
                                      Já adicionada
                                    </span>
                                  )}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        );
                      }
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.habilidade_id && (
              <p className="text-sm text-destructive">{errors.habilidade_id}</p>
            )}
          </div>

          {/* Level Radio Group */}
          <div className="space-y-3">
            <Label>Nível de Proficiência</Label>
            <RadioGroup
              value={selectedLevel}
              onValueChange={(value) => setSelectedLevel(value as NivelHabilidade)}
              className="space-y-2"
            >
              {levelOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-start space-x-3 p-3 rounded-md border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedLevel(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
                  <div className="space-y-1">
                    <Label htmlFor={option.value} className="font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
            {errors.nivel && <p className="text-sm text-destructive">{errors.nivel}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
