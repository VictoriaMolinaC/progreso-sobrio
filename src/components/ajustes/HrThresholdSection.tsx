import { type FormEvent, useEffect, useState } from 'react';
import { getHrThreshold, setHrThreshold } from '../../db/repositories';

export function HrThresholdSection() {
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getHrThreshold().then((threshold) => setValue(String(threshold)));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const num = Number(value);
    if (!value.trim() || Number.isNaN(num) || num <= 0) return;

    await setHrThreshold(num);
    setSaved(true);
  };

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-ink dark:text-ink-dark">Umbral de LPM en reposo</h2>
      <p className="mb-3 text-sm text-ink-soft dark:text-ink-soft-dark">
        Al guardar un registro diario, Progreso Sobrio compara tu LPM en reposo contra este valor y te avisa si lo superaste. No
        es un valor médico, es una referencia que eliges tú.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="number"
          min="1"
          aria-label="Umbral de LPM en reposo"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setSaved(false);
          }}
          className="w-24 rounded-xl border border-ink/20 bg-base px-3 py-2 text-ink dark:border-ink-dark/15 dark:bg-base-dark dark:text-ink-dark"
        />
        <button
          type="submit"
          className="rounded-xl bg-primary-button px-4 py-2 text-sm font-medium text-white hover:bg-primary-text"
        >
          Guardar
        </button>
      </form>

      {saved && <p className="mt-2 text-sm text-success-text dark:text-success">Guardado ✓</p>}
    </section>
  );
}
