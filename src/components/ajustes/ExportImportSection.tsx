import { type ChangeEvent, useRef, useState } from 'react';
import { exportCsv, exportJson, exportWithMessage, readBackup, restoreBackup } from '../../lib/exportImport';

export function ExportImportSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = async (run: () => Promise<string>) => {
    setMessage(await exportWithMessage(run));
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    try {
      // Primero se revisa el archivo: si no es un respaldo, se avisa sin preguntar por reemplazar nada.
      const backup = await readBackup(file);

      const confirmed = window.confirm(
        `Restaurar "${file.name}" va a REEMPLAZAR todos tus datos actuales (sustancias, registros, contactos, listas) por los del respaldo. Esto no se puede deshacer. ¿Continuar?`,
      );
      if (!confirmed) {
        setMessage('Restauración cancelada — no se cambió nada.');
        return;
      }

      const summary = await restoreBackup(backup);
      setMessage(
        `Restaurado desde "${file.name}": ${summary.substances} sustancia(s), ${summary.dailyLogs} registro(s) diario(s), ${summary.contacts} contacto(s), ${summary.habits} hábito(s) y ${summary.triggers} disparador(es).`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo restaurar el archivo.');
    } finally {
      // Se limpia recién acá para poder volver a elegir el mismo archivo después.
      input.value = '';
    }
  };

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-ink dark:text-ink-dark">Respaldar y restaurar mis datos</h2>
      <p className="mb-3 text-sm text-ink/60 dark:text-ink-dark/60">
        Tus datos viven solo en este navegador. Descarga un respaldo seguido para no perderlos.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleExport(exportJson)}
          className="rounded-xl border border-ink/20 px-4 py-2 text-sm text-ink dark:border-ink-dark/15 dark:text-ink-dark"
        >
          Descargar respaldo completo
        </button>
        <button
          type="button"
          onClick={() => handleExport(exportCsv)}
          className="rounded-xl border border-ink/20 px-4 py-2 text-sm text-ink dark:border-ink-dark/15 dark:text-ink-dark"
        >
          Descargar mis registros (para Excel o Sheets)
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl border border-warning/40 px-4 py-2 text-sm text-warning"
        >
          Restaurar un respaldo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {message && <p className="mt-2 text-sm text-ink/70 dark:text-ink-dark/70">{message}</p>}
    </section>
  );
}
