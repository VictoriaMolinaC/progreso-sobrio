import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { getDailyLogs } from '../../db/repositories';
import { getMonthGrid } from '../../lib/calendar';
import { toDateKey } from '../../lib/dates';

interface CalendarViewProps {
  onSelectDate: (date: string) => void;
}

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function CalendarView({ onSelectDate }: CalendarViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const logs = useLiveQuery(() => getDailyLogs());
  const loggedDates = new Set((logs ?? []).map((log) => log.date));
  const todayKey = toDateKey(today);
  const days = getMonthGrid(year, month);

  const goToPrevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrevMonth}
          aria-label="Mes anterior"
          className="rounded-md p-2 text-ink/60 hover:bg-ink/5 dark:text-ink-dark/60 dark:hover:bg-ink-dark/10"
        >
          ‹
        </button>
        <span className="font-medium text-ink dark:text-ink-dark">
          {MONTH_LABELS[month]} {year}
        </span>
        <button
          type="button"
          onClick={goToNextMonth}
          aria-label="Mes siguiente"
          className="rounded-md p-2 text-ink/60 hover:bg-ink/5 dark:text-ink-dark/60 dark:hover:bg-ink-dark/10"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 pb-1 text-center text-xs text-ink/50 dark:text-ink-dark/50">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const hasLog = loggedDates.has(day.dateKey);
          const isToday = day.dateKey === todayKey;

          return (
            <button
              key={day.dateKey}
              type="button"
              disabled={!hasLog}
              onClick={() => onSelectDate(day.dateKey)}
              className={`aspect-square rounded-lg text-sm ${
                !day.inCurrentMonth ? 'text-ink/25 dark:text-ink-dark/25' : 'text-ink dark:text-ink-dark'
              } ${hasLog ? 'bg-primary/15 font-medium text-primary' : ''} ${isToday ? 'ring-2 ring-accent' : ''}`}
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-sm text-ink/50 dark:text-ink-dark/50">
        Los días marcados tienen un registro: tócalos para verlo.
      </p>
    </div>
  );
}
