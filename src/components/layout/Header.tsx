import type { Theme } from '../../app/theme';
import { EyeOffIcon } from './EyeIcons';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onMenuClick: () => void;
  onCover: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function Header({ onMenuClick, onCover, theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-ink/10 bg-base/90 px-4 py-3 backdrop-blur dark:border-ink-dark/10 dark:bg-base-dark/90">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menú"
        className="rounded-md p-2 text-ink hover:bg-ink/5 dark:text-ink-dark dark:hover:bg-ink-dark/10"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <span className="text-lg font-semibold text-ink dark:text-ink-dark">Progreso Sobrio</span>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={onCover}
          aria-label="Tapar la app"
          className="rounded-md p-2 text-ink hover:bg-ink/5 dark:text-ink-dark dark:hover:bg-ink-dark/10"
        >
          <EyeOffIcon />
        </button>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
