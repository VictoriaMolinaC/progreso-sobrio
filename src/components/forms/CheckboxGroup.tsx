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
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-ink/80 dark:text-ink-dark/80">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = selectedIds.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option.id)}
              aria-pressed={selected}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                selected
                  ? 'border-primary-button bg-primary-button text-white'
                  : 'border-ink/20 text-ink-soft dark:border-ink-dark/15 dark:text-ink-soft-dark'
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
