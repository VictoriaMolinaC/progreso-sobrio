import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { dismissDemoBanner, getDemoSubstanceId, isDemoBannerDismissed } from '../../db/repositories';

interface DemoDataBannerProps {
  onGoToAjustes: () => void;
}

/**
 * Avisa que lo que se ve son datos de ejemplo. Vive solo mientras la sustancia
 * sembrada siga existiendo: apenas se borran los datos de ejemplo (o se descarta
 * el aviso), desaparece para siempre.
 */
export function DemoDataBanner({ onGoToAjustes }: DemoDataBannerProps) {
  const shouldShow = useLiveQuery(async () => {
    const [demoId, dismissed] = await Promise.all([getDemoSubstanceId(), isDemoBannerDismissed()]);
    if (demoId === null || dismissed) return false;
    return Boolean(await db.substances.get(demoId));
  });

  if (!shouldShow) return null;

  return (
    // Aviso suave del sitio (.notice), con la cinta de la izquierda en ámbar como el botón.
    <div className="rounded-[4px_16px_16px_4px] border border-l-[3px] border-line border-l-accent bg-card px-5 py-4 dark:border-ink-dark/10 dark:border-l-accent dark:bg-ink-dark/5">
      <p className="text-sm text-ink dark:text-ink-dark">
        Estos son datos de ejemplo para que veas cómo funciona la app. Cuando quieras empezar con los tuyos, bórralos
        desde Ajustes.
      </p>
      <div className="mt-3 flex items-center gap-3">
        {/* Ámbar a propósito: el aviso pasaba desapercibido. Llama la atención sin alarmar;
            con texto tinta (también en modo oscuro) pasa 5,4:1, con blanco no. */}
        <button
          type="button"
          onClick={onGoToAjustes}
          className="min-h-11 rounded-full bg-accent px-5 text-sm font-semibold text-ink shadow-[0_1px_2px_rgba(62,58,54,0.08)] hover:shadow-[0_2px_8px_rgba(62,58,54,0.16)]"
        >
          Ir a Ajustes
        </button>
        <button
          type="button"
          onClick={() => dismissDemoBanner()}
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-full text-sm text-ink-soft hover:bg-ink/5 dark:text-ink-soft-dark dark:hover:bg-ink-dark/10"
          aria-label="Descartar este aviso"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
