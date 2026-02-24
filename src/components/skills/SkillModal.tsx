import { useState, useEffect } from "react";
import { z } from "zod";
import { Check, ChevronsUpDown } from "lucide-react";
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
type CategoriaHabilidade = Database["public"]["Enums"]["categoria_habilidade"];

interface SkillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSkill: UserSkill | null;
  existingSkillIds: string[];
  onSave: (habilidadeId: string, nivel: NivelHabilidade) => Promise<void>;
}

const levelOptions = [
  { value: "basico", label: "Básico", description: "Conhecimento básico, ainda aprendendo" },
  { value: "intermediario", label: "Intermediário", description: "Uso frequentemente, confortável" },
  { value: "avancado", label: "Avançado", description: "Domínio profissional, posso ensinar" },
  { value: "expert", label: "Expert", description: "Referência na área, anos de experiência" },
] as const;

interface CategoryComboboxProps {
  label: string;
  placeholder: string;
  skills: Habilidade[];
  selectedId: string;
  onSelect: (id: string) => void;
  existingSkillIds: string[];
  isEditMode: boolean;
  loading: boolean;
}

function CategoryCombobox({
  label,
  placeholder,
  skills,
  selectedId,
  onSelect,
  existingSkillIds,
  isEditMode,
  loading,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = skills.find((s) => s.id === selectedId);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isEditMode || loading}
          >
            <span className="truncate">
              {selected ? selected.nome : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar..." />
            <CommandList>
              <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
              <CommandGroup>
                {skills.map((skill) => {
                  const isDisabled = !isEditMode && existingSkillIds.includes(skill.id);
                  return (
                    <CommandItem
                      key={skill.id}
                      value={skill.nome}
                      disabled={isDisabled}
                      onSelect={() => {
                        if (!isDisabled) {
                          onSelect(skill.id);
                          setOpen(false);
                        }
                      }}
                      className={cn(isDisabled && "opacity-50")}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedId === skill.id ? "opacity-100" : "opacity-0"
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
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!editingSkill;

  const habilidadeSkills = availableSkills.filter((s) => s.categoria === "habilidades");
  const softwareSkills = availableSkills.filter((s) => s.categoria === "softwares");

  // Determine which category the selected skill belongs to
  const selectedSkill = availableSkills.find((s) => s.id === selectedSkillId);
  const selectedCategory = selectedSkill?.categoria;

  // Separate IDs per combobox based on selected skill's category
  const habilidadeSelectedId = selectedCategory === "habilidades" ? selectedSkillId : "";
  const softwareSelectedId = selectedCategory === "softwares" ? selectedSkillId : "";

  useEffect(() => {
    if (open) {
      if (editingSkill) {
        setSelectedSkillId(editingSkill.habilidade.id);
        setSelectedLevel(editingSkill.nivel);
      } else {
        setSelectedSkillId("");
        setSelectedLevel("intermediario");
      }
      setError(null);
    }
  }, [open, editingSkill]);

  const handleSelectSkill = (id: string) => {
    setSelectedSkillId(id);
    setError(null);
  };

  const handleClearAndSelect = (id: string, categoria: CategoriaHabilidade) => {
    // If user selects from the other category, clear previous selection
    if (selectedCategory && selectedCategory !== categoria) {
      setSelectedSkillId(id);
    } else {
      setSelectedSkillId(id);
    }
    setError(null);
  };

  const handleSave = async () => {
    if (!selectedSkillId) {
      setError("Selecione pelo menos uma habilidade ou software.");
      return;
    }

    if (!isEditMode && existingSkillIds.includes(selectedSkillId)) {
      setError("Você já adicionou esta habilidade.");
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
              : "Selecione uma habilidade ou software e seu nível de proficiência."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 overflow-y-auto">
          {/* Two category inputs side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CategoryCombobox
              label="Habilidade"
              placeholder="Selecione..."
              skills={habilidadeSkills}
              selectedId={habilidadeSelectedId}
              onSelect={(id) => handleClearAndSelect(id, "habilidades")}
              existingSkillIds={existingSkillIds}
              isEditMode={isEditMode && selectedCategory === "softwares"}
              loading={loadingSkills}
            />
            <CategoryCombobox
              label="Software"
              placeholder="Selecione..."
              skills={softwareSkills}
              selectedId={softwareSelectedId}
              onSelect={(id) => handleClearAndSelect(id, "softwares")}
              existingSkillIds={existingSkillIds}
              isEditMode={isEditMode && selectedCategory === "habilidades"}
              loading={loadingSkills}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}

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
