import * as React from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectComboboxProps {
  options: MultiSelectOption[];
  selected: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  maxDisplayed?: number;
  disabled?: boolean;
  className?: string;
}

export function MultiSelectCombobox({
  options,
  selected,
  onSelectionChange,
  placeholder,
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhum item encontrado",
  maxDisplayed = 3,
  disabled = false,
  className,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const selectedOptions = options.filter((opt) => selected.includes(opt.value));
  const displayedOptions = selectedOptions.slice(0, maxDisplayed);
  const remainingCount = selectedOptions.length - maxDisplayed;

  const toggleOption = (value: string) => {
    const isSelected = selected.includes(value);
    const next = isSelected
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onSelectionChange(next);
  };

  const removeOption = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    onSelectionChange(selected.filter((v) => v !== value));
  };

  // Handle popover close - return focus to trigger for accessibility
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Use setTimeout to ensure focus returns after popover closes
      setTimeout(() => {
        triggerRef.current?.focus();
      }, 0);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between min-h-9 h-auto py-2",
            !selectedOptions.length && "text-muted-foreground",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 items-center flex-1 text-left">
            {selectedOptions.length === 0 ? (
              <span className="font-normal">{placeholder}</span>
            ) : (
              <>
                {displayedOptions.map((opt) => (
                  <Badge
                    key={opt.value}
                    variant="secondary"
                    className="text-xs gap-1 pr-1 shrink-0"
                  >
                    {opt.label}
                    <button
                      type="button"
                      onClick={(e) => removeOption(e, opt.value)}
                      className="ml-0.5 hover:bg-muted rounded-full p-0.5"
                      aria-label={`Remover ${opt.label}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {remainingCount > 0 && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    +{remainingCount}
                  </Badge>
                )}
              </>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => toggleOption(option.value)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
