interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  placeholder?: string;
  step?: string;
  min?: string;
  suffix?: string;
}

export function TextField({ label, value, onChange, type = 'text', placeholder, step, min, suffix }: TextFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-ink/80 dark:text-ink-dark/80">
      {label}
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          step={step}
          min={min}
          className="w-full rounded-xl border border-ink/20 bg-base px-3 py-2 text-ink dark:border-ink-dark/15 dark:bg-base-dark dark:text-ink-dark"
        />
        {suffix && <span className="shrink-0 text-sm text-ink-soft dark:text-ink-soft-dark">{suffix}</span>}
      </div>
    </label>
  );
}
