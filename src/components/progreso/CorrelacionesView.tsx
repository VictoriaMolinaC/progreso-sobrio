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
      <p className="text-center text-ink-soft dark:text-ink-soft-dark">
        Todavía no hay suficientes registros variados para mostrar patrones. Sigue registrando y vuelve más adelante.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-soft dark:text-ink-soft-dark">
        Relaciones simples entre tus datos, en lenguaje llano. Nunca un diagnóstico.
      </p>
      <ul className="flex flex-col gap-2">
        {insights.map((insight) => (
          <li key={insight.text} className="paper-card flex items-start gap-3 px-4 py-3 text-sm text-ink dark:text-ink-dark">
            <span className="blob-shape flex h-9 w-9 shrink-0 items-center justify-center bg-blob-honey text-ink dark:bg-accent/20 dark:text-ink-dark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8v.3h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3Z" />
              </svg>
            </span>
            <span className="pt-1.5">{insight.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
