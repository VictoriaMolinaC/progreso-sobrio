import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef } from 'react';
import { getContacts } from '../../db/repositories';
import { SENDA_CONTACT } from '../../lib/constants';

interface SupportSheetProps {
  open: boolean;
  onClose: () => void;
}

const CALL_PATH = 'M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z';

function CallIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={CALL_PATH} />
    </svg>
  );
}

export function SupportSheet({ open, onClose }: SupportSheetProps) {
  const contacts = useLiveQuery(() => getContacts());
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="red-de-apoyo-titulo"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card p-5 pb-6 shadow-high dark:bg-base-dark"
        onClick={(event) => event.stopPropagation()}
      >
        <span aria-hidden="true" className="mx-auto mb-4 block h-1 w-10 rounded-full bg-ink/15 dark:bg-ink-dark/20" />
        <p className="text-eyebrow font-semibold tracking-eyebrow text-secondary-text uppercase dark:text-secondary-text-dark">
          Siempre a mano
        </p>
        <h2 id="red-de-apoyo-titulo" className="mt-1 mb-4 text-title leading-tight font-light text-ink dark:text-ink-dark">
          Red de apoyo
        </h2>

        {/* La línea 1412 con el aviso cálido del sitio (.crisis): su texto y su número no se cambian. */}
        <a
          href={`tel:${SENDA_CONTACT.phone}`}
          className="mb-4 flex items-center justify-between gap-3 rounded-[4px_16px_16px_4px] border border-l-[3px] border-secondary-text/20 border-l-secondary bg-secondary-soft px-4 py-3 dark:border-secondary/30 dark:border-l-secondary dark:bg-secondary/15"
        >
          <span>
            <span className="block font-semibold text-secondary-text dark:text-secondary-text-dark">{SENDA_CONTACT.name}</span>
            <span className="block text-sm text-ink dark:text-ink-dark">{SENDA_CONTACT.description}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5 text-lg font-semibold text-secondary-text dark:text-secondary-text-dark">
            <CallIcon />
            {SENDA_CONTACT.phone}
          </span>
        </a>

        {contacts && contacts.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {contacts.map((contact) => (
              <li key={contact.id} className="paper-card px-4 py-3">
                {contact.phone ? (
                  <a href={`tel:${contact.phone}`} className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block font-semibold text-ink dark:text-ink-dark">{contact.name}</span>
                      {contact.relationship && (
                        <span className="block text-sm text-ink-soft dark:text-ink-soft-dark">{contact.relationship}</span>
                      )}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary-text dark:text-primary-text-dark">
                      <CallIcon />
                      {contact.phone}
                    </span>
                  </a>
                ) : (
                  <div>
                    <span className="block font-semibold text-ink dark:text-ink-dark">{contact.name}</span>
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
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="mt-5 min-h-12 w-full rounded-full border-[1.5px] border-primary bg-card font-semibold text-primary-text hover:bg-primary-soft dark:bg-transparent dark:text-primary-text-dark dark:hover:bg-primary/15"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
