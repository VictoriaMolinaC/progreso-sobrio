import { useLiveQuery } from 'dexie-react-hooks';
import { DemoDataBanner } from '../components/inicio/DemoDataBanner';
import { Blob } from '../components/layout/Decor';
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
    <div className="relative flex flex-col gap-6 px-4 py-6">
      {/* A la derecha del título, que es corto: nunca detrás de texto. */}
      <Blob shape="sage" className="top-2 right-3 w-24 text-blob-sage dark:text-primary/20" />
      <Blob shape="honey" className="top-16 right-24 w-8 text-blob-honey dark:text-accent/20" />

      <ScreenTitle eyebrow={formatLongDate(new Date())} title="Inicio" className="relative" />

      <DemoDataBanner onGoToAjustes={onGoToAjustes} />

      {substances && substances.length > 0 && (
        <div className="flex flex-col gap-4">
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
        <p className="text-ink-soft dark:text-ink-soft-dark">
          Todavía no agregaste ninguna sustancia. Vas a poder hacerlo desde Sustancias.
        </p>
      )}

      <button
        type="button"
        onClick={onRegistrarHoy}
        className="min-h-13 w-full rounded-full bg-primary-button px-6 text-base font-semibold text-white shadow-soft hover:bg-primary-text"
      >
        Registrar hoy
      </button>
    </div>
  );
}
