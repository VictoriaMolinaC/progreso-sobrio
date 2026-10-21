import type { Theme } from '../../app/theme';
import { BrandBlob } from './BrandBlob';
import { EyeOffIcon } from './EyeIcons';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onMenuClick: () => void;
  onCover: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

/**
 * ☰ a la izquierda, la manchita al centro, y el ojo y el tema a la derecha.
 * No dice el nombre de la app, a propósito: el nombre de cada pantalla va en
 * su título. El fondo es el color de arriba de la bruma: arriba del todo se
 * funde con la página.
 */
export function Header({ onMenuClick, onCover, theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 grid grid-cols-[1fr_auto_1fr] items-center border-b border-ink/[0.08] bg-mist/90 px-2 py-1.5 backdrop-blur dark:border-ink-dark/10 dark:bg-mist-dark/90">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menú"
        className="flex h-11 w-11 items-center justify-center justify-self-start rounded-full text-ink hover:bg-ink/5 dark:text-ink-dark dark:hover:bg-ink-dark/10"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      </button>

      <BrandBlob className="h-9 w-9" />

      <div className="flex items-center gap-1 justify-self-end">
        <button
          type="button"
          onClick={onCover}
          aria-label="Tapar la app"
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-ink/5 dark:text-ink-dark dark:hover:bg-ink-dark/10"
        >
          <EyeOffIcon />
        </button>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
