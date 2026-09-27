import { getSetting, setSetting } from './repositories/settings';

const FIRST_USED_KEY = 'firstUsedDate';

/**
 * Fecha (ISO) en que se usó Progreso Sobrio por primera vez en este dispositivo — se fija
 * una sola vez. Sirve para no permitir registros diarios de fechas anteriores
 * a que la app existiera acá (a diferencia de "última vez" en Sustancias, que
 * sí puede ser anterior a instalar Progreso Sobrio).
 */
export async function ensureFirstUsedDate(): Promise<string> {
  const existing = await getSetting<string | null>(FIRST_USED_KEY, null);
  if (existing) return existing;

  const now = new Date().toISOString();
  await setSetting(FIRST_USED_KEY, now);
  return now;
}

export function getFirstUsedDate(): Promise<string | null> {
  return getSetting<string | null>(FIRST_USED_KEY, null);
}
