import type { Scale1to5 } from '../../db/types';

interface ScaleSelectorProps {
  label: string;
  value: Scale1to5 | undefined;
  onChange: (value: Scale1to5) => void;
}

export function ScaleSelector({ label, value, onChange }: ScaleSelectorProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-ink/80 dark:text-ink-dark/80">{label}</span>
      <div className="flex gap-2">
        {([1, 2, 3, 4, 5] as const).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={value === n}
            className={`h-10 w-10 rounded-full border text-sm font-medium transition-colors ${
              value === n
                ? 'border-primary-button bg-primary-button text-white'
                : 'border-ink/20 text-ink-soft dark:border-ink-dark/15 dark:text-ink-soft-dark'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
