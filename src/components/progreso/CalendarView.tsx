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
    <div className="paper-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrevMonth}
          aria-label="Mes anterior"
          className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-ink-soft hover:bg-ink/5 dark:text-ink-soft-dark dark:hover:bg-ink-dark/10"
        >
          ‹
        </button>
        <span className="font-semibold text-ink dark:text-ink-dark">
          {MONTH_LABELS[month]} {year}
        </span>
        <button
          type="button"
          onClick={goToNextMonth}
          aria-label="Mes siguiente"
          className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-ink-soft hover:bg-ink/5 dark:text-ink-soft-dark dark:hover:bg-ink-dark/10"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 pb-1 text-center text-xs text-ink-soft dark:text-ink-soft-dark">
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
              className={`aspect-square rounded-full text-sm ${
                !day.inCurrentMonth ? 'text-ink/25 dark:text-ink-dark/25' : 'text-ink dark:text-ink-dark'
              } ${hasLog ? 'bg-primary-soft font-semibold text-primary-text dark:bg-primary/20 dark:text-primary-text-dark' : ''} ${isToday ? 'ring-2 ring-secondary' : ''}`}
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-sm text-ink-soft dark:text-ink-soft-dark">
        Los días marcados tienen un registro: tócalos para verlo.
      </p>
    </div>
  );
}
