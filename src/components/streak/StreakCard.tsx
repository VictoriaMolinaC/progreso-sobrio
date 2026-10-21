import { Ribbon } from '../layout/Decor';

interface StreakCardProps {
  substanceName: string;
  streakDays: number;
}

export function StreakCard({ substanceName, streakDays }: StreakCardProps) {
  return (
    <div className="paper-card relative w-full p-6 text-center">
      <Ribbon />
      <p className="mb-4 text-eyebrow font-semibold tracking-eyebrow text-secondary-text uppercase dark:text-secondary-text-dark">
        {substanceName}
      </p>

      {/* Burbuja miel con ícono tinta: el ámbar con ícono blanco no llegaba a 3:1. */}
      <div className="blob-shape mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-blob-honey text-ink dark:bg-accent/20 dark:text-ink-dark">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1-.5-2-1-3 1 0 2 1 2 3a7 7 0 1 1-14 0c0-4 3-5 4-9 1 1 2 1 3 2Z" />
        </svg>
      </div>

      <p className="text-ink dark:text-ink-dark">
        <span className="block text-5xl leading-none font-light">{streakDays}</span>
        <span className="mt-2 block text-lg font-semibold">{streakDays === 1 ? 'día' : 'días'} de racha</span>
      </p>
      <p className="mt-1 text-success-text dark:text-success">Sigues firme. Un día a la vez.</p>
    </div>
  );
}
