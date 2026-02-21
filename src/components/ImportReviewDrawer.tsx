import { useState, useEffect, KeyboardEvent } from "react";
import { Briefcase, GraduationCap, Wrench, Check, X, Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatBrazilianDate, parseToIsoDate } from "@/utils/dateFormat";

// --- Types ---

export interface ReviewExperience {
  company: string;
  role: string;
  start_date: string;
  end_date: string | null;
  location: string;
  description: string;
}

export interface ReviewEducation {
  institution: string;
  degree: string;
  field: string;
  start_year: string;
  end_year: string | null;
}

export interface ReviewedData {
  experiences: ReviewExperience[];
  education: ReviewEducation[];
  skills: string[];
}

interface ImportReviewDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ReviewedData) => void;
  extractedData?: {
    experiences?: ReviewExperience[];
    education?: ReviewEducation[];
    skills?: string[];
  };
  rawSectionText: string;
}

// --- ExperienceReviewCard ---

function ExperienceReviewCard({
  experience,
  rawSectionText,
  onUpdate,
}: {
  experience: ReviewExperience;
  rawSectionText: string;
  onUpdate: (updated: ReviewExperience) => void;
}) {
  const [descSource, setDescSource] = useState<"ai" | "raw">("ai");

  const handleChange = (field: keyof ReviewExperience, value: string) => {
    if (field === "start_date" || field === "end_date") {
      const iso = parseToIsoDate(value);
      onUpdate({ ...experience, [field]: iso });
    } else {
      onUpdate({ ...experience, [field]: value });
    }
  };

  const handleDescSourceChange = (value: string) => {
    setDescSource(value as "ai" | "raw");
    if (value === "raw") {
      onUpdate({ ...experience, description: rawSectionText });
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {experience.role || "Cargo"} — {experience.company || "Empresa"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Empresa</Label>
            <Input
              value={experience.company}
              onChange={(e) => handleChange("company", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Cargo</Label>
            <Input
              value={experience.role}
              onChange={(e) => handleChange("role", e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Data de início</Label>
            <Input
              placeholder="MM/YYYY"
              defaultValue={formatBrazilianDate(experience.start_date)}
              onBlur={(e) => handleChange("start_date", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Data de término</Label>
            <Input
              placeholder="MM/YYYY"
              defaultValue={formatBrazilianDate(experience.end_date)}
              onBlur={(e) => handleChange("end_date", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Localização</Label>
          <Input
            value={experience.location || ""}
            onChange={(e) => handleChange("location", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Descrição</Label>
          <RadioGroup
            value={descSource}
            onValueChange={handleDescSourceChange}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="ai" id={`ai-${experience.company}-${experience.role}`} />
              <Label htmlFor={`ai-${experience.company}-${experience.role}`} className="text-xs cursor-pointer">
                Dados extraídos pela IA
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="raw" id={`raw-${experience.company}-${experience.role}`} />
              <Label htmlFor={`raw-${experience.company}-${experience.role}`} className="text-xs cursor-pointer">
                Texto original do PDF
              </Label>
            </div>
          </RadioGroup>
          <Textarea
            rows={6}
            value={experience.description || ""}
            onChange={(e) => onUpdate({ ...experience, description: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// --- EducationReviewCard ---

function EducationReviewCard({
  education,
  onUpdate,
}: {
  education: ReviewEducation;
  onUpdate: (updated: ReviewEducation) => void;
}) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {education.degree || "Grau"} — {education.institution || "Instituição"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Instituição</Label>
          <Input
            value={education.institution}
            onChange={(e) => onUpdate({ ...education, institution: e.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Grau</Label>
            <Input
              value={education.degree}
              onChange={(e) => onUpdate({ ...education, degree: e.target.value })}
              placeholder="Ex: Graduação, Pós-graduação"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Curso / Área</Label>
            <Input
              value={education.field}
              onChange={(e) => onUpdate({ ...education, field: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Ano de início</Label>
            <Input
              placeholder="YYYY"
              value={education.start_year || ""}
              onChange={(e) => onUpdate({ ...education, start_year: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Ano de término</Label>
            <Input
              placeholder="YYYY"
              value={education.end_year || ""}
              onChange={(e) => onUpdate({ ...education, end_year: e.target.value || null })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Main Drawer ---

export function ImportReviewDrawer({
  open,
  onClose,
  onSave,
  extractedData,
  rawSectionText,
}: ImportReviewDrawerProps) {
  const [experiences, setExperiences] = useState<ReviewExperience[]>([]);
  const [education, setEducation] = useState<ReviewEducation[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (extractedData) {
      setExperiences(extractedData.experiences ?? []);
      setEducation(extractedData.education ?? []);
      setSkills(extractedData.skills ?? []);
    }
  }, [extractedData]);

  const updateExperience = (index: number, updated: ReviewExperience) => {
    setExperiences((prev) => prev.map((exp, i) => (i === index ? updated : exp)));
  };

  const updateEducation = (index: number, updated: ReviewEducation) => {
    setEducation((prev) => prev.map((edu, i) => (i === index ? updated : edu)));
  };

  const addSkill = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    setSkills((prev) => [...prev, trimmed]);
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(newSkill);
    }
  };

  const handleSave = () => {
    onSave({ experiences, education, skills });
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="sm:max-w-3xl w-full h-full flex flex-col p-0 gap-0"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-border shrink-0">
          <SheetHeader>
            <SheetTitle className="font-display text-xl font-bold">
              Revisão da Importação
            </SheetTitle>
            <SheetDescription>
              Revise e edite os dados extraídos antes de salvar no seu perfil.
            </SheetDescription>
          </SheetHeader>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <Card className="border-border">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{experiences.length}</p>
                <p className="text-xs text-muted-foreground">Experiências</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{education.length}</p>
                <p className="text-xs text-muted-foreground">Formações</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{skills.length}</p>
                <p className="text-xs text-muted-foreground">Skills</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Experiences */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 font-sans font-semibold text-lg text-foreground">
              <Briefcase className="h-5 w-5 text-primary" />
              Experiências Profissionais
            </h3>
            {experiences.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma experiência extraída.</p>
            ) : (
              experiences.map((exp, i) => (
                <ExperienceReviewCard
                  key={i}
                  experience={exp}
                  rawSectionText={rawSectionText}
                  onUpdate={(updated) => updateExperience(i, updated)}
                />
              ))
            )}
          </section>

          {/* Education */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 font-sans font-semibold text-lg text-foreground">
              <GraduationCap className="h-5 w-5 text-primary" />
              Formação Acadêmica
            </h3>
            {education.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma formação extraída.</p>
            ) : (
              education.map((edu, i) => (
                <EducationReviewCard
                  key={i}
                  education={edu}
                  onUpdate={(updated) => updateEducation(i, updated)}
                />
              ))
            )}
          </section>

          {/* Skills */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 font-sans font-semibold text-lg text-foreground">
              <Wrench className="h-5 w-5 text-primary" />
              Skills
            </h3>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-sm py-1 px-3">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 hover:text-destructive focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Adicionar skill..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => addSkill(newSkill)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border shrink-0 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} className="w-full sm:w-auto">
            <Check className="h-4 w-4" />
            Confirmar e Salvar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
