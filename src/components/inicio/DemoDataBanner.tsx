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
    <div className="w-full max-w-sm rounded-xl bg-ink/[0.04] p-4 text-left shadow-[0_2px_8px_rgba(62,58,54,0.08)] dark:bg-ink-dark/[0.06] dark:shadow-none">
      <p className="text-sm text-ink/80 dark:text-ink-dark/80">
        Estos son datos de ejemplo para que veas cómo funciona la app. Cuando quieras empezar con los tuyos, bórralos
        desde Ajustes.
      </p>
      <div className="mt-3 flex items-center gap-3">
        <button type="button" onClick={onGoToAjustes} className="text-sm font-medium text-primary underline">
          Ir a Ajustes
        </button>
        <button
          type="button"
          onClick={() => dismissDemoBanner()}
          className="ml-auto text-sm text-ink/50 dark:text-ink-dark/50"
          aria-label="Descartar este aviso"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
