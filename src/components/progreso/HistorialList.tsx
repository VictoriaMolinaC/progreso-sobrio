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
          className="flex items-center justify-between shadow-[0_2px_8px_rgba(62,58,54,0.08)] dark:shadow-none rounded-xl border border-ink/15 px-4 py-3 dark:border-ink-dark/10"
        >
          <div>
            <p className="font-medium text-ink dark:text-ink-dark">{formatDateDisplay(log.date)}</p>
            <p className="text-sm text-ink-soft dark:text-ink-soft-dark">{summarize(log)}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onEdit(log.date)}
              aria-label="Editar registro"
              className="text-ink-soft dark:text-ink-soft-dark"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleDelete(log.id, log.date)}
              aria-label="Borrar registro"
              className="text-warning-text dark:text-warning"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
              </svg>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
