import { useRef } from 'react';

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
}

/** Input de fecha con un botón de calendario explícito — el indicador nativo del navegador no siempre responde al click. */
export function DateField({ label, value, onChange, min, max, required }: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <label className="flex flex-col gap-1 text-sm text-ink/80 dark:text-ink-dark/80">
      {label}
      <div className="relative">
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          min={min}
          max={max}
          required={required}
          className="date-input w-full rounded-xl border border-ink/20 bg-base px-3 py-2 pr-10 text-ink dark:border-ink-dark/15 dark:bg-base-dark dark:text-ink-dark"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.showPicker?.()}
          aria-label="Elegir fecha"
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-soft dark:text-ink-soft-dark"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18" />
          </svg>
        </button>
      </div>
    </label>
  );
}
