const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/**
 * Converte data ISO (YYYY-MM) para formato brasileiro (MM/YYYY).
 * Usada exclusivamente em inputs e formulários.
 *
 * @example
 * formatBrazilianDate("2022-09") // "09/2022"
 * formatBrazilianDate(null)      // "Atual"
 * formatBrazilianDate("")        // "Atual"
 */
export function formatBrazilianDate(isoDate: string | null): string {
  if (!isoDate) return 'Atual';
  const [year, month] = isoDate.split('-');
  if (!year || !month) return 'Atual';
  return `${month}/${year}`;
}

/**
 * Converte data ISO (YYYY-MM) para formato legível em português (mmm/YYYY).
 * Usada exclusivamente em exibição read-only: cards, perfil público, tela de revisão.
 *
 * @example
 * formatDisplayDate("2022-09") // "set/2022"
 * formatDisplayDate(null)      // "Atual"
 * formatDisplayDate("")        // "Atual"
 */
export function formatDisplayDate(isoDate: string | null): string {
  if (!isoDate) return 'Atual';
  const [year, month] = isoDate.split('-');
  if (!year || !month) return 'Atual';
  const monthIndex = parseInt(month, 10) - 1;
  if (monthIndex < 0 || monthIndex > 11) return 'Atual';
  return `${MONTHS[monthIndex]}/${year}`;
}

/**
 * Converte data brasileira (MM/YYYY) para formato ISO (YYYY-MM).
 * Retorna null para "Atual", string vazia ou input inválido (com console.warn).
 *
 * @example
 * parseToIsoDate("09/2022") // "2022-09"
 * parseToIsoDate("Atual")   // null
 * parseToIsoDate("")         // null
 * parseToIsoDate("foo")      // null (com console.warn)
 */
export function parseToIsoDate(brDate: string): string | null {
  if (!brDate || brDate === 'Atual') return null;

  if (!isValidBrazilianDate(brDate)) {
    console.warn(`parseToIsoDate: input inválido "${brDate}"`);
    return null;
  }

  const [month, year] = brDate.split('/');
  return `${year}-${month}`;
}

/**
 * Valida se a string está no formato MM/YYYY com mês entre 01 e 12.
 * Exige zero à esquerda (rejeita "9/2022").
 *
 * @example
 * isValidBrazilianDate("09/2022") // true
 * isValidBrazilianDate("9/2022")  // false
 * isValidBrazilianDate("13/2022") // false
 * isValidBrazilianDate("2022-09") // false
 */
export function isValidBrazilianDate(date: string): boolean {
  const match = /^(\d{2})\/(\d{4})$/.exec(date);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  return month >= 1 && month <= 12;
}
