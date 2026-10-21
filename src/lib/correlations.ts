import type { DailyLog, Scale1to5 } from '../db/types';

const average = (nums: number[]) => nums.reduce((a, b) => a + b, 0) / nums.length;

const hasCraving = (log: DailyLog): log is DailyLog & { craving: Scale1to5 } => log.craving !== undefined;

/**
 * Compara las ansias promedio (campo `craving`) entre días que cumplen una condición y días
 * que no. Devuelve null si no hay al menos 2 registros de cada lado —
 * comparar contra un solo día no dice nada confiable. Los días sin ansias
 * anotadas no cuentan para ningún lado.
 */
export function compareCravingByCondition(logs: DailyLog[], predicate: (log: DailyLog) => boolean) {
  const rated = logs.filter(hasCraving);
  const withLogs = rated.filter(predicate);
  const withoutLogs = rated.filter((log) => !predicate(log));
  if (withLogs.length < 2 || withoutLogs.length < 2) return null;

  return {
    withAvg: average(withLogs.map((log) => log.craving)),
    withoutAvg: average(withoutLogs.map((log) => log.craving)),
  };
}

export interface Insight {
  text: string;
}

interface Habit {
  id: number;
  name: string;
}

/** Observaciones simples en lenguaje llano — descriptivas, nunca un diagnóstico. */
export function getInsights(logs: DailyLog[], habits: Habit[]): Insight[] {
  const insights: Insight[] = [];

  const exercise = compareCravingByCondition(logs, (log) => (log.activityMinutes ?? 0) > 0);
  if (exercise) {
    insights.push({
      text: `Los días que hiciste actividad física, tus ansias fueron de ${exercise.withAvg.toFixed(1)} en promedio (vs ${exercise.withoutAvg.toFixed(1)} los días que no).`,
    });
  }

  // Un día sin calidad de sueño anotada no es de buen ni de mal sueño: queda fuera.
  const goodSleep = compareCravingByCondition(
    logs.filter((log) => log.sleepQuality !== undefined),
    (log) => (log.sleepQuality ?? 0) >= 4,
  );
  if (goodSleep) {
    insights.push({
      text: `Los días que dormiste mejor, tus ansias fueron de ${goodSleep.withAvg.toFixed(1)} en promedio (vs ${goodSleep.withoutAvg.toFixed(1)} los días que dormiste peor).`,
    });
  }

  for (const habit of habits) {
    const comparison = compareCravingByCondition(logs, (log) => log.habitIds.includes(habit.id));
    if (comparison) {
      insights.push({
        text: `Los días que cumpliste "${habit.name}", tus ansias fueron de ${comparison.withAvg.toFixed(1)} en promedio (vs ${comparison.withoutAvg.toFixed(1)} los días que no).`,
      });
    }
  }

  return insights;
}
