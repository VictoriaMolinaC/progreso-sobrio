import { useState } from 'react';
import { exportJson, exportWithMessage } from '../../lib/exportImport';
import { deleteAllData } from '../../lib/resetData';

const CONFIRM_WORD = 'BORRAR';

export function ResetDataSection() {
  const [confirmText, setConfirmText] = useState('');
  const [deleted, setDeleted] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const canDelete = confirmText.trim().toUpperCase() === CONFIRM_WORD;

  const handleDelete = async () => {
    if (!canDelete) return;
    await deleteAllData();
    setConfirmText('');
    setDeleted(true);
  };

  return (
    <section
      id="borrar-datos"
      className="scroll-mt-20 rounded-2xl border border-warning/30 p-4 shadow-[0_2px_8px_rgba(62,58,54,0.08)] dark:shadow-none"
    >
      <h2 className="mb-3 text-lg font-semibold text-ink dark:text-ink-dark">Borrar todos mis datos</h2>

      <p className="mb-3 text-sm text-ink/70 dark:text-ink-dark/70">
        Borra tus sustancias, registros diarios, contactos, hábitos y disparadores, incluidos los datos de ejemplo
        que vienen precargados. La app queda vacía para que empieces de cero. <strong>No se puede deshacer.</strong>
      </p>

      <button
        type="button"
        onClick={async () => setExportMessage(await exportWithMessage(exportJson))}
        className="mb-4 rounded-xl border border-ink/20 px-4 py-2 text-sm text-ink dark:border-ink-dark/15 dark:text-ink-dark"
      >
        Descargar un respaldo antes
      </button>

      {exportMessage && <p className="-mt-2 mb-4 text-sm text-ink/70 dark:text-ink-dark/70">{exportMessage}</p>}

      <label className="mb-2 flex flex-col gap-1 text-sm text-ink/80 dark:text-ink-dark/80">
        Para confirmar, escribe <strong>{CONFIRM_WORD}</strong>
        <input
          type="text"
          value={confirmText}
          onChange={(event) => {
            setConfirmText(event.target.value);
            setDeleted(false);
          }}
          className="rounded-xl border border-ink/20 bg-base px-3 py-2 text-ink dark:border-ink-dark/15 dark:bg-base-dark dark:text-ink-dark"
        />
      </label>

      <button
        type="button"
        onClick={handleDelete}
        disabled={!canDelete}
        className="w-full rounded-full bg-warning px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Borrar todo y empezar de cero
      </button>

      {deleted && <p className="mt-2 text-sm text-success">Listo. La app quedó vacía.</p>}
    </section>
  );
}
