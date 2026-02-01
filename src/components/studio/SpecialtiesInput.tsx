import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SpecialtiesInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

const SUGGESTIONS = [
  "Mobile", "PC", "Console", "VR", "Casual", 
  "Indie", "AA", "AAA", "F2P"
];

export function SpecialtiesInput({ 
  value, 
  onChange, 
  disabled 
}: SpecialtiesInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed)) return;
    
    onChange([...value, trimmed]);
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const availableSuggestions = SUGGESTIONS.filter(
    s => !value.includes(s)
  );

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="text-sm py-1 px-3"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                disabled={disabled}
                className="ml-2 hover:text-destructive focus:outline-none disabled:opacity-50"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Adicionar especialidade (ex: Mobile, PC, Console)"
        disabled={disabled}
        className="h-11"
      />
      
      <p className="text-xs text-muted-foreground">
        Pressione Enter ou vírgula para adicionar
      </p>

      {availableSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground">
            Sugestões:
          </span>
          {availableSuggestions.map((suggestion) => (
            <Button
              key={suggestion}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addTag(suggestion)}
              disabled={disabled}
              className="h-7 text-xs"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
