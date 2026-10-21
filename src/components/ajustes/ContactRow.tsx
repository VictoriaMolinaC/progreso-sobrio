import { type FormEvent, useState } from 'react';
import { deleteContact, updateContact } from '../../db/repositories';
import type { Contact } from '../../db/types';

interface ContactRowProps {
  contact: Contact;
}

export function ContactRow({ contact }: ContactRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(contact.name);
  const [phone, setPhone] = useState(contact.phone ?? '');
  const [relationship, setRelationship] = useState(contact.relationship ?? '');

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    await updateContact(contact.id, {
      name: trimmedName,
      phone: phone.trim() || undefined,
      relationship: relationship.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`¿Borrar el contacto "${contact.name}"?`);
    if (!confirmed) return;
    await deleteContact(contact.id);
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
            placeholder="Nombre"
            required
            className="rounded-xl border border-ink/20 bg-base px-3 py-2 text-ink dark:border-ink-dark/15 dark:bg-base-dark dark:text-ink-dark"
          />
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Teléfono"
            className="rounded-xl border border-ink/20 bg-base px-3 py-2 text-ink dark:border-ink-dark/15 dark:bg-base-dark dark:text-ink-dark"
          />
          <input
            type="text"
            value={relationship}
            onChange={(event) => setRelationship(event.target.value)}
            placeholder="Relación, ej: hermana, terapeuta"
            className="rounded-xl border border-ink/20 bg-base px-3 py-2 text-ink dark:border-ink-dark/15 dark:bg-base-dark dark:text-ink-dark"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-full bg-primary-button px-4 py-2 text-sm font-medium text-white hover:bg-primary-text"
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

          <button type="button" onClick={handleDelete} className="text-sm text-warning-text dark:text-warning">
            Eliminar contacto
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between shadow-[0_2px_8px_rgba(62,58,54,0.08)] dark:shadow-none rounded-xl border border-ink/15 px-4 py-3 dark:border-ink-dark/10">
      <div>
        <p className="font-medium text-ink dark:text-ink-dark">{contact.name}</p>
        <p className="text-sm text-ink-soft dark:text-ink-soft-dark">
          {[contact.relationship, contact.phone].filter(Boolean).join(' · ') || 'Sin datos adicionales'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        aria-label="Editar contacto"
        className="text-ink-soft dark:text-ink-soft-dark"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>
    </li>
  );
}
