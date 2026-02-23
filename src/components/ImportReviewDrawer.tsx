import { useState, useRef, useEffect, useCallback } from "react";
import { Briefcase, GraduationCap, Check, Upload, Loader2, AlertTriangle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { useImportLinkedIn } from "@/hooks/useImportLinkedIn";
import { useImportLimit } from "@/hooks/useImportLimit";
import { useImportSave } from "@/hooks/useImportSave";
import { useIBGELocations, type EstadoIBGE, type MunicipioIBGE } from "@/hooks/useIBGELocations";
import { formatBrazilianDate, parseToIsoDate } from "@/utils/dateFormat";

// --- Types ---

export interface ReviewExperience {
  empresa: string;
  titulo_cargo: string;
  tipo_emprego: "clt" | "pj" | "freelancer" | "estagio" | "tempo_integral";
  modalidade: "presencial" | "hibrido" | "remoto" | null;
  estado: string | null;
  cidade: string | null;
  inicio: string;
  fim: string | null;
  descricao: string;
}

export interface ReviewEducation {
  instituicao: string;
  tipo: "graduacao" | "pos" | "tecnico" | "curso" | "certificacao" | "ensino_medio" | "mestrado" | "doutorado" | "mba";
  titulo: string;
  inicio: string;
  fim: string | null;
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

const DESKTOP_IMG =
  "https://njyoimhjfqtygnlccjzq.supabase.co/storage/v1/object/public/public-images/Importacao%20FAQ/Captura%20de%20tela%202026-02-21%20230438.png";
const MOBILE_IMG =
  "https://njyoimhjfqtygnlccjzq.supabase.co/storage/v1/object/public/public-images/Importacao%20FAQ/WhatsApp%20Image%202026-02-21%20at%2023.04.10.jpeg";

const IBGE_API_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";

const TIPO_EMPREGO_OPTIONS = [
  { value: "clt", label: "CLT" },
  { value: "pj", label: "PJ" },
  { value: "freelancer", label: "Freelancer" },
  { value: "estagio", label: "Estágio" },
  { value: "tempo_integral", label: "Tempo integral" },
] as const;

const TIPO_EDUCACAO_OPTIONS = [
  { value: "graduacao", label: "Graduação" },
  { value: "pos", label: "Pós-graduação" },
  { value: "tecnico", label: "Técnico" },
  { value: "curso", label: "Curso" },
  { value: "certificacao", label: "Certificação" },
  { value: "ensino_medio", label: "Ensino médio" },
  { value: "mestrado", label: "Mestrado" },
  { value: "doutorado", label: "Doutorado" },
  { value: "mba", label: "MBA" },
] as const;

const MODALIDADE_OPTIONS = [
  { value: "presencial", label: "Presencial" },
  { value: "hibrido", label: "Híbrido" },
  { value: "remoto", label: "Remoto" },
] as const;

// --- ExperienceReviewCard ---

function ExperienceReviewCard({
  experience,
  onUpdate,
  estadosIBGE,
  validationTriggered,
}: {
  experience: ReviewExperience;
  onUpdate: (updated: ReviewExperience) => void;
  estadosIBGE: EstadoIBGE[];
  validationTriggered: boolean;
}) {
  const [startDateDisplay, setStartDateDisplay] = useState(
    experience.inicio ? formatBrazilianDate(experience.inicio) : "",
  );
  const [endDateDisplay, setEndDateDisplay] = useState(experience.fim ? formatBrazilianDate(experience.fim) : "");
  const [municipios, setMunicipios] = useState<MunicipioIBGE[]>([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  // Fetch municipalities when estado changes
  useEffect(() => {
    if (!experience.estado) {
      setMunicipios([]);
      return;
    }
    let cancelled = false;
    const fetchMunicipios = async () => {
      setLoadingMunicipios(true);
      try {
        const response = await fetch(`${IBGE_API_BASE}/estados/${experience.estado}/municipios?orderBy=nome`);
        if (!response.ok) throw new Error("Erro ao carregar municípios");
        const data: MunicipioIBGE[] = await response.json();
        if (!cancelled) {
          setMunicipios(data.sort((a, b) => a.nome.localeCompare(b.nome)));
        }
      } catch {
        if (!cancelled) setMunicipios([]);
      } finally {
        if (!cancelled) setLoadingMunicipios(false);
      }
    };
    fetchMunicipios();
    return () => {
      cancelled = true;
    };
  }, [experience.estado]);

  const handleChange = (field: keyof ReviewExperience, value: string | null) => {
    if (field === "inicio" || field === "fim") {
      const iso = parseToIsoDate(value as string);
      onUpdate({ ...experience, [field]: iso });
    } else {
      onUpdate({ ...experience, [field]: value });
    }
  };

  const handleModalidadeChange = (value: string) => {
    const modalidade = value as ReviewExperience["modalidade"];
    if (modalidade === "remoto") {
      onUpdate({ ...experience, modalidade, estado: null, cidade: null });
    } else {
      onUpdate({ ...experience, modalidade });
    }
  };

  const handleEstadoChange = (uf: string) => {
    onUpdate({ ...experience, estado: uf, cidade: null });
  };

  const handleCidadeChange = (cidade: string) => {
    onUpdate({ ...experience, cidade });
  };

  const needsLocation = experience.modalidade === "presencial" || experience.modalidade === "hibrido";

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {experience.titulo_cargo || "Cargo"} — {experience.empresa || "Empresa"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Empresa <span className="text-destructive">*</span>
            </Label>
            <Input value={experience.empresa} onChange={(e) => handleChange("empresa", e.target.value)} />
            {validationTriggered && !experience.empresa && (
              <p className="text-xs text-destructive">Preencha este campo antes de salvar</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Cargo <span className="text-destructive">*</span>
            </Label>
            <Input value={experience.titulo_cargo} onChange={(e) => handleChange("titulo_cargo", e.target.value)} />
            {validationTriggered && !experience.titulo_cargo && (
              <p className="text-xs text-destructive">Preencha este campo antes de salvar</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tipo de contrato</Label>
            <Select
              value={experience.tipo_emprego}
              onValueChange={(v) => onUpdate({ ...experience, tipo_emprego: v as ReviewExperience["tipo_emprego"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPO_EMPREGO_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Modalidade <span className="text-destructive">*</span>
            </Label>
            <Select value={experience.modalidade || ""} onValueChange={handleModalidadeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a modalidade" />
              </SelectTrigger>
              <SelectContent>
                {MODALIDADE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationTriggered && !experience.modalidade && (
              <p className="text-xs text-destructive">Selecione uma modalidade antes de salvar</p>
            )}
          </div>
        </div>

        {needsLocation && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Estado <span className="text-destructive">*</span>
              </Label>
              <Select value={experience.estado || ""} onValueChange={handleEstadoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadosIBGE.map((estado) => (
                    <SelectItem key={estado.sigla} value={estado.sigla}>
                      {estado.sigla} — {estado.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationTriggered && !experience.estado && (
                <p className="text-xs text-destructive">Selecione o estado antes de salvar</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Cidade <span className="text-destructive">*</span>
              </Label>
              <Select
                value={experience.cidade || ""}
                onValueChange={handleCidadeChange}
                disabled={!experience.estado || loadingMunicipios}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingMunicipios ? "Carregando..." : "Selecione a cidade"} />
                </SelectTrigger>
                <SelectContent>
                  {municipios.map((m) => (
                    <SelectItem key={m.id} value={m.nome}>
                      {m.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationTriggered && !experience.cidade && (
                <p className="text-xs text-destructive">Selecione a cidade antes de salvar</p>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Data de início</Label>
            <Input
              placeholder="MM/YYYY"
              value={startDateDisplay}
              onChange={(e) => {
                setStartDateDisplay(e.target.value);
                handleChange("inicio", e.target.value);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Data de término</Label>
            <Input
              placeholder="MM/YYYY ou deixe vazio"
              value={endDateDisplay}
              onChange={(e) => {
                setEndDateDisplay(e.target.value);
                handleChange("fim", e.target.value);
              }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Descrição</Label>
          <Textarea
            rows={6}
            value={experience.descricao || ""}
            onChange={(e) => onUpdate({ ...experience, descricao: e.target.value })}
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
          {education.titulo || "Curso"} — {education.instituicao || "Instituição"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Instituição</Label>
          <Input
            value={education.instituicao}
            onChange={(e) => onUpdate({ ...education, instituicao: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Tipo de formação</Label>
          <Select
            value={education.tipo}
            onValueChange={(v) => onUpdate({ ...education, tipo: v as ReviewEducation["tipo"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPO_EDUCACAO_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Título / Nome do curso</Label>
          <Input value={education.titulo} onChange={(e) => onUpdate({ ...education, titulo: e.target.value })} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Ano de início</Label>
            <Input
              placeholder="YYYY"
              value={education.inicio || ""}
              onChange={(e) => onUpdate({ ...education, inicio: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Ano de término</Label>
            <Input
              placeholder="YYYY ou deixe vazio"
              value={education.fim || ""}
              onChange={(e) => onUpdate({ ...education, fim: e.target.value || null })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Validation ---

function validateExperiences(exps: ReviewExperience[]): boolean {
  return exps.every((exp) => {
    if (!exp.empresa || !exp.titulo_cargo || !exp.modalidade) return false;
    if ((exp.modalidade === "presencial" || exp.modalidade === "hibrido") && (!exp.estado || !exp.cidade)) return false;
    return true;
  });
}

// --- Main Drawer ---

export function ImportReviewDrawer({ open, onClose, onSave }: ImportReviewDrawerProps) {
  const [step, setStep] = useState<"instructions" | "review">("instructions");
  const [experiences, setExperiences] = useState<ReviewExperience[]>([]);
  const [education, setEducation] = useState<ReviewEducation[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [validationTriggered, setValidationTriggered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadPdf, isProcessing, progress, errorRef } = useImportLinkedIn();
  const { remainingImports, canImport, isLoading: isLoadingLimit } = useImportLimit();
  const { saveImportData, isSaving } = useImportSave();
  const { estados } = useIBGELocations();

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
      // Flatten grouped experiences from Gemini into flat ReviewExperience array
      const mappedExperiences: ReviewExperience[] = [];
      const extractedExps = (result.extracted_data?.experiences as any[]) ?? [];
      for (const exp of extractedExps) {
        const cargos = Array.isArray(exp.cargos) ? exp.cargos : [exp];
        for (const cargo of cargos) {
          mappedExperiences.push({
            empresa: exp.company || cargo.company || "",
            titulo_cargo: cargo.role || "",
            tipo_emprego: cargo.tipo_emprego || "clt",
            modalidade: null,
            estado: null,
            cidade: null,
            inicio: cargo.start_date || "",
            fim: cargo.end_date || null,
            descricao: cargo.description || "",
          });
        }
      }

      const mappedEducation: ReviewEducation[] = ((result.extracted_data?.education as any[]) ?? []).map(
        (edu: any) => ({
          instituicao: edu.institution || "",
          tipo: edu.tipo || ("curso" as const),
          titulo: edu.field || "",
          inicio: edu.start_year || "",
          fim: edu.end_year || null,
        }),
      );

      setExperiences(mappedExperiences);
      setEducation(mappedEducation);
      setValidationTriggered(false);
      setStep("review");
    } else {
      toast({
        title: "Erro na importação",
        description: errorRef.current || "Erro desconhecido.",
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      if (isProcessing || isSaving) return;
      if (step === "review") {
        setShowExitConfirm(true);
        return;
      }
      handleClose();
    }
  };

  const handleClose = () => {
    setStep("instructions");
    setExperiences([]);
    setEducation([]);
    setShowExitConfirm(false);
    setValidationTriggered(false);
    onClose();
  };

  const updateExperience = (index: number, updated: ReviewExperience) => {
    setExperiences((prev) => prev.map((exp, i) => (i === index ? updated : exp)));
  };

  const updateEducation = (index: number, updated: ReviewEducation) => {
    setEducation((prev) => prev.map((edu, i) => (i === index ? updated : edu)));
  };

  const handleSave = async () => {
    // Validate before saving
    if (!validateExperiences(experiences)) {
      setValidationTriggered(true);
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios antes de confirmar a importação.",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveImportData({ experiences, education });
      toast({
        title: "Importação concluída!",
        description: "Suas experiências e formações foram atualizadas.",
      });
      handleClose();
    } catch {
      toast({
        title: "Erro ao salvar os dados",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const usedImports = 3 - remainingImports;
  const limitReached = !canImport;

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="sm:max-w-3xl w-full h-full flex flex-col p-0 gap-0">
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
                  <SheetTitle className="font-display text-xl font-bold">Importar do LinkedIn</SheetTitle>
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
                    Ao confirmar a importação, todas as suas experiências profissionais e formações acadêmicas salvas
                    serão apagadas e substituídas pelos dados extraídos do PDF. Esta ação é permanente. Um backup
                    automático será criado antes da importação.
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
                  Recomendamos utilizar esta função ao criar seu perfil pela primeira vez ou quando quiser atualizar
                  completamente suas informações.
                </p>

                {/* Accordions */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="desktop">
                    <AccordionTrigger className="text-sm">Como baixar o PDF a partir do desktop</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        Na página principal do seu LinkedIn, clique na sua foto de perfil ou seu nome. Logo na primeira
                        seção, clique no botão com o ícone "..." e selecione "Salvar como PDF". Veja a imagem abaixo:
                      </p>
                      <div className="w-full md:max-w-xl md:mx-auto">
                        <img
                          src={DESKTOP_IMG}
                          alt="Instruções para baixar PDF no desktop"
                          className="w-full rounded-lg"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="mobile">
                    <AccordionTrigger className="text-sm">Como baixar o PDF a partir do celular</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        No celular é um pouco diferente, pois não é possível baixar diretamente pelo aplicativo. Será
                        necessário abrir o LinkedIn no navegador do celular e selecionar a opção "Site para computador"
                        ou algo similar. Veja a imagem abaixo:
                      </p>
                      <div className="w-full max-w-sm mx-auto">
                        <img
                          src={MOBILE_IMG}
                          alt="Instruções para baixar PDF no celular"
                          className="w-full max-h-[500px] object-contain rounded-lg"
                        />
                      </div>
                      <p>
                        Em seguida, na página principal do seu LinkedIn, clique na sua foto de perfil ou seu nome. Logo
                        na primeira seção, clique no botão com o ícone "..." e selecione "Salvar como PDF". Veja a
                        imagem abaixo:
                      </p>
                      <div className="w-full md:max-w-xl md:mx-auto">
                        <img
                          src={DESKTOP_IMG}
                          alt="Instruções para baixar PDF no desktop"
                          className="w-full rounded-lg"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="why">
                    <AccordionTrigger className="text-sm">
                      Por que não é possível importar diretamente do LinkedIn?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      O LinkedIn tem políticas muito restritas contra a extração automática de dados, o que torna
                      extremamente difícil e até ilegal fazer isso. Por isso, a melhor alternativa é utilizar o
                      currículo gerado por eles. Como estamos em versão beta, utilizar o PDF do LinkedIn torna a
                      importação mais padronizada e certeira, pois outros tipos de PDFs podem ter formatos muito
                      diferentes e causar erros.
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
                  <SheetTitle className="font-display text-xl font-bold">Revisão da Importação</SheetTitle>
                  <SheetDescription className="sr-only">Revise os dados extraídos do seu currículo</SheetDescription>
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
                  Confira os dados extraídos abaixo. Você pode editar qualquer campo antes de salvar. Após confirmar,
                  suas experiências e formações serão substituídas.
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
                        estadosIBGE={estados}
                        validationTriggered={validationTriggered}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowExitConfirm(true)}
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button type="button" onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Confirmar e Salvar
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair sem salvar?</AlertDialogTitle>
            <AlertDialogDescription>
              Os dados extraídos serão perdidos e você precisará fazer a importação novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar revisando</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleClose}>
              Sair sem salvar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
