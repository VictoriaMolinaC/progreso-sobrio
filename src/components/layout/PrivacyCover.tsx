import { useEffect, useRef } from 'react';
import { BrandBlob } from './BrandBlob';
import { EyeIcon } from './EyeIcons';

interface PrivacyCoverProps {
  onUncover: () => void;
}

/**
 * Pantalla neutra que tapa toda la app: solo la manchita y "Mostrar". No dice
 * qué app es ni muestra ningún dato. La app sigue debajo (inert), así que al
 * volver nada se pierde, ni siquiera un registro a medio llenar.
 */
export function PrivacyCover({ onUncover }: PrivacyCoverProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-8 bg-base dark:bg-base-dark">
      <BrandBlob className="h-16 w-16 opacity-80" />
      <button
        ref={buttonRef}
        type="button"
        onClick={onUncover}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/20 px-5 text-sm font-medium text-ink hover:bg-ink/5 dark:border-ink-dark/20 dark:text-ink-dark dark:hover:bg-ink-dark/10"
      >
        <EyeIcon />
        Mostrar
      </button>
    </div>
  );
}
