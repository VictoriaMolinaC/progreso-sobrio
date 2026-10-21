import { useLiveQuery } from 'dexie-react-hooks';
import { getDailyLogs, habitsRepo } from '../../db/repositories';
import { getHabitStreak } from '../../lib/habitStreaks';

export function HabitStreaksView() {
  const habits = useLiveQuery(() => habitsRepo.getActive());
  const logs = useLiveQuery(() => getDailyLogs());

  if (!habits || !logs) return null;

  if (habits.length === 0) {
    return (
      <p className="text-center text-ink-soft dark:text-ink-soft-dark">
        Todavía no hay hábitos cargados. Vas a poder agregarlos desde Ajustes.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {habits.map((habit) => {
        const streak = getHabitStreak(habit.id, logs);
        return (
          <li
            key={habit.id}
            className="paper-card flex items-center justify-between gap-3 px-4 py-3"
          >
            <span className="font-medium text-ink dark:text-ink-dark">{habit.name}</span>
            <span className="text-sm font-medium text-success-text dark:text-success">
              {streak} {streak === 1 ? 'día seguido' : 'días seguidos'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
