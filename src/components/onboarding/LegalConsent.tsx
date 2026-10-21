import { useState } from 'react';
import type { Theme } from '../../app/theme';
import { Ribbon } from '../layout/Decor';
import { LegalLinks } from '../layout/LegalLinks';
import { ThemeToggle } from '../layout/ThemeToggle';

interface LegalConsentProps {
  /** true si ya había aceptado una versión anterior: el texto cuenta que hubo cambios. */
  updated: boolean;
  onAccept: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

/**
 * Lectura de la política y aceptación de los términos, entre la puerta de edad
 * y el tour. Quien ya usaba la app la ve una vez, y de nuevo cada vez que sube
 * la versión de alguno de los dos textos: es lo que promete la política, que
 * los cambios importantes se avisan en la app.
 *
 * La política se lee y los términos se aceptan: la política informa, el
 * acuerdo está en los términos.
 */
export function LegalConsent({ updated, onAccept, theme, onToggleTheme }: LegalConsentProps) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-mist-fade p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
      <div className="paper-card relative w-full max-w-sm p-6">
        <Ribbon />
        <div className="blob-shape mb-4 flex h-14 w-14 items-center justify-center bg-blob-sage text-primary-text dark:bg-primary/20 dark:text-primary-text-dark">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="5" y="3" width="14" height="18" rx="2" />
            <path d="M9 8h6M9 12h6M9 16h3" />
          </svg>
        </div>
        <p className="text-eyebrow font-semibold tracking-eyebrow text-secondary-text uppercase dark:text-secondary-text-dark">
          {updated ? 'Actualización' : 'Antes de empezar'}
        </p>
        <h1 className="mt-1 text-xl font-semibold text-ink dark:text-ink-dark">
          {updated ? 'Actualizamos los términos o la política' : 'Términos y privacidad'}
        </h1>
        <p className="mt-3 text-sm text-ink dark:text-ink-dark">
          {updated
            ? 'Cambiaron los Términos de uso o la Política de privacidad. Al final de cada uno está el historial de versiones, con lo que cambió.'
            : 'Lo que anotas en Progreso Sobrio es información de salud. Antes de empezar, lee cómo funciona la app y cómo se cuidan tus datos.'}
        </p>

        <div className="mt-4">
          <LegalLinks />
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-ink dark:text-ink-dark">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-primary-button"
          />
          Leí la Política de privacidad y acepto los Términos de uso.
        </label>

        <button
          type="button"
          onClick={onAccept}
          disabled={!checked}
          className="mt-5 min-h-13 w-full rounded-full bg-primary-button px-6 text-base font-semibold text-white shadow-soft hover:bg-primary-text disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          Continuar
        </button>
        <p className="mt-3 text-center text-sm text-ink-soft dark:text-ink-soft-dark">
          Puedes volver a leerlos cuando quieras en Ajustes.
        </p>
      </div>
    </div>
  );
}
