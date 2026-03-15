import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImportSectionProps {
  onOpen: () => void;
}

export function ImportSection({ onOpen }: ImportSectionProps) {
  return (
    <div className="flex flex-col gap-2 w-full md:w-auto items-center md:items-start">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onOpen}
      >
        <Upload className="h-4 w-4 mr-2" />
        Importar do LinkedIn
      </Button>

      <span className="text-sm text-muted-foreground">
        Veja como trazer seu currículo do LinkedIn
      </span>
    </div>
  );
}
