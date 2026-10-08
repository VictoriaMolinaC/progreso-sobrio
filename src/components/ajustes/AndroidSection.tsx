import { useEffect, useState } from 'react';
import {
  type Capabilities,
  getCapabilities,
  isAndroidBridgeAvailable,
  type NativeScreen,
  openNativeScreen,
} from '../../lib/androidBridge';

/**
 * Solo dentro de la app Android: acceso a la pantalla de diagnóstico del reloj, a la
 * privacidad de la app y a la versión instalada. En el navegador esta sección no aparece.
 */
export function AndroidSection() {
  const available = isAndroidBridgeAvailable();
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!available) return;
    // Si no responde, simplemente no se muestra la versión; el resto sigue funcionando.
    getCapabilities()
      .then(setCapabilities)
      .catch(() => setCapabilities(null));
  }, [available]);

  if (!available) return null;

  const open = async (screen: NativeScreen) => {
    setMessage(null);
    try {
      await openNativeScreen(screen);
    } catch {
      setMessage('No se pudo abrir esa pantalla. Probá de nuevo.');
    }
  };

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-ink dark:text-ink-dark">App Android</h2>
      <p className="mb-3 text-sm text-ink/60 dark:text-ink-dark/60">
        Estás usando la app para Android. Acá podés ver qué datos llegan de tu reloj y cómo se cuida tu privacidad.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => open('watchTest')}
          className="rounded-xl border border-ink/20 px-4 py-2 text-sm text-ink dark:border-ink-dark/15 dark:text-ink-dark"
        >
          Pantalla de diagnóstico del reloj
        </button>
        <button
          type="button"
          onClick={() => open('privacy')}
          className="rounded-xl border border-ink/20 px-4 py-2 text-sm text-ink dark:border-ink-dark/15 dark:text-ink-dark"
        >
          Privacidad de la app
        </button>
      </div>

      {message && <p className="mt-2 text-sm text-ink/70 dark:text-ink-dark/70">{message}</p>}
      {capabilities && (
        <p className="mt-3 text-sm text-ink/60 dark:text-ink-dark/60">
          App {capabilities.appVersion} · PWA {capabilities.pwaBuild}
        </p>
      )}
    </section>
  );
}
