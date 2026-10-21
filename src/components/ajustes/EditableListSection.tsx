import { type FormEvent, useState } from 'react';
import type { ListItem } from '../../db/types';

interface EditableListSectionProps {
  title: string;
  items: ListItem[] | undefined;
  onAdd: (name: string) => Promise<unknown>;
  onRename: (id: number, name: string) => Promise<unknown>;
  onToggleActive: (id: number, active: boolean) => Promise<unknown>;
}

/**
 * Los ítems no se borran nunca acá — solo se desactivan/reactivan, porque
 * registros diarios pasados pueden seguir referenciándolos por id.
 */
export function EditableListSection({ title, items, onAdd, onRename, onToggleActive }: EditableListSectionProps) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    await onAdd(trimmed);
    setNewName('');
  };

  const startEditing = (item: ListItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const handleRename = async (event: FormEvent, id: number) => {
    event.preventDefault();
    const trimmed = editingName.trim();
    if (!trimmed) return;
    await onRename(id, trimmed);
    setEditingId(null);
  };

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-ink dark:text-ink-dark">{title}</h2>

      <form onSubmit={handleAdd} className="mb-3 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Agregar nuevo"
          className="flex-1 rounded-xl border border-ink/20 bg-base px-3 py-2 text-ink dark:border-ink-dark/15 dark:bg-base-dark dark:text-ink-dark"
        />
        <button
          type="submit"
          className="rounded-xl bg-primary-button px-4 py-2 text-sm font-medium text-white hover:bg-primary-text"
        >
          Agregar
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {(items ?? []).map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between shadow-[0_2px_8px_rgba(62,58,54,0.08)] dark:shadow-none rounded-xl border border-ink/15 px-4 py-2 dark:border-ink-dark/10"
          >
            {editingId === item.id ? (
              <form onSubmit={(event) => handleRename(event, item.id)} className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  autoFocus
                  className="flex-1 rounded-xl border border-ink/20 bg-base px-2 py-1 text-sm text-ink dark:border-ink-dark/15 dark:bg-base-dark dark:text-ink-dark"
                />
                <button type="submit" className="text-sm text-primary-text dark:text-primary-text-dark">
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="text-sm text-ink-soft dark:text-ink-soft-dark"
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <>
                <span
                  className={`text-sm ${
                    item.active ? 'text-ink dark:text-ink-dark' : 'text-ink-soft line-through dark:text-ink-soft-dark'
                  }`}
                >
                  {item.name}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => startEditing(item)}
                    aria-label="Renombrar"
                    className="text-ink-soft dark:text-ink-soft-dark"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleActive(item.id, !item.active)}
                    className="text-xs text-ink-soft dark:text-ink-soft-dark"
                  >
                    {item.active ? 'Desactivar' : 'Reactivar'}
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
        {items && items.length === 0 && (
          <p className="text-center text-sm text-ink-soft dark:text-ink-soft-dark">Todavía no hay ninguno.</p>
        )}
      </ul>
    </section>
  );
}
