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

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-ink/10 dark:border-ink-dark/10">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t.id ? 'border-primary text-primary-text dark:text-primary-text-dark' : 'border-transparent text-ink-soft dark:text-ink-soft-dark'
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
