import { useEffect } from 'react';
import { NAV_ITEMS, type ScreenId } from '../../app/navigation';

interface DrawerProps {
  open: boolean;
  activeScreen: ScreenId;
  onSelect: (screen: ScreenId) => void;
  onClose: () => void;
}

export function Drawer({ open, activeScreen, onSelect, onClose }: DrawerProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <nav
        aria-label="Navegación principal"
        className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[80vw] transform bg-base p-4 shadow-lg transition-transform duration-200 dark:bg-base-dark ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className={`w-full rounded-md px-3 py-2 text-left text-base ${
                  activeScreen === item.id
                    ? 'bg-primary/15 font-medium text-primary-text dark:text-primary-text-dark'
                    : 'text-ink/80 hover:bg-ink/5 dark:text-ink-dark/80 dark:hover:bg-ink-dark/10'
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
