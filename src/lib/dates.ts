/** Fecha en formato ISO YYYY-MM-DD, en horario local (no UTC, para que "hoy" sea el día del usuario). */
export function toDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Parsea una clave YYYY-MM-DD como fecha local (evita el corrimiento de un día que da `new Date(string)`, que asume UTC). */
export function fromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Días de calendario entre dos claves YYYY-MM-DD (puede dar negativo si `to` es anterior a `from`). */
export function daysBetween(from: string, to: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((fromDateKey(to).getTime() - fromDateKey(from).getTime()) / msPerDay);
}

/** Día de la semana, día y mes en palabras: "martes, 21 de octubre". */
export function formatLongDate(date: Date): string {
  return date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** Muestra una clave YYYY-MM-DD como DD-MM-YYYY (formato usado en Chile). */
export function formatDateDisplay(dateKey: string): string {
  const [year, month, day] = dateKey.split('-');
  return `${day}-${month}-${year}`;
}
