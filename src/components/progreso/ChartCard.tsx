import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
}

/** Una sola serie no necesita leyenda propia — el título ya dice qué se está mostrando. */
export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="paper-card p-4">
      <h2 className="mb-2 text-sm font-semibold text-ink dark:text-ink-dark">{title}</h2>
      {children}
    </div>
  );
}
