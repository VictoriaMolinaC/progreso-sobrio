import { LEGAL } from '../../lib/constants';

const LINKS = [
  { href: LEGAL.termsUrl, label: 'Términos de uso', version: LEGAL.termsVersion },
  { href: LEGAL.privacyUrl, label: 'Política de privacidad', version: LEGAL.privacyVersion },
];

/**
 * Enlaces a los textos legales del sitio, con su versión. Se abren en el
 * navegador; en la app Android, el WebView los manda fuera de la app.
 */
export function LegalLinks() {
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {LINKS.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block py-1 font-medium text-primary-text underline dark:text-primary-text-dark"
          >
            {link.label}
            <span className="sr-only"> (se abre en el navegador)</span>
          </a>
          <span className="text-ink-soft dark:text-ink-soft-dark"> · versión {link.version}</span>
        </li>
      ))}
    </ul>
  );
}
