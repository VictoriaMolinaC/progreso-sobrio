import { useLiveQuery } from 'dexie-react-hooks';
import { type FormEvent, useState } from 'react';
import { addContact, getContacts } from '../../db/repositories';
import { ContactRow } from './ContactRow';

export function ContactsSection() {
  const contacts = useLiveQuery(() => getContacts());
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    await addContact({
      name: trimmedName,
      phone: phone.trim() || undefined,
      relationship: relationship.trim() || undefined,
    });
    setName('');
    setPhone('');
    setRelationship('');
  };

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-ink dark:text-ink-dark">Contactos de apoyo</h2>

      <form
        onSubmit={handleSubmit}
        className="mb-4 flex flex-col gap-3 shadow-[0_2px_8px_rgba(62,58,54,0.08)] dark:shadow-none rounded-2xl bg-ink/[0.03] p-4 dark:bg-ink-dark/[0.05]"
      >
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="rounded-xl border border-ink/20 bg-base px-3 py-2 text-ink dark:border-ink-dark/15 dark:bg-base-dark dark:text-ink-dark"
        />
        <input
          type="tel"
          placeholder="Teléfono (opcional)"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="rounded-xl border border-ink/20 bg-base px-3 py-2 text-ink dark:border-ink-dark/15 dark:bg-base-dark dark:text-ink-dark"
        />
        <input
          type="text"
          placeholder="Relación, ej: hermana, terapeuta (opcional)"
          value={relationship}
          onChange={(event) => setRelationship(event.target.value)}
          className="rounded-xl border border-ink/20 bg-base px-3 py-2 text-ink dark:border-ink-dark/15 dark:bg-base-dark dark:text-ink-dark"
        />
        <button
          type="submit"
          className="rounded-full bg-primary-button px-4 py-2 text-sm font-medium text-white hover:bg-primary-text"
        >
          Agregar contacto
        </button>
      </form>

      {contacts && contacts.length > 0 && (
        <ul className="flex flex-col gap-2">
          {contacts.map((contact) => (
            <ContactRow key={contact.id} contact={contact} />
          ))}
        </ul>
      )}
      {contacts && contacts.length === 0 && (
        <p className="text-center text-ink-soft dark:text-ink-soft-dark">Todavía no agregaste contactos.</p>
      )}
    </section>
  );
}
