import { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export function SkillModal({ open, onOpenChange, editingSkill, existingSkillIds, onSave }: SkillModalProps) {
  const { availableSkills } = useAvailableSkills();
  const [selectedSkillId, setSelectedSkillId] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<NivelHabilidade>("intermediario");
  const [activeTab, setActiveTab] = useState<CategoriaHabilidade>("habilidades");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!editingSkill;

  const selectedSkill = availableSkills.find((s) => s.id === selectedSkillId);

  const filteredSkills = availableSkills
    .filter((s) => s.categoria === activeTab)
    .filter((s) => s.nome.toLowerCase().includes(searchQuery.toLowerCase()));

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
      setError(null);
      setListOpen(false);
      setSearchQuery("");
    }
  }, [open, editingSkill, availableSkills]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as CategoriaHabilidade);
    setSelectedSkillId("");
    setSearchQuery("");
    setError(null);
  };

  const handleToggleList = () => {
    if (isEditMode) return;
    const next = !listOpen;
    setListOpen(next);
    if (next) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  };

  const handleSelectSkill = (skillId: string) => {
    setSelectedSkillId(skillId);
    setListOpen(false);
    setSearchQuery("");
    setError(null);
  };

  const handleClearSkill = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSkillId("");
    setSearchQuery("");
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
      <DialogContent className="flex flex-col sm:max-w-[425px] max-h-[90dvh] overflow-y-auto">
        <DialogHeader className="shrink-0">
          <DialogTitle>{isEditMode ? "Editar Habilidade" : "Adicionar Habilidade"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Atualize o nível de proficiência desta habilidade."
              : "Selecione uma habilidade ou software e seu nível de proficiência."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Seleção de habilidade */}
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

            {/* Trigger */}
            <button
              type="button"
              onClick={handleToggleList}
              disabled={isEditMode}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-md border border-input bg-background text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isEditMode && "opacity-50 cursor-not-allowed",
                listOpen && "border-ring ring-1 ring-ring",
              )}
            >
              <span className={cn(!selectedSkill && "text-muted-foreground")}>
                {selectedSkill
                  ? selectedSkill.nome
                  : activeTab === "habilidades"
                    ? "Selecionar habilidade..."
                    : "Selecionar software..."}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                {selectedSkill && !isEditMode && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={handleClearSkill}
                    onKeyDown={(e) => e.key === "Enter" && handleClearSkill(e as any)}
                    className="p-0.5 rounded hover:bg-muted"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    listOpen && "rotate-180",
                  )}
                />
              </div>
            </button>

            {/* Lista inline expansível */}
            {listOpen && (
              <div className="border border-input rounded-md overflow-hidden">
                {/* Campo de busca */}
                <div className="flex items-center gap-2 px-3 py-2 border-b border-input">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Lista de itens */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredSkills.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-center text-muted-foreground">
                      Nenhuma habilidade encontrada.
                    </p>
                  ) : (
                    filteredSkills.map((skill) => {
                      const isAlreadyAdded = existingSkillIds.includes(skill.id);
                      const isSelected = selectedSkillId === skill.id;
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          disabled={isAlreadyAdded}
                          onClick={() => !isAlreadyAdded && handleSelectSkill(skill.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors",
                            isAlreadyAdded
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-accent hover:text-accent-foreground cursor-pointer",
                            isSelected && "bg-accent",
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <Check className={cn("h-4 w-4 shrink-0", isSelected ? "opacity-100" : "opacity-0")} />
                            {skill.nome}
                          </span>
                          {isAlreadyAdded && <span className="text-xs text-muted-foreground">Já adicionada</span>}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          {/* Nível de Proficiência */}
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

        <DialogFooter className="shrink-0 border-t pt-4">
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
