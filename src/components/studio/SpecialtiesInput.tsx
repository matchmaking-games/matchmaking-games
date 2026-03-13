import { Badge } from "@/components/ui/badge";

interface SpecialtiesInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

const ESPECIALIDADES = [
  "Mobile", "PC", "Console", "VR", "Casual",
  "Indie", "AA", "AAA", "F2P",
] as const;

export function SpecialtiesInput({ value, onChange, disabled }: SpecialtiesInputProps) {
  const toggle = (item: string) => {
    if (value.includes(item)) {
      onChange(value.filter((v) => v !== item));
    } else {
      onChange([...value, item]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {ESPECIALIDADES.map((item) => (
          <Badge
            key={item}
            variant={value.includes(item) ? "default" : "outline"}
            className={`cursor-pointer select-none ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => !disabled && toggle(item)}
          >
            {item}
          </Badge>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Clique para selecionar as especialidades do seu estúdio
      </p>
    </div>
  );
}
