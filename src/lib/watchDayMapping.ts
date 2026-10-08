import type { WatchDayData } from './androidBridge';

/** Campos del registro diario que se completan con datos del reloj (como texto, igual que el formulario). */
export interface WatchFormFields {
  restingHeartRate: string;
  minHeartRate: string;
  maxHeartRate: string;
  sleepHours: string;
  deviceUsed: string;
}

/** Minutos → horas con un decimal: 700 → 11.7. */
export function sleepMinutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10;
}

/**
 * Qué cambia en el formulario al tocar "Usar estos datos". Función pura.
 * - Un valor del reloj reemplaza lo que tenga el campo; un null no lo toca (nunca se borra ni se estima).
 * - El equipo solo se completa si el campo está vacío.
 * - El promedio, la última medición y el pulso durante el sueño no tienen campo: son solo informativos.
 */
export function mapWatchDayToForm(data: WatchDayData, form: WatchFormFields): Partial<WatchFormFields> {
  const patch: Partial<WatchFormFields> = {};
  if (data.restingBpm !== null) patch.restingHeartRate = String(data.restingBpm);
  if (data.minBpm !== null) patch.minHeartRate = String(data.minBpm);
  if (data.maxBpm !== null) patch.maxHeartRate = String(data.maxBpm);
  if (data.sleepMinutes !== null) patch.sleepHours = String(sleepMinutesToHours(data.sleepMinutes));
  if (form.deviceUsed.trim() === '' && data.sources.length > 0) patch.deviceUsed = data.sources.join(', ');
  return patch;
}
