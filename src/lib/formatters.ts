import { format, differenceInMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Safely parses a date string that may be "YYYY-MM", "YYYY-MM-DD", or full ISO.
 * Uses numeric constructor to avoid cross-browser issues (Safari rejects "YYYY-MM").
 */
export function parseDateSafe(dateStr: string): Date {
  const safe = dateStr.length === 7 ? dateStr + "-01" : dateStr.substring(0, 10);
  const [year, month, day] = safe.split("-").map(Number);
  return new Date(year, month - 1, day);
}

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
    freelancer: "Freelancer",
    estagio: "Estágio",
    tempo_integral: "Tempo integral",
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
    ensino_medio: "Ensino médio",
    mestrado: "Mestrado",
    doutorado: "Doutorado",
    mba: "MBA",
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
  const startYear = inicio ? inicio.substring(0, 4) : null;
  const endYear = fim ? fim.substring(0, 4) : null;

  if (!startYear && !endYear) {
    return concluido ? "Concluído" : "Em andamento";
  }

  if (startYear && endYear) {
    return startYear === endYear ? startYear : `${startYear} - ${endYear}`;
  }

  if (startYear) {
    return concluido ? `Concluído em ${startYear}` : `${startYear} - Em andamento`;
  }

  return endYear!;
}

/**
 * Converts project type enum to readable text
 * profissional -> "Profissional", game_jam -> "Game Jam", etc.
 */
export function formatTipoProjeto(tipo: string): string {
  const map: Record<string, string> = {
    profissional: "Profissional",
    pessoal: "Pessoal",
    game_jam: "Game Jam",
    open_source: "Open Source",
  };
  return map[tipo] || tipo;
}

/**
 * Converts project status enum to readable text
 */
export function formatStatusProjeto(status: string): string {
  const map: Record<string, string> = {
    em_andamento: "Em desenvolvimento",
    concluido: "Concluído",
    pausado: "Pausado",
  };
  return map[status] || status;
}

/**
 * Generates a URL-friendly slug from a title
 * "Space Shooter!" -> "space-shooter"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "")    // Remove special characters
    .trim()
    .replace(/\s+/g, "-")            // Spaces become hyphens
    .replace(/-+/g, "-");            // Remove duplicate hyphens
}

/**
 * Converts job level enum to readable text
 * iniciante → "Iniciante", junior → "Júnior", etc.
 */
export function formatNivelVaga(nivel: string): string {
  const map: Record<string, string> = {
    iniciante: "Iniciante",
    junior: "Júnior",
    pleno: "Pleno",
    senior: "Sênior",
    lead: "Lead",
  };
  return map[nivel] || nivel;
}

/**
 * Converts contract type enum to readable text
 * clt → "CLT", pj → "PJ", freelance → "Freelance", estagio → "Estágio"
 */
export function formatTipoContrato(tipo: string): string {
  const map: Record<string, string> = {
    clt: "CLT",
    pj: "PJ",
    freelance: "Freelance",
    freelancer: "Freelancer",
    estagio: "Estágio",
    tempo_integral: "Tempo integral",
  };
  return map[tipo] || tipo;
}

/**
 * Converts work model enum to readable text
 * presencial → "Presencial", hibrido → "Híbrido", remoto → "Remoto"
 */
export function formatTipoTrabalho(tipo: string): string {
  const map: Record<string, string> = {
    presencial: "Presencial",
    hibrido: "Híbrido",
    remoto: "Remoto",
  };
  return map[tipo] || tipo;
}

/**
 * Converts studio size enum to readable text
 * micro → "1-10 funcionários", pequeno → "11-50 funcionários", etc.
 * Returns fallback for null values
 */
export function formatTamanhoEstudio(tamanho: string | null): string {
  if (!tamanho) return "Tamanho não informado";

  const map: Record<string, string> = {
    micro: "1-10 funcionários",
    pequeno: "11-50 funcionários",
    medio: "51-200 funcionários",
    grande: "200+ funcionários",
  };

  return map[tamanho] || tamanho;
}
