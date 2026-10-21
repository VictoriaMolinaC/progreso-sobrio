import { useLiveQuery } from 'dexie-react-hooks';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Theme } from '../../app/theme';
import { getDailyLogs } from '../../db/repositories';
import { formatDateDisplay } from '../../lib/dates';
import { ChartCard } from './ChartCard';

const COLOR_PRIMARY = '#5b9279';
const COLOR_SECONDARY = '#c97c5d';
const COLOR_ACCENT = '#e6a756';

interface GraficasViewProps {
  theme: Theme;
}

export function GraficasView({ theme }: GraficasViewProps) {
  const logs = useLiveQuery(() => getDailyLogs());
  const inkColor = theme === 'dark' ? '#f5efe6' : '#3e3a36';
  const inkSoftColor = theme === 'dark' ? '#b3ada6' : '#655d56';
  const surfaceColor = theme === 'dark' ? '#221e1a' : '#faf6f0';

  if (!logs) return null;

  if (logs.length === 0) {
    return <p className="text-center text-ink-soft dark:text-ink-soft-dark">Todavía no hay registros para graficar.</p>;
  }

  const data = logs
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({
      label: formatDateDisplay(log.date).slice(0, 5),
      restingHeartRate: log.restingHeartRate ?? null,
      sleepHours: log.sleepHours ?? null,
      activityMinutes: log.activityMinutes ?? null,
    }));

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: surfaceColor,
      border: `1px solid ${inkColor}22`,
      borderRadius: 8,
      fontSize: 12,
    },
    labelStyle: { color: inkColor },
    // Sin esto, recharts pinta el valor con el color de la serie (ámbar: 2:1).
    itemStyle: { color: inkColor },
  };

  return (
    <div className="flex flex-col gap-4">
      <ChartCard title="LPM en reposo">
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={inkColor} strokeOpacity={0.1} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: inkSoftColor }} axisLine={false} tickLine={false} />
            <YAxis width={32} tick={{ fontSize: 11, fill: inkSoftColor }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip {...tooltipStyle} formatter={(value) => [`${value} lpm`, 'LPM reposo']} />
            <Line type="monotone" dataKey="restingHeartRate" stroke={COLOR_PRIMARY} strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Horas de sueño">
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={inkColor} strokeOpacity={0.1} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: inkSoftColor }} axisLine={false} tickLine={false} />
            <YAxis width={32} tick={{ fontSize: 11, fill: inkSoftColor }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip {...tooltipStyle} formatter={(value) => [`${value} hs`, 'Sueño']} />
            <Line type="monotone" dataKey="sleepHours" stroke={COLOR_SECONDARY} strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Minutos de actividad">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={inkColor} strokeOpacity={0.1} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: inkSoftColor }} axisLine={false} tickLine={false} />
            <YAxis width={32} tick={{ fontSize: 11, fill: inkSoftColor }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} formatter={(value) => [`${value} min`, 'Actividad']} />
            <Bar dataKey="activityMinutes" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
