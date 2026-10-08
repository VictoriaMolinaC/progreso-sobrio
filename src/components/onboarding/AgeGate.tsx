import { useState } from 'react';
import type { Theme } from '../../app/theme';
import { SENDA_CONTACT } from '../../lib/constants';
import { ThemeToggle } from '../layout/ThemeToggle';

interface AgeGateProps {
  onConfirm: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

// Mismo trazo (24x24, stroke) que el resto de la app. El corazón es el mismo
// ícono y color que la tarjeta "Red de apoyo" del tour y que el botón
// flotante real: se repite a propósito cada vez que aparece la línea SENDA.
function Icon({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-white ${color}`}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </div>
  );
}

/**
 * Puerta de entrada: pide confirmar mayoría de edad antes de mostrar la app.
 * Es una autodeclaración, no una verificación.
 *
 * Quien declara ser menor no queda en un callejón sin salida: se le muestra la
 * línea 1412, que atiende a cualquier edad. Es una app de salud, negar la
 * entrada no puede significar negar la ayuda.
 */
export function AgeGate({ onConfirm, theme, onToggleTheme }: AgeGateProps) {
  const [underage, setUnderage] = useState(false);

  // El degradado va en sRGB sobre un fondo opaco a propósito: en oklab (el
  // default de Tailwind v4) el stop semitransparente se desatura y pasa por
  // gris, y sin color de fondo compondría contra el lienzo del navegador, que
  // sigue al sistema y no al tema elegido acá.
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-base bg-linear-to-b/srgb from-primary/20 via-base to-base p-4 dark:bg-base-dark dark:from-primary/25 dark:via-base-dark dark:to-base-dark">
      <div className="absolute top-4 right-4">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
      <img
        src={`${import.meta.env.BASE_URL}favicon.svg`}
        alt=""
        className="h-20 w-20 rounded-2xl shadow-[0_4px_16px_rgba(62,58,54,0.16)] dark:shadow-none"
      />
      <h1 className="mt-4 text-2xl font-semibold text-ink dark:text-ink-dark">Progreso Sobrio</h1>

      <div className="mt-6 w-full max-w-sm rounded-2xl bg-base p-6 shadow-[0_4px_16px_rgba(62,58,54,0.12)] dark:border dark:border-ink-dark/10 dark:bg-base-dark dark:shadow-none">
        {underage ? (
          <>
            <Icon color="bg-secondary">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z" />
            </Icon>
            <h2 className="text-center text-lg font-semibold text-ink dark:text-ink-dark">Esta app es para mayores de 18</h2>
            <p className="mt-3 text-sm text-ink/80 dark:text-ink-dark/80">
              Que seas menor de edad no significa que no haya ayuda para vos. La línea 1412 de SENDA es gratuita,
              confidencial y atiende a cualquier edad, las 24 horas.
            </p>

            <a
              href={`tel:${SENDA_CONTACT.phone}`}
              className="mt-4 flex items-center justify-between rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3"
            >
              <span>
                <span className="block font-medium text-secondary">{SENDA_CONTACT.name}</span>
                <span className="block text-sm text-secondary/80">{SENDA_CONTACT.description}</span>
              </span>
              <span className="text-lg font-semibold text-secondary">{SENDA_CONTACT.phone}</span>
            </a>

            <button
              type="button"
              onClick={() => setUnderage(false)}
              className="mt-4 w-full rounded-xl border border-ink/20 py-2 text-ink/80 dark:border-ink-dark/15 dark:text-ink-dark/80"
            >
              Volver
            </button>
          </>
        ) : (
          <>
            <Icon color="bg-primary">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
            </Icon>
            <h2 className="text-center text-lg font-semibold text-ink dark:text-ink-dark">Antes de entrar</h2>
            <p className="mt-3 text-sm text-ink/80 dark:text-ink-dark/80">
              Progreso Sobrio acompaña a personas mayores de edad en proceso de abstinencia de sustancias. No reemplaza
              atención médica ni psicológica profesional.
            </p>
            <p className="mt-3 text-sm text-ink/60 dark:text-ink-dark/60">
              Tus datos se guardan solo en este dispositivo. No se envían a ningún servidor.
            </p>

            <button
              type="button"
              onClick={onConfirm}
              className="mt-6 w-full rounded-full bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary/90"
            >
              Tengo 18 años o más
            </button>
            <button
              type="button"
              onClick={() => setUnderage(true)}
              className="mt-3 w-full text-sm text-ink/60 underline dark:text-ink-dark/60"
            >
              Soy menor de 18 años
            </button>
          </>
        )}
      </div>
    </div>
  );
}
