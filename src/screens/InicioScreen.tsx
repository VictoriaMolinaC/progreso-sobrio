import { useLiveQuery } from 'dexie-react-hooks';
import { DemoDataBanner } from '../components/inicio/DemoDataBanner';
import { ScreenTitle } from '../components/layout/ScreenTitle';
import { StreakCard } from '../components/streak/StreakCard';
import { getSubstances } from '../db/repositories';
import { formatLongDate } from '../lib/dates';
import { getStreakDays } from '../lib/streak';

interface InicioScreenProps {
  onRegistrarHoy: () => void;
  onGoToAjustes: () => void;
}

export function InicioScreen({ onRegistrarHoy, onGoToAjustes }: InicioScreenProps) {
  const substances = useLiveQuery(() => getSubstances());

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6">
      <ScreenTitle eyebrow={formatLongDate(new Date())} title="Inicio" className="w-full" />

      <DemoDataBanner onGoToAjustes={onGoToAjustes} />

      {substances && substances.length > 0 && (
        <div className="flex w-full flex-col items-center gap-4">
          {substances.map((substance) => (
            <StreakCard
              key={substance.id}
              substanceName={substance.name}
              streakDays={getStreakDays(substance.lastUseDate)}
            />
          ))}
        </div>
      )}

      {substances && substances.length === 0 && (
        <p className="text-center text-ink-soft dark:text-ink-soft-dark">
          Todavía no agregaste ninguna sustancia. Vas a poder hacerlo desde Sustancias.
        </p>
      )}

      <button
        type="button"
        onClick={onRegistrarHoy}
        className="rounded-full bg-primary-button px-6 py-3 text-base font-medium text-white hover:bg-primary-text"
      >
        Registrar hoy
      </button>
    </div>
  );
}
