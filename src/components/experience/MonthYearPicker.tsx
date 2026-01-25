import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface MonthYearPickerProps {
  value?: string; // Format: "YYYY-MM"
  onChange: (value: string) => void;
  maxDate?: string; // Format: "YYYY-MM"
  placeholder?: string;
  disabled?: boolean;
}

const months = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const monthsShort = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

export function MonthYearPicker({
  value,
  onChange,
  maxDate,
  placeholder = "Selecione a data",
  disabled = false,
}: MonthYearPickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // Parse value to set initial selected year/month
  useEffect(() => {
    if (value) {
      const [year, month] = value.split("-");
      setSelectedYear(year);
      setSelectedMonth(month);
    } else {
      setSelectedYear("");
      setSelectedMonth("");
    }
  }, [value]);

  // Generate years from 1990 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) =>
    (currentYear - i).toString()
  );

  // Get max year/month from maxDate
  const maxYear = maxDate ? parseInt(maxDate.split("-")[0]) : currentYear;
  const maxMonth = maxDate ? parseInt(maxDate.split("-")[1]) : 12;

  // Filter available months based on selected year and maxDate
  const getAvailableMonths = () => {
    if (selectedYear && parseInt(selectedYear) === maxYear) {
      return months.filter((m) => parseInt(m.value) <= maxMonth);
    }
    return months;
  };

  // Handle year change
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    
    // If selected month is now invalid, clear it
    if (selectedMonth && parseInt(year) === maxYear && parseInt(selectedMonth) > maxMonth) {
      setSelectedMonth("");
    }
  };

  // Handle month change
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    
    // If both year and month are selected, update value and close
    if (selectedYear) {
      onChange(`${selectedYear}-${month}`);
      setOpen(false);
    }
  };

  // Handle year change with auto-complete if month already selected
  const handleYearChangeWithAutoComplete = (year: string) => {
    handleYearChange(year);
    
    // If month is already valid for new year, auto-complete
    if (selectedMonth) {
      const isValidMonth = parseInt(year) < maxYear || parseInt(selectedMonth) <= maxMonth;
      if (isValidMonth) {
        onChange(`${year}-${selectedMonth}`);
        setOpen(false);
      }
    }
  };

  // Format display value
  const formatDisplayValue = () => {
    if (!value) return null;
    const [year, month] = value.split("-");
    const monthIndex = parseInt(month) - 1;
    return `${monthsShort[monthIndex]} ${year}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDisplayValue() || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 pointer-events-auto" align="start">
        <div className="flex gap-3">
          {/* Year Select */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Ano
            </label>
            <Select
              value={selectedYear}
              onValueChange={handleYearChangeWithAutoComplete}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem
                    key={year}
                    value={year}
                    disabled={parseInt(year) > maxYear}
                  >
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month Select */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Mês
            </label>
            <Select
              value={selectedMonth}
              onValueChange={handleMonthChange}
              disabled={!selectedYear}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableMonths().map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
