import { type FormEvent, useState } from 'react';
import { DateField } from '../forms/DateField';
import { deleteSubstance, updateSubstance } from '../../db/repositories';
import type { Substance } from '../../db/types';
import { formatDateDisplay, toDateKey } from '../../lib/dates';
import { getStreakDays } from '../../lib/streak';

interface SubstanceRowProps {
  substance: Substance;
}

export function SubstanceRow({ substance }: SubstanceRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(substance.name);
  const [lastUseDate, setLastUseDate] = useState(substance.lastUseDate);
  const today = toDateKey(new Date());

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || !lastUseDate) return;

    await updateSubstance(substance.id, { name: trimmedName, lastUseDate });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `¿Borrar "${substance.name}"? Se pierde la racha asociada a esta sustancia.`,
    );
    if (!confirmed) return;
    await deleteSubstance(substance.id);
  };

  if (isEditing) {
    return (
      <li>
        <form
          onSubmit={handleSave}
          className="flex flex-col gap-3 shadow-[0_2px_8px_rgba(62,58,54,0.08)] dark:shadow-none rounded-xl border border-ink/15 p-4 dark:border-ink-dark/10"
        >
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="rounded-xl border border-ink/20 bg-base px-3 py-2 text-ink dark:border-ink-dark/15 dark:bg-base-dark dark:text-ink-dark"
          />
          <DateField label="Última vez" value={lastUseDate} onChange={setLastUseDate} max={today} required />

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 rounded-full border border-ink/20 px-4 py-2 text-sm text-ink/80 dark:border-ink-dark/15 dark:text-ink-dark/80"
            >
              Cancelar
            </button>
          </div>

          <button 
            type="button"
            onClick={handleDelete} 
            className="mt-2 w-full rounded-xl border border-red-300 bg-transparent px-4 py-3 text-sm font-medium text-warning transition-colors hover:bg-warning/10 dark:border-red-400/40 dark:text-warning dark:hover:bg-warning/10"
            >
            Eliminar sustancia
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between shadow-[0_2px_8px_rgba(62,58,54,0.08)] dark:shadow-none rounded-xl border border-ink/15 px-4 py-3 dark:border-ink-dark/10">
      <div>
        <p className="font-medium text-ink dark:text-ink-dark">{substance.name}</p>
        <p className="text-sm text-ink/60 dark:text-ink-dark/60">
          Última vez: {formatDateDisplay(substance.lastUseDate)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-primary">{getStreakDays(substance.lastUseDate)} días</span>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          aria-label="Editar sustancia"
          className="text-ink/60 dark:text-ink-dark/60"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
      </div>
    </li>
  );
}
