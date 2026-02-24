import { useState, useEffect, useRef } from "react";
import { Check } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAvailableSkills } from "@/hooks/useAvailableSkills";
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
  const [activeTab, setActiveTab] = useState<CategoriaHabilidade>("habilidades");
  const [searchValue, setSearchValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!editingSkill;

  const filteredSkills = availableSkills.filter((s) => s.categoria === activeTab);
  const selectedSkill = availableSkills.find((s) => s.id === selectedSkillId);

  useEffect(() => {
    if (open) {
      if (editingSkill) {
        setSelectedSkillId(editingSkill.habilidade.id);
        setSelectedLevel(editingSkill.nivel);
        const cat = availableSkills.find((s) => s.id === editingSkill.habilidade.id)?.categoria;
        if (cat) setActiveTab(cat);
      } else {
        setSelectedSkillId("");
        setSelectedLevel("intermediario");
        setActiveTab("habilidades");
      }
      setSearchValue("");
      setError(null);
    }
  }, [open, editingSkill, availableSkills]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as CategoriaHabilidade);
    setSearchValue("");
  };

  const handleSelect = (id: string) => {
    setSelectedSkillId(id);
    setError(null);
  };

  const handleSave = async () => {
    if (!selectedSkillId) {
      setError("Selecione uma habilidade ou software.");
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
      <DialogContent className="flex flex-col h-[90dvh] sm:h-[85vh] sm:max-w-[425px] overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {isEditMode ? "Editar Habilidade" : "Adicionar Habilidade"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Atualize o nível de proficiência desta habilidade."
              : "Selecione uma habilidade ou software e seu nível de proficiência."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea type="always" className="flex-1 min-h-0">
          <div className="space-y-6 py-4 pr-4">
          {/* Tabs + Command selector */}
          <div className="space-y-2">
            <Label>Habilidade ou Software</Label>

            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="w-full">
                <TabsTrigger value="habilidades" className="flex-1" disabled={isEditMode}>
                  Habilidades
                </TabsTrigger>
                <TabsTrigger value="softwares" className="flex-1" disabled={isEditMode}>
                  Softwares
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="rounded-md border border-border overflow-hidden">
              <Command shouldFilter={true}>
                <CommandInput
                  ref={commandInputRef}
                  placeholder="Buscar..."
                  value={searchValue}
                  onValueChange={setSearchValue}
                  disabled={isEditMode}
                />
                {!isEditMode && (
                  <ScrollArea className="h-[180px]">
                    <CommandList className="max-h-none overflow-visible">
                      <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
                      <CommandGroup>
                        {filteredSkills.map((skill) => {
                          const isAlreadyAdded = existingSkillIds.includes(skill.id);
                          return (
                            <CommandItem
                              key={skill.id}
                              value={skill.nome}
                              disabled={isAlreadyAdded}
                              onSelect={() => {
                                if (!isAlreadyAdded) handleSelect(skill.id);
                              }}
                              className={cn(isAlreadyAdded && "opacity-50")}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 shrink-0",
                                  selectedSkillId === skill.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {skill.nome}
                              {isAlreadyAdded && (
                                <span className="ml-auto text-xs text-muted-foreground">
                                  Já adicionada
                                </span>
                              )}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </ScrollArea>
                )}
                {isEditMode && selectedSkill && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {selectedSkill.nome}
                  </div>
                )}
              </Command>
            </div>

            {selectedSkill && !isEditMode && (
              <p className="text-sm text-muted-foreground">
                Selecionado: <span className="text-foreground font-medium">{selectedSkill.nome}</span>
              </p>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
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
          </div>
          </div>
        </ScrollArea>

        <DialogFooter className="shrink-0 border-t p-6 pt-4">
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
