import { useLiveQuery } from 'dexie-react-hooks';
import { deleteDailyLog, getDailyLogs } from '../../db/repositories';
import type { DailyLog } from '../../db/types';
import { formatDateDisplay } from '../../lib/dates';

/** Hasta tres datos del día, en este orden. Basta un dato para guardar, así que no hay ninguno fijo. */
function summarize(log: DailyLog): string {
  const parts = [
    log.craving !== undefined && `Ansias ${log.craving}`,
    log.mood !== undefined && `Ánimo ${log.mood}`,
    log.restingHeartRate !== undefined && `${log.restingHeartRate} lpm`,
    log.sleepHours !== undefined && `${String(log.sleepHours).replace('.', ',')} h de sueño`,
    log.activityMinutes !== undefined && `${log.activityMinutes} min de actividad`,
    log.habitIds.length > 0 && `${log.habitIds.length} ${log.habitIds.length === 1 ? 'hábito' : 'hábitos'}`,
    log.notes !== undefined && 'Con notas',
  ];
  return parts.filter(Boolean).slice(0, 3).join(' · ');
}

interface HistorialListProps {
  onEdit: (date: string) => void;
}

export function HistorialList({ onEdit }: HistorialListProps) {
  const logs = useLiveQuery(() => getDailyLogs());

  const handleDelete = async (id: number, date: string) => {
    const confirmed = window.confirm(`¿Borrar el registro del ${formatDateDisplay(date)}?`);
    if (!confirmed) return;
    await deleteDailyLog(id);
  };

  if (!logs) return null;

  if (logs.length === 0) {
    return <p className="text-center text-ink-soft dark:text-ink-soft-dark">Todavía no hay registros diarios.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {logs.map((log) => (
        <li
          key={log.id}
          className="paper-card flex items-center justify-between gap-3 py-2 pr-2 pl-4"
        >
          <div>
            <p className="font-semibold text-ink dark:text-ink-dark">{formatDateDisplay(log.date)}</p>
            <p className="text-sm text-ink-soft dark:text-ink-soft-dark">{summarize(log)}</p>
          </div>

          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => onEdit(log.date)}
              aria-label={`Editar el registro del ${formatDateDisplay(log.date)}`}
              className="flex h-11 w-11 items-center justify-center rounded-full text-primary-text hover:bg-primary-soft dark:text-primary-text-dark dark:hover:bg-primary/15"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Zm9.5-13.5 4 4" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleDelete(log.id, log.date)}
              aria-label={`Borrar el registro del ${formatDateDisplay(log.date)}`}
              className="flex h-11 w-11 items-center justify-center rounded-full text-warning-text hover:bg-warning/10 dark:text-warning"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
              </svg>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
