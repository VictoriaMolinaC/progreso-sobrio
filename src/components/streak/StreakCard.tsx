interface StreakCardProps {
  substanceName: string;
  streakDays: number;
}

export function StreakCard({ substanceName, streakDays }: StreakCardProps) {
  return (
    <div className="w-full max-w-sm shadow-[0_2px_8px_rgba(62,58,54,0.08)] dark:shadow-none rounded-2xl bg-ink/[0.03] p-6 text-center dark:bg-ink-dark/[0.05]">
      <p className="mb-3 text-sm font-medium text-ink-soft dark:text-ink-soft-dark">{substanceName}</p>

      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1-.5-2-1-3 1 0 2 1 2 3a7 7 0 1 1-14 0c0-4 3-5 4-9 1 1 2 1 3 2Z" />
        </svg>
      </div>

      <p className="text-3xl font-bold text-ink dark:text-ink-dark">
        {streakDays} {streakDays === 1 ? 'día' : 'días'} de racha
      </p>
      <p className="mt-1 text-success-text dark:text-success">Sigues firme. Un día a la vez.</p>
    </div>
  );
}
