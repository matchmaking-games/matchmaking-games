import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useImportLimit } from "@/hooks/useImportLimit";

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface ImportSectionProps {
  onFileSelected: (file: File) => void;
}

export function ImportSection({ onFileSelected }: ImportSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { remainingImports, canImport, isLoading } = useImportLimit();

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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 w-full md:w-auto">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-56" />
      </div>
    );
  }

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

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!canImport}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        Importar do LinkedIn
      </Button>

      <span
        className={`text-xs ${
          canImport
            ? "text-muted-foreground"
            : "text-destructive"
        }`}
      >
        {canImport
          ? `Ver histórico · ${remainingImports}/3 importações este mês`
          : "Limite mensal atingido · 0/3 importações restantes"}
      </span>
    </div>
  );
}
