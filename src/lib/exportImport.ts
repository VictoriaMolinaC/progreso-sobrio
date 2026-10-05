import { db } from '../db/db';
import { clearDemoSubstanceId, getHrThreshold, setHrThreshold } from '../db/repositories';
import type { Contact, DailyLog, ListItem, Substance } from '../db/types';
import { toDateKey } from './dates';

/**
 * Formato del archivo de respaldo (.json) que se descarga desde la app.
 * Cambiar el nombre de un campo puede impedir que se importen los respaldos
 * que la gente ya descargó.
 */
export interface BackupExport {
  version: 1;
  exportedAt: string;
  substances: Substance[];
  dailyLogs: DailyLog[];
  contacts: Contact[];
  habits: ListItem[];
  triggers: ListItem[];
  hrThreshold: number;
}

function isValidExport(data: unknown): data is BackupExport {
  if (typeof data !== 'object' || data === null) return false;
  const candidate = data as Record<string, unknown>;
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.substances) &&
    Array.isArray(candidate.dailyLogs) &&
    Array.isArray(candidate.contacts) &&
    Array.isArray(candidate.habits) &&
    Array.isArray(candidate.triggers)
  );
}

async function buildExport(): Promise<BackupExport> {
  const [substances, dailyLogs, contacts, habits, triggers, hrThreshold] = await Promise.all([
    db.substances.toArray(),
    db.dailyLogs.toArray(),
    db.contacts.toArray(),
    db.habits.toArray(),
    db.triggers.toArray(),
    getHrThreshold(),
  ]);

  return { version: 1, exportedAt: new Date().toISOString(), substances, dailyLogs, contacts, habits, triggers, hrThreshold };
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // El revoke va diferido a propósito: `click()` solo agenda la descarga, así
  // que revocar en el mismo tick puede invalidar la URL antes de que el
  // navegador alcance a leerla. Chrome copia el blob y lo tolera; otros
  // motores no, y la descarga falla en silencio.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Devuelve el nombre del archivo generado, para poder confirmarlo en la UI. */
export async function exportJson(): Promise<string> {
  const data = await buildExport();
  const filename = `progreso-sobrio-datos-${data.exportedAt.slice(0, 10)}.json`;
  downloadBlob(JSON.stringify(data, null, 2), filename, 'application/json');
  return filename;
}

function csvEscape(value: unknown): string {
  const str = value === undefined || value === null ? '' : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

const CSV_COLUMNS = [
  'fecha',
  'lpm_reposo',
  'lpm_min',
  'lpm_max',
  'equipo',
  'craving',
  'horas_sueno',
  'calidad_sueno',
  'minutos_actividad',
  'tipo_actividad',
  'energia',
  'animo',
  'disparadores',
  'habitos',
  'notas',
];

export async function exportCsv(): Promise<string> {
  const [dailyLogs, habits, triggers] = await Promise.all([
    db.dailyLogs.orderBy('date').toArray(),
    db.habits.toArray(),
    db.triggers.toArray(),
  ]);

  const habitNames = new Map(habits.map((habit) => [habit.id, habit.name]));
  const triggerNames = new Map(triggers.map((trigger) => [trigger.id, trigger.name]));

  const rows = dailyLogs.map((log) => [
    log.date,
    log.restingHeartRate ?? '',
    log.minHeartRate ?? '',
    log.maxHeartRate ?? '',
    log.deviceUsed ?? '',
    log.craving,
    log.sleepHours ?? '',
    log.sleepQuality,
    log.activityMinutes ?? '',
    log.activityType ?? '',
    log.energy,
    log.mood,
    log.triggerIds.map((id) => triggerNames.get(id)).filter(Boolean).join('; '),
    log.habitIds.map((id) => habitNames.get(id)).filter(Boolean).join('; '),
    log.notes ?? '',
  ]);

  const csv = [CSV_COLUMNS, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
  const filename = `progreso-sobrio-registros-${toDateKey(new Date())}.csv`;
  downloadBlob(csv, filename, 'text/csv');
  return filename;
}

export interface ImportSummary {
  substances: number;
  dailyLogs: number;
  contacts: number;
  habits: number;
  triggers: number;
}

/** Reemplaza TODOS los datos actuales por los del archivo — es una restauración, no un merge. */
export async function importJson(file: File): Promise<ImportSummary> {
  const text = await file.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('El archivo no es un JSON válido.');
  }

  if (!isValidExport(data)) {
    throw new Error('El archivo no tiene el formato esperado de un respaldo de Progreso Sobrio.');
  }

  await db.transaction(
    'rw',
    [db.substances, db.dailyLogs, db.contacts, db.habits, db.triggers, db.settings],
    async () => {
      await Promise.all([
        db.substances.clear(),
        db.dailyLogs.clear(),
        db.contacts.clear(),
        db.habits.clear(),
        db.triggers.clear(),
      ]);
      await Promise.all([
        db.substances.bulkAdd(data.substances),
        db.dailyLogs.bulkAdd(data.dailyLogs),
        db.contacts.bulkAdd(data.contacts),
        db.habits.bulkAdd(data.habits),
        db.triggers.bulkAdd(data.triggers),
      ]);
      await setHrThreshold(data.hrThreshold ?? 100);
      await clearDemoSubstanceId();
    },
  );

  // Se cuenta contra la base ya escrita, no contra el archivo — así el mensaje
  // refleja lo que realmente quedó guardado.
  const [substances, dailyLogs, contacts, habits, triggers] = await Promise.all([
    db.substances.count(),
    db.dailyLogs.count(),
    db.contacts.count(),
    db.habits.count(),
    db.triggers.count(),
  ]);

  return { substances, dailyLogs, contacts, habits, triggers };
}
