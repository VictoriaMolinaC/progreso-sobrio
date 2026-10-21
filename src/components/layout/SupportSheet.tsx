import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { getContacts } from '../../db/repositories';
import { SENDA_CONTACT } from '../../lib/constants';

interface SupportSheetProps {
  open: boolean;
  onClose: () => void;
}

export function SupportSheet({ open, onClose }: SupportSheetProps) {
  const contacts = useLiveQuery(() => getContacts());

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-2xl bg-base p-5 dark:bg-base-dark"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-ink dark:text-ink-dark">Red de apoyo</h2>

        <a
          href={`tel:${SENDA_CONTACT.phone}`}
          className="mb-3 flex items-center justify-between rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3"
        >
          <span>
            <span className="block font-medium text-secondary-text dark:text-secondary-text-dark">{SENDA_CONTACT.name}</span>
            <span className="block text-sm text-secondary-text dark:text-secondary-text-dark">{SENDA_CONTACT.description}</span>
          </span>
          <span className="text-lg font-semibold text-secondary-text dark:text-secondary-text-dark">{SENDA_CONTACT.phone}</span>
        </a>

        {contacts && contacts.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {contacts.map((contact) => (
              <li key={contact.id} className="shadow-[0_2px_8px_rgba(62,58,54,0.08)] dark:shadow-none rounded-xl border border-ink/15 px-4 py-3 dark:border-ink-dark/10">
                {contact.phone ? (
                  <a href={`tel:${contact.phone}`} className="flex items-center justify-between">
                    <span>
                      <span className="block font-medium text-ink dark:text-ink-dark">{contact.name}</span>
                      {contact.relationship && (
                        <span className="block text-sm text-ink-soft dark:text-ink-soft-dark">{contact.relationship}</span>
                      )}
                    </span>
                    <span className="text-sm font-medium text-ink dark:text-ink-dark">{contact.phone}</span>
                  </a>
                ) : (
                  <div>
                    <span className="block font-medium text-ink dark:text-ink-dark">{contact.name}</span>
                    {contact.relationship && (
                      <span className="block text-sm text-ink-soft dark:text-ink-soft-dark">{contact.relationship}</span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-soft dark:text-ink-soft-dark">
            Tus propios contactos de apoyo van a aparecer aquí una vez que los agregues en Ajustes.
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl border border-ink/20 py-2 text-ink/80 dark:border-ink-dark/15 dark:text-ink-dark/80"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
