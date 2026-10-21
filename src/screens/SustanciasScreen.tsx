import { useLiveQuery } from 'dexie-react-hooks';
import { type FormEvent, useState } from 'react';
import { DateField } from '../components/forms/DateField';
import { SubstanceRow } from '../components/substances/SubstanceRow';
import { addSubstance, getSubstances } from '../db/repositories';
import { toDateKey } from '../lib/dates';

export function SustanciasScreen() {
  const substances = useLiveQuery(() => getSubstances());
  const today = toDateKey(new Date());
  const [name, setName] = useState('');
  const [lastUseDate, setLastUseDate] = useState(today);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || !lastUseDate) return;

    await addSubstance({ name: trimmedName, lastUseDate });
    setName('');
    setLastUseDate(today);
  };

  return (
    <div className="px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold text-ink dark:text-ink-dark">Sustancias</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-6 flex flex-col gap-3 shadow-[0_2px_8px_rgba(62,58,54,0.08)] dark:shadow-none rounded-2xl bg-ink/[0.03] p-4 dark:bg-ink-dark/[0.05]"
      >
        <label className="flex flex-col gap-1 text-sm text-ink/80 dark:text-ink-dark/80">
          Nombre
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej: Alcohol, Tabaco, Cannabis"
            required
            className="rounded-xl border border-ink/20 bg-base px-3 py-2 text-ink dark:border-ink-dark/15 dark:bg-base-dark dark:text-ink-dark"
          />
        </label>

        <DateField label="Última vez" value={lastUseDate} onChange={setLastUseDate} max={today} required />

        <button
          type="submit"
          className="rounded-full bg-primary-button px-4 py-2 text-sm font-medium text-white hover:bg-primary-text"
        >
          Agregar sustancia
        </button>
      </form>

      {substances && substances.length > 0 && (
        <ul className="flex flex-col gap-2">
          {substances.map((substance) => (
            <SubstanceRow key={substance.id} substance={substance} />
          ))}
        </ul>
      )}

      {substances && substances.length === 0 && (
        <p className="text-center text-ink-soft dark:text-ink-soft-dark">Todavía no agregaste ninguna sustancia.</p>
      )}
    </div>
  );
}
