import { useState, useRef } from "react";
import { Briefcase, GraduationCap, Check, Upload, Loader2, AlertTriangle, X as XIcon } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { useImportLinkedIn } from "@/hooks/useImportLinkedIn";
import { useImportLimit } from "@/hooks/useImportLimit";
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
}

interface ImportReviewDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ReviewedData) => void;
}

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const DESKTOP_IMG = "https://njyoimhjfqtygnlccjzq.supabase.co/storage/v1/object/public/public-images/Importacao%20FAQ/Captura%20de%20tela%202026-02-21%20230438.png";
const MOBILE_IMG = "https://njyoimhjfqtygnlccjzq.supabase.co/storage/v1/object/public/public-images/Importacao%20FAQ/WhatsApp%20Image%202026-02-21%20at%2023.04.10.jpeg";

// --- ExperienceReviewCard (simplified) ---

function ExperienceReviewCard({
  experience,
  onUpdate,
}: {
  experience: ReviewExperience;
  onUpdate: (updated: ReviewExperience) => void;
}) {
  const [startDateDisplay, setStartDateDisplay] = useState(
    formatBrazilianDate(experience.start_date)
  );
  const [endDateDisplay, setEndDateDisplay] = useState(
    formatBrazilianDate(experience.end_date)
  );

  const handleChange = (field: keyof ReviewExperience, value: string) => {
    if (field === "start_date" || field === "end_date") {
      const iso = parseToIsoDate(value);
      onUpdate({ ...experience, [field]: iso });
    } else {
      onUpdate({ ...experience, [field]: value });
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
              value={startDateDisplay}
              onChange={(e) => {
                setStartDateDisplay(e.target.value);
                handleChange("start_date", e.target.value);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Data de término</Label>
            <Input
              placeholder="MM/YYYY"
              value={endDateDisplay}
              onChange={(e) => {
                setEndDateDisplay(e.target.value);
                handleChange("end_date", e.target.value);
              }}
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

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Descrição</Label>
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
}: ImportReviewDrawerProps) {
  const [step, setStep] = useState<"instructions" | "review">("instructions");
  const [experiences, setExperiences] = useState<ReviewExperience[]>([]);
  const [education, setEducation] = useState<ReviewEducation[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadPdf, isProcessing, progress, errorRef } = useImportLinkedIn();
  const { remainingImports, canImport, isLoading: isLoadingLimit } = useImportLimit();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({ title: "Formato inválido", description: "Apenas arquivos PDF são aceitos.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast({ title: "Arquivo muito grande", description: `O limite é ${MAX_SIZE_MB}MB.`, variant: "destructive" });
      return;
    }

    const result = await uploadPdf(file);
    if (result) {
      setExperiences(result.extracted_data?.experiences as ReviewExperience[] ?? []);
      setEducation(result.extracted_data?.education as ReviewEducation[] ?? []);
      setStep("review");
    } else {
      toast({ title: "Erro na importação", description: errorRef.current || "Erro desconhecido.", variant: "destructive" });
    }
  };

  const handleOpenChange = (o: boolean) => {
    if (!o && !isProcessing) {
      handleClose();
    }
  };

  const handleClose = () => {
    setStep("instructions");
    setExperiences([]);
    setEducation([]);
    onClose();
  };

  const updateExperience = (index: number, updated: ReviewExperience) => {
    setExperiences((prev) => prev.map((exp, i) => (i === index ? updated : exp)));
  };

  const updateEducation = (index: number, updated: ReviewEducation) => {
    setEducation((prev) => prev.map((edu, i) => (i === index ? updated : edu)));
  };

  const handleSave = () => {
    onSave({ experiences, education });
  };

  const usedImports = 3 - remainingImports;
  const limitReached = !canImport;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-3xl w-full h-full flex flex-col p-0 gap-0"
      >
        <input
          type="file"
          accept=".pdf"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Selecionar PDF do LinkedIn"
        />

        {step === "instructions" ? (
          <>
            {/* Header */}
            <div className="p-6 pb-4 border-b border-border shrink-0">
              <SheetHeader>
                <SheetTitle className="font-display text-xl font-bold">
                  Importar do LinkedIn
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Instruções para importação do currículo do LinkedIn
                </SheetDescription>
              </SheetHeader>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Warning alert */}
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Ao confirmar a importação, todas as suas experiências profissionais e formações acadêmicas salvas serão apagadas e substituídas pelos dados extraídos do PDF. Esta ação é permanente. Um backup automático será criado antes da importação.
                </AlertDescription>
              </Alert>

              {/* Replaced / Maintained blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 space-y-2">
                  <p className="font-semibold text-sm text-foreground">Serão substituídos:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Experiências profissionais</li>
                    <li>Formação acadêmica</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-primary/20 bg-primary/10 p-4 space-y-2">
                  <p className="font-semibold text-sm text-foreground">Serão mantidos:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Informações básicas do perfil</li>
                    <li>Seus projetos</li>
                    <li>Suas configurações de conta</li>
                  </ul>
                </div>
              </div>

              {/* Recommendation */}
              <p className="text-sm text-muted-foreground">
                Recomendamos utilizar esta função ao criar seu perfil pela primeira vez ou quando quiser atualizar completamente suas informações.
              </p>

              {/* Accordions */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="desktop">
                  <AccordionTrigger className="text-sm">
                    Como baixar o PDF a partir do desktop
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      Na página principal do seu LinkedIn, clique na sua foto de perfil ou seu nome. Logo na primeira seção, clique no botão com o ícone "..." e selecione "Salvar como PDF". Veja a imagem abaixo:
                    </p>
                    <img
                      src={DESKTOP_IMG}
                      alt="Instruções para baixar PDF no desktop"
                      className="w-full rounded-lg"
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="mobile">
                  <AccordionTrigger className="text-sm">
                    Como baixar o PDF a partir do celular
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      No celular é um pouco diferente, pois não é possível baixar diretamente pelo aplicativo. Será necessário abrir o LinkedIn no navegador do celular e selecionar a opção "Site para computador" ou algo similar. Veja a imagem abaixo:
                    </p>
                    <img
                      src={MOBILE_IMG}
                      alt="Instruções para baixar PDF no celular"
                      className="w-full rounded-lg"
                    />
                    <p>
                      Em seguida, na página principal do seu LinkedIn, clique na sua foto de perfil ou seu nome. Logo na primeira seção, clique no botão com o ícone "..." e selecione "Salvar como PDF". Veja a imagem abaixo:
                    </p>
                    <img
                      src={DESKTOP_IMG}
                      alt="Instruções para baixar PDF no desktop"
                      className="w-full rounded-lg"
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="why">
                  <AccordionTrigger className="text-sm">
                    Por que não é possível importar diretamente do LinkedIn?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    O LinkedIn tem políticas muito restritas contra a extração automática de dados, o que torna extremamente difícil e até ilegal fazer isso. Por isso, a melhor alternativa é utilizar o currículo gerado por eles. Como estamos em versão beta, utilizar o PDF do LinkedIn torna a importação mais padronizada e certeira, pois outros tipos de PDFs podem ter formatos muito diferentes e causar erros.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Import limit */}
              {!isLoadingLimit && (
                <p className={`text-sm ${limitReached ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                  {usedImports}/3 importações utilizadas este mês
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border shrink-0 flex flex-col sm:flex-row gap-2 sm:justify-end">
              {isProcessing ? (
                <div className="flex items-center gap-2 justify-center w-full py-1">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">{progress || "Processando..."}</span>
                </div>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!canImport || isLoadingLimit}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="h-4 w-4" />
                    Subir PDF
                  </Button>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Review Header */}
            <div className="p-6 pb-4 border-b border-border shrink-0">
              <SheetHeader>
                <SheetTitle className="font-display text-xl font-bold">
                  Revisão da Importação
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Revise os dados extraídos do seu currículo
                </SheetDescription>
              </SheetHeader>

              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
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
              </div>
            </div>

            {/* Review content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <p className="text-sm text-muted-foreground">
                Confira os dados extraídos abaixo. Você pode editar qualquer campo antes de salvar. Após confirmar, suas experiências e formações serão substituídas.
              </p>

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
            </div>

            {/* Review Footer */}
            <div className="p-4 border-t border-border shrink-0 flex flex-col sm:flex-row gap-2 sm:justify-end">
              <Button type="button" variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="button" onClick={handleSave} className="w-full sm:w-auto">
                <Check className="h-4 w-4" />
                Confirmar e Salvar
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
