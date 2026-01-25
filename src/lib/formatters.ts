import { format, differenceInMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Capitalizes the first letter of a string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats duration between two dates in years and months
 * Examples: "2 anos e 3 meses", "1 ano", "6 meses", "menos de 1 mês"
 */
function formatDuration(start: Date, end: Date): string {
  const totalMonths = differenceInMonths(end, start);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years > 0 && months > 0) {
    return `${years} ano${years > 1 ? "s" : ""} e ${months} mês${months > 1 ? "es" : ""}`;
  }
  if (years > 0) {
    return `${years} ano${years > 1 ? "s" : ""}`;
  }
  if (months > 0) {
    return `${months} mês${months > 1 ? "es" : ""}`;
  }
  return "menos de 1 mês";
}

/**
 * Formats a date range with duration
 * Examples:
 * - "Mar 2020 - Atualmente (4 anos e 2 meses)"
 * - "Jan 2018 - Dez 2019 (1 ano e 11 meses)"
 * - "Ago 2023" (when no end date and not currently working)
 */
export function formatDateRange(
  inicio: string,
  fim: string | null,
  atualmenteTrabalhando: boolean | null
): string {
  const startDate = new Date(inicio);
  const startFormatted = capitalize(format(startDate, "MMM yyyy", { locale: ptBR }));

  if (atualmenteTrabalhando) {
    const duration = formatDuration(startDate, new Date());
    return `${startFormatted} - Atualmente (${duration})`;
  }

  if (fim) {
    const endDate = new Date(fim);
    const endFormatted = capitalize(format(endDate, "MMM yyyy", { locale: ptBR }));
    const duration = formatDuration(startDate, endDate);
    return `${startFormatted} - ${endFormatted} (${duration})`;
  }

  return startFormatted;
}

/**
 * Converts employment type enum to readable text
 * clt → "CLT", pj → "PJ", freelance → "Freelancer", estagio → "Estágio"
 */
export function formatTipoEmprego(tipo: string): string {
  const map: Record<string, string> = {
    clt: "CLT",
    pj: "PJ",
    freelance: "Freelancer",
    estagio: "Estágio",
  };
  return map[tipo] || tipo;
}

/**
 * Converts education type enum to readable text
 * graduacao → "Graduação", pos → "Pós-graduação", etc.
 */
export function formatTipoEducacao(tipo: string): string {
  const map: Record<string, string> = {
    graduacao: "Graduação",
    pos: "Pós-graduação",
    tecnico: "Técnico",
    curso: "Curso",
    certificacao: "Certificação",
  };
  return map[tipo] || tipo;
}

/**
 * Formats education period
 * Examples:
 * - "Concluído em 2024"
 * - "Mar 2020 - Dez 2024"
 * - "Mar 2020 - Em andamento"
 * - "2024" (if only end date)
 */
export function formatEducationPeriod(
  inicio: string | null,
  fim: string | null,
  concluido: boolean | null
): string {
  if (!inicio && !fim) {
    return concluido ? "Concluído" : "Em andamento";
  }

  if (fim) {
    const endDate = new Date(fim);
    const endFormatted = capitalize(format(endDate, "MMM yyyy", { locale: ptBR }));
    
    if (!inicio) {
      return concluido ? `Concluído em ${endFormatted}` : endFormatted;
    }
    
    const startDate = new Date(inicio);
    const startFormatted = capitalize(format(startDate, "MMM yyyy", { locale: ptBR }));
    return `${startFormatted} - ${endFormatted}`;
  }

  // Has start but no end
  const startDate = new Date(inicio!);
  const startFormatted = capitalize(format(startDate, "MMM yyyy", { locale: ptBR }));
  return `${startFormatted} - Em andamento`;
}
