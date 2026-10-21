// Decoración del sitio («Diario con bruma»). Todo es aria-hidden y nunca va detrás de texto.

const RIBBON_COLORS = {
  sage: 'bg-blob-sage dark:bg-primary/40',
  peach: 'bg-blob-peach dark:bg-secondary/40',
  honey: 'bg-blob-honey dark:bg-accent/40',
};

interface RibbonProps {
  color?: keyof typeof RIBBON_COLORS;
}

/** Cinta colgando del borde de arriba de una tarjeta (`.card-ribbon`). La tarjeta tiene que ser `relative`. */
export function Ribbon({ color = 'sage' }: RibbonProps) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute -top-px right-6 h-[30px] w-3.5 [clip-path:polygon(0_0,100%_0,100%_100%,50%_74%,0_100%)] ${RIBBON_COLORS[color]}`}
    />
  );
}

const BLOB_PATHS = {
  sage: 'M104 12c43 2 82 31 84 76 2 47-37 96-89 98C49 188 12 152 13 104 14 51 53 10 104 12Z',
  peach: 'M92 18c45-6 92 26 94 72 2 44-34 88-86 92-49 4-88-31-87-78 1-41 32-80 79-86Z',
  honey: 'M100 16c46 0 84 36 84 82s-40 86-86 86-82-36-82-84 38-84 84-84Z',
};

interface BlobProps {
  shape: keyof typeof BLOB_PATHS;
  /** Tamaño, posición y color (text-blob-*). */
  className: string;
}

/** Mancha suave de color (`.blob` del sitio). */
export function Blob({ shape, className }: BlobProps) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={`pointer-events-none absolute ${className}`}>
      <path d={BLOB_PATHS[shape]} fill="currentColor" />
    </svg>
  );
}
