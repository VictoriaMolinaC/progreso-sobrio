import { useLiveQuery } from 'dexie-react-hooks';
import { getLegalAcceptance } from '../../db/repositories';
import { formatDateDisplay, toDateKey } from '../../lib/dates';
import { LegalLinks } from '../layout/LegalLinks';

/**
 * Los textos legales a mano desde la app, y cuándo se aceptaron. Las versiones
 * aceptadas siempre son las vigentes: si no, la app habría vuelto a pedirlas
 * antes de llegar aquí.
 */
export function LegalSection() {
  const acceptance = useLiveQuery(() => getLegalAcceptance());

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-ink dark:text-ink-dark">Privacidad y términos</h2>
      {acceptance && (
        <p className="mb-3 text-sm text-ink-soft dark:text-ink-soft-dark">
          El {formatDateDisplay(toDateKey(new Date(acceptance.acceptedAt)))} marcaste que leíste la Política de
          privacidad y aceptaste los Términos de uso.
        </p>
      )}
      <LegalLinks />
    </section>
  );
}
