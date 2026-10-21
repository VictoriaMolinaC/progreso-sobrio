interface BrandBlobProps {
  className?: string;
}

/** La manchita: el isotipo del sitio (`.brand-blob` en sitio/index.html), salvia con un punto ámbar. */
export function BrandBlob({ className }: BrandBlobProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <path
        d="M25.5 5.5c9.6.4 17.3 7.6 17 17.6-.3 10.6-8.9 19.6-19.6 19.4C12.6 42.3 5.3 34.6 5.6 24.8 5.9 13.4 14.6 5 25.5 5.5Z"
        className="fill-primary"
      />
      <circle cx="31" cy="18.5" r="5" className="fill-accent" />
    </svg>
  );
}
