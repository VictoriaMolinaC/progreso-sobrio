import type { ReactNode } from 'react';

interface ScreenTitleProps {
  /** Ceja terracota sobre el título, en mayúsculas. */
  eyebrow: string;
  title: string;
  /** Bajada opcional bajo el título. */
  children?: ReactNode;
  /** Para el margen: depende de cómo separa cada pantalla sus bloques. */
  className?: string;
}

/** El nombre de cada pantalla, como los títulos del sitio: ceja terracota y título liviano. */
export function ScreenTitle({ eyebrow, title, children, className = '' }: ScreenTitleProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <p className="text-eyebrow font-semibold tracking-eyebrow text-secondary-text uppercase dark:text-secondary-text-dark">
        {eyebrow}
      </p>
      <h1 className="text-title leading-tight font-light tracking-tight text-ink dark:text-ink-dark">{title}</h1>
      {children && <p className="text-ink-soft dark:text-ink-soft-dark">{children}</p>}
    </div>
  );
}
