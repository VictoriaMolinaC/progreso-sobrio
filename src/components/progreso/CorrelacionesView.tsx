import { useLiveQuery } from 'dexie-react-hooks';
import { getDailyLogs, habitsRepo } from '../../db/repositories';
import { getInsights } from '../../lib/correlations';

export function CorrelacionesView() {
  const logs = useLiveQuery(() => getDailyLogs());
  const habits = useLiveQuery(() => habitsRepo.getActive()) ?? [];

  if (!logs) return null;

  const insights = getInsights(logs, habits);

  if (insights.length === 0) {
    return (
      <p className="text-center text-ink/60 dark:text-ink-dark/60">
        Todavía no hay suficientes registros variados para mostrar patrones. Sigue registrando y vuelve más adelante.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink/50 dark:text-ink-dark/50">
        Observaciones simples sobre tus propios registros, no son un diagnóstico ni un consejo médico.
      </p>
      <ul className="flex flex-col gap-2">
        {insights.map((insight) => (
          <li
            key={insight.text}
            className="shadow-[0_2px_8px_rgba(62,58,54,0.08)] dark:shadow-none rounded-xl border border-ink/15 px-4 py-3 text-sm text-ink dark:border-ink-dark/10 dark:text-ink-dark"
          >
            {insight.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
