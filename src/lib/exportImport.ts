import { db } from '../db/db';
import { clearDemoSubstanceId, getHrThreshold, setHrThreshold } from '../db/repositories';
import type { Contact, DailyLog, ListItem, Substance } from '../db/types';
import { AndroidBridgeError, isAndroidBridgeAvailable, saveFileViaBridge } from './androidBridge';
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

// --- Validación al importar ---
// Se revisa el archivo completo antes de tocar la base: si algo no calza, no se cambia nada.
// Sin esto, un respaldo con un campo dañado se guardaba igual y podía romper pantallas después.

const DATE_KEY = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isId = (value: unknown) => Number.isInteger(value) && (value as number) > 0;
const isText = (value: unknown) => typeof value === 'string';
const isDateKey = (value: unknown) => typeof value === 'string' && DATE_KEY.test(value);
const isOptionalScale = (value: unknown) =>
  value === undefined || (Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 5);
const isOptionalNumber = (value: unknown) => value === undefined || (typeof value === 'number' && Number.isFinite(value));
const isOptionalText = (value: unknown) => value === undefined || typeof value === 'string';
const isIdList = (value: unknown) => Array.isArray(value) && value.every(isId);

const isSubstance = (value: unknown) =>
  isObject(value) &&
  isId(value.id) &&
  isText(value.name) &&
  isDateKey(value.lastUseDate) &&
  isOptionalText(value.color) &&
  isText(value.createdAt);

const isDailyLog = (value: unknown) =>
  isObject(value) &&
  isId(value.id) &&
  isDateKey(value.date) &&
  // Opcionales desde que basta un dato para guardar; los respaldos anteriores las traen todas.
  [value.craving, value.sleepQuality, value.energy, value.mood].every(isOptionalScale) &&
  isIdList(value.triggerIds) &&
  isIdList(value.habitIds) &&
  [value.restingHeartRate, value.minHeartRate, value.maxHeartRate, value.sleepHours, value.activityMinutes].every(
    isOptionalNumber,
  ) &&
  [value.deviceUsed, value.activityType, value.notes].every(isOptionalText) &&
  isText(value.createdAt) &&
  isText(value.updatedAt);

const isContact = (value: unknown) =>
  isObject(value) &&
  isId(value.id) &&
  isText(value.name) &&
  isOptionalText(value.phone) &&
  isOptionalText(value.relationship) &&
  isText(value.createdAt);

const isListItem = (value: unknown) =>
  isObject(value) && isId(value.id) && isText(value.name) && typeof value.active === 'boolean' && isText(value.createdAt);

// Un id (o una fecha de registro) repetido haría fallar la importación a mitad de camino.
const allDifferent = (items: Record<string, unknown>[], key: string) =>
  new Set(items.map((item) => item[key])).size === items.length;

function isTable(value: unknown, isItem: (item: unknown) => boolean): value is Record<string, unknown>[] {
  return Array.isArray(value) && value.every(isItem) && allDifferent(value, 'id');
}

function isValidExport(data: unknown): data is BackupExport {
  if (!isObject(data) || data.version !== 1) return false;
  const { hrThreshold } = data;
  return (
    isTable(data.substances, isSubstance) &&
    isTable(data.dailyLogs, isDailyLog) &&
    allDifferent(data.dailyLogs, 'date') &&
    isTable(data.contacts, isContact) &&
    isTable(data.habits, isListItem) &&
    isTable(data.triggers, isListItem) &&
    // Si falta, al importar se usa el valor por defecto (100).
    (hrThreshold === undefined || (typeof hrThreshold === 'number' && Number.isFinite(hrThreshold) && hrThreshold > 0))
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

/**
 * Guarda un respaldo y devuelve el nombre final del archivo. En la app Android abre "Guardar
 * como" (en el WebView las descargas de blob no funcionan); en el navegador, descarga como siempre.
 */
async function saveExport(content: string, filename: string, mimeType: string): Promise<string> {
  if (isAndroidBridgeAvailable()) return saveFileViaBridge(filename, mimeType, content);
  downloadBlob(content, filename, mimeType);
  return filename;
}

const EXPORT_WARNING =
  'Este archivo va a tener tus datos de salud. Guárdalo en un lugar seguro: si lo subes a la nube o lo envías, queda con las reglas de ese servicio. ¿Continuar?';

/**
 * Exporta y devuelve el mensaje para mostrar. Nunca rechaza: sin esto, un fallo al exportar se
 * perdía como promesa rechazada sin capturar y el botón no hacía nada, sin forma de distinguir
 * un error del código de una descarga bloqueada por el navegador.
 *
 * Antes avisa qué lleva el archivo: fuera de la app, cuidarlo ya depende de la persona.
 */
export async function exportWithMessage(run: () => Promise<string>): Promise<string> {
  if (!window.confirm(EXPORT_WARNING)) return 'No se guardó ningún archivo.';
  try {
    const filename = await run();
    return isAndroidBridgeAvailable()
      ? `Respaldo guardado: ${filename}.`
      : `Respaldo generado: ${filename}. Si no aparece en tus descargas, tu navegador la bloqueó.`;
  } catch (error) {
    if (error instanceof AndroidBridgeError && error.code === 'cancelled') return 'No se guardó ningún archivo.';
    return 'No se pudo guardar el respaldo. Intenta de nuevo.';
  }
}

/** Devuelve el nombre del archivo generado, para poder confirmarlo en la UI. */
export async function exportJson(): Promise<string> {
  const data = await buildExport();
  // Fecha local en el nombre: exportedAt va en UTC y en Chile, de noche, ya marcaba el día siguiente.
  const filename = `progreso-sobrio-datos-${toDateKey(new Date())}.json`;
  return saveExport(JSON.stringify(data, null, 2), filename, 'application/json');
}

// Excel en Chile separa columnas con ";" y usa coma decimal: con "," todo quedaba en una
// sola columna, y un 9.6 podía convertirse en fecha.
const CSV_SEPARATOR = ';';

function csvEscape(value: unknown): string {
  if (value === undefined || value === null) return '';
  const str = typeof value === 'number' ? String(value).replace('.', ',') : String(value);
  return /[";\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
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
    log.craving ?? '',
    log.sleepHours ?? '',
    log.sleepQuality ?? '',
    log.activityMinutes ?? '',
    log.activityType ?? '',
    log.energy ?? '',
    log.mood ?? '',
    log.triggerIds.map((id) => triggerNames.get(id)).filter(Boolean).join(', '),
    log.habitIds.map((id) => habitNames.get(id)).filter(Boolean).join(', '),
    log.notes ?? '',
  ]);

  // El BOM (U+FEFF) le avisa a Excel que el archivo es UTF-8: sin él, los tildes y la ñ se ven mal.
  const csv = '\uFEFF' + [CSV_COLUMNS, ...rows].map((row) => row.map(csvEscape).join(CSV_SEPARATOR)).join('\n');
  const filename = `progreso-sobrio-registros-${toDateKey(new Date())}.csv`;
  return saveExport(csv, filename, 'text/csv');
}

export interface ImportSummary {
  substances: number;
  dailyLogs: number;
  contacts: number;
  habits: number;
  triggers: number;
}

/** Lee y revisa un archivo de respaldo sin tocar la base. Si no es un respaldo, rechaza con un mensaje para la persona. */
export async function readBackup(file: File): Promise<BackupExport> {
  const invalid = 'Este archivo no es un respaldo de Progreso Sobrio. No se cambió nada.';
  const text = await file.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(invalid);
  }

  if (!isValidExport(data)) {
    throw new Error(invalid);
  }
  return data;
}

/** Reemplaza TODOS los datos actuales por los del respaldo — es una restauración, no un merge. */
export async function restoreBackup(data: BackupExport): Promise<ImportSummary> {
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
