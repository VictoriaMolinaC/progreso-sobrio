import { useId } from 'react';
import type { Scale1to5 } from '../../db/types';

interface ScaleSelectorProps {
  label: string;
  value: Scale1to5 | undefined;
  onChange: (value: Scale1to5) => void;
  /** Qué significan los extremos, bajo la escala (ej. "1 = nada · 5 = muchas"). */
  hint?: string;
}

export function ScaleSelector({ label, value, onChange, hint }: ScaleSelectorProps) {
  const labelId = useId();

  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-1">
      <span id={labelId} className="text-sm text-ink-soft dark:text-ink-soft-dark">
        {label}
      </span>
      {/* Los botones se reparten el ancho (hasta 56 px): nunca se cortan ni bajan de 44 px de toque. */}
      <div className="flex gap-2">
        {([1, 2, 3, 4, 5] as const).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={value === n}
            className={`h-11 max-w-14 min-w-11 flex-1 rounded-full border text-sm font-semibold transition-colors ${
              value === n
                ? 'border-primary-button bg-primary-button text-white'
                : 'border-ink/20 bg-base text-ink-soft hover:border-primary dark:border-ink-dark/15 dark:bg-base-dark dark:text-ink-soft-dark'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {hint && <span className="text-xs text-ink-soft dark:text-ink-soft-dark">{hint}</span>}
    </div>
  );
}
