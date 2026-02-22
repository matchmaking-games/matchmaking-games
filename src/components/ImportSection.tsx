import { useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface ImportSectionProps {
  onFileSelected: (file: File) => void;
  isProcessing?: boolean;
  progress?: string;
}

export function ImportSection({ onFileSelected, isProcessing, progress }: ImportSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Formato inválido",
        description: "Apenas arquivos PDF são aceitos.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast({
        title: "Arquivo muito grande",
        description: `O limite é ${MAX_SIZE_MB}MB.`,
        variant: "destructive",
      });
      return;
    }

    onFileSelected(file);
  };

  return (
    <div className="flex flex-col gap-2 w-full md:w-auto items-center md:items-start">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Selecionar PDF do LinkedIn"
      />

      {isProcessing ? (
        <div className="flex items-center gap-2 h-9 px-3">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">{progress}</span>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Importar do LinkedIn
        </Button>
      )}

      <span className="text-sm text-muted-foreground">
        Veja como trazer seu currículo do LinkedIn
      </span>
    </div>
  );
}
