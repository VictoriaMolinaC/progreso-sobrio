interface SupportButtonProps {
  onClick: () => void;
}

/** Botón flotante, visible en cualquier pantalla — acceso rápido a la red de apoyo. */
export function SupportButton({ onClick }: SupportButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Red de apoyo"
      className="fixed right-5 bottom-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-white shadow-high hover:-translate-y-px hover:shadow-[0_4px_8px_rgba(62,58,54,0.08),0_16px_36px_rgba(62,58,54,0.14)] motion-reduce:hover:translate-y-0"
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
    </button>
  );
}
