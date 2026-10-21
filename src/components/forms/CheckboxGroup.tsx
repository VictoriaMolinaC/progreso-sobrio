import { useId } from 'react';

interface CheckboxGroupOption {
  id: number;
  name: string;
}

interface CheckboxGroupProps {
  label: string;
  options: CheckboxGroupOption[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}

export function CheckboxGroup({ label, options, selectedIds, onToggle }: CheckboxGroupProps) {
  const labelId = useId();

  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-1">
      <span id={labelId} className="text-sm text-ink-soft dark:text-ink-soft-dark">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = selectedIds.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option.id)}
              aria-pressed={selected}
              className={`min-h-10 rounded-full border px-4 text-sm transition-colors ${
                selected
                  ? 'border-primary-button bg-primary-button font-semibold text-white'
                  : 'border-ink/20 bg-base text-ink-soft hover:border-primary dark:border-ink-dark/15 dark:bg-base-dark dark:text-ink-soft-dark'
              }`}
            >
              {option.name}
            </button>
          );
        })}
        {options.length === 0 && (
          <span className="text-sm text-ink-soft dark:text-ink-soft-dark">Todavía no hay ninguno cargado.</span>
        )}
      </div>
    </div>
  );
}
