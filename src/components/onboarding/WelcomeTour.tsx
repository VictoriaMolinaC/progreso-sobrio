import { useState } from 'react';
import type { Theme } from '../../app/theme';
import { ThemeToggle } from '../layout/ThemeToggle';

interface WelcomeTourProps {
  onFinish: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

interface TourCard {
  title: string;
  body: string;
  color: string;
  icon: React.ReactNode;
}

// Mismos trazos (stroke, 24x24) que el resto de la app, para que se sientan
// parte del mismo sistema y no íconos de relleno. El escudo es el mismo que
// usa AgeGate en "Antes de entrar" (misma pantalla de entrada, mismo tema).
const SHIELD_PATH = 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z';
const HEART_PATH = 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z';

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const CARDS: TourCard[] = [
  {
    title: 'Bienvenida a Progreso Sobrio',
    body: 'Un día a la vez. Esta app te ayuda a llevar el registro de tu proceso, sin juzgar y sin diagnósticos. Te mostramos rápido cómo se organiza.',
    color: 'bg-primary',
    icon: (
      <Icon>
        <path d={SHIELD_PATH} />
      </Icon>
    ),
  },
  {
    title: 'Registro diario',
    body: 'En menos de 30 segundos anotas cómo estuvo tu día: LPM en reposo, sueño, craving, ánimo y los hábitos que cumpliste. Se accede desde "Registrar hoy" en Inicio, o desde el ítem "Registro" del menú.',
    color: 'bg-accent',
    icon: (
      <Icon>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </Icon>
    ),
  },
  {
    title: 'Progreso',
    body: 'Ahí vive todo lo que registras con el tiempo: historial, calendario, gráficas y observaciones simples sobre qué parece ayudarte más.',
    color: 'bg-success',
    icon: (
      <Icon>
        <polyline points="3 17 9 11 13 15 21 7" />
        <polyline points="14 7 21 7 21 14" />
      </Icon>
    ),
  },
  {
    title: 'Tu red de apoyo, siempre a mano',
    body: 'El botón con el corazón, abajo a la derecha, abre tus contactos de confianza y la línea 1412 de SENDA gratuita, confidencial, las 24 horas.',
    color: 'bg-secondary',
    icon: (
      <Icon>
        <path d={HEART_PATH} />
      </Icon>
    ),
  },
];

/**
 * Tour de bienvenida, una sola vez después de confirmar la edad. Explica lo
 * que el drawer no explica por sí solo: qué diferencia a "Registro" de
 * "Progreso", y que el botón flotante no es solo un adorno.
 *
 * Dos íconos se repiten a propósito, para que el usuario los reconozca cuando
 * los vuelva a ver: el escudo de "Bienvenida" es el mismo que AgeGate usa en
 * "Antes de entrar" (misma pantalla de entrada), y el corazón de "Red de
 * apoyo" es el mismo ícono y color que el botón flotante real.
 */
export function WelcomeTour({ onFinish, theme, onToggleTheme }: WelcomeTourProps) {
  const [step, setStep] = useState(0);
  const isLast = step === CARDS.length - 1;
  const card = CARDS[step];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-base p-4 dark:bg-base-dark">
      <div className="absolute top-4 right-4">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
      <div className="w-full max-w-sm rounded-2xl bg-ink/[0.03] p-6 shadow-[0_2px_8px_rgba(62,58,54,0.08)] dark:bg-ink-dark/[0.05] dark:shadow-none">
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-white ${card.color}`}>
          {card.icon}
        </div>

        <h2 className="text-center text-lg font-semibold text-ink dark:text-ink-dark">{card.title}</h2>
        <p className="mt-3 text-sm text-ink/80 dark:text-ink-dark/80">{card.body}</p>

        <div className="mt-6 flex items-center justify-center gap-2">
          {CARDS.map((c, i) => (
            <span
              key={c.title}
              className={`h-1.5 w-1.5 rounded-full ${i === step ? 'bg-primary' : 'bg-ink/20 dark:bg-ink-dark/20'}`}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onFinish}
            className="text-sm text-ink-soft underline dark:text-ink-soft-dark"
          >
            Saltar
          </button>
          <button
            type="button"
            onClick={() => (isLast ? onFinish() : setStep((s) => s + 1))}
            className="rounded-full bg-primary-button px-6 py-2 text-sm font-medium text-white hover:bg-primary-text"
          >
            {isLast ? 'Empezar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
}
