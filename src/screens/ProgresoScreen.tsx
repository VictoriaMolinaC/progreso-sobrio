import { lazy, Suspense, useState } from 'react';
import type { Theme } from '../app/theme';
import { CalendarView } from '../components/progreso/CalendarView';
import { CorrelacionesView } from '../components/progreso/CorrelacionesView';
import { ScreenTitle } from '../components/layout/ScreenTitle';
import { HistorialList } from '../components/progreso/HistorialList';

// Diferido: Recharts es pesado y la mayoría de las visitas van a Registro, no acá.
const GraficasView = lazy(() =>
  import('../components/progreso/GraficasView').then((module) => ({ default: module.GraficasView })),
);

type ProgresoTab = 'historial' | 'calendario' | 'graficas' | 'correlaciones';

const TABS: { id: ProgresoTab; label: string }[] = [
  { id: 'historial', label: 'Historial' },
  { id: 'calendario', label: 'Calendario' },
  { id: 'graficas', label: 'Gráficas' },
  { id: 'correlaciones', label: 'Qué te ayuda' },
];

interface ProgresoScreenProps {
  onEditDate: (date: string) => void;
  theme: Theme;
}

export function ProgresoScreen({ onEditDate, theme }: ProgresoScreenProps) {
  const [tab, setTab] = useState<ProgresoTab>('historial');

  return (
    <div className="px-4 py-6">
      <ScreenTitle eyebrow="Tu camino" title="Progreso" className="mb-6" />

      <div role="tablist" aria-label="Vistas de tu progreso" className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold whitespace-nowrap ${
              tab === t.id
                ? 'bg-primary-button text-white'
                : 'text-ink-soft hover:bg-ink/5 dark:text-ink-soft-dark dark:hover:bg-ink-dark/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'historial' && <HistorialList onEdit={onEditDate} />}
      {tab === 'calendario' && <CalendarView onSelectDate={onEditDate} />}
      {tab === 'graficas' && (
        <Suspense fallback={<p className="text-center text-ink-soft dark:text-ink-soft-dark">Cargando gráficas…</p>}>
          <GraficasView theme={theme} />
        </Suspense>
      )}
      {tab === 'correlaciones' && <CorrelacionesView />}
    </div>
  );
}
