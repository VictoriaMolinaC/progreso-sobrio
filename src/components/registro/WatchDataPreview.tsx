import { useEffect, useRef, useState } from 'react';
import {
  AndroidBridgeError,
  type BridgeError,
  openNativeScreen,
  readWatchDay,
  type WatchDayData,
} from '../../lib/androidBridge';
import { sleepMinutesToHours } from '../../lib/watchDayMapping';

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'preview'; data: WatchDayData }
  | { kind: 'used' }
  | { kind: 'error'; code: BridgeError };

interface WatchDataPreviewProps {
  /** Día del formulario ('YYYY-MM-DD'): es el que se lee, nunca "hoy" implícito. */
  date: string;
  onUse: (data: WatchDayData) => void;
}

const SIN_DATO = 'sin dato';

const lpm = (value: number | null) => (value === null ? SIN_DATO : `${value} lpm`);

function lastMeasurement(data: WatchDayData): string {
  if (data.lastBpm === null) return SIN_DATO;
  if (data.lastBpmTime === null) return `${data.lastBpm} lpm`;
  const hora = new Date(data.lastBpmTime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${data.lastBpm} lpm a las ${hora}`;
}

function sleepPulse(data: WatchDayData): string {
  if (data.sleepMinBpm === null || data.sleepAvgBpm === null) return SIN_DATO;
  return `mín ${data.sleepMinBpm} · promedio ${data.sleepAvgBpm} lpm`;
}

const buttonClass =
  'rounded-xl border border-ink/20 px-4 py-2 text-sm text-ink dark:border-ink-dark/15 dark:text-ink-dark';

/**
 * Solo dentro de la app Android: trae los datos del reloj del día del formulario desde Health
 * Connect, los muestra y, si la persona toca "Usar estos datos", completa los campos. Nada se
 * guarda hasta "Guardar registro".
 */
export function WatchDataPreview({ date, onUse }: WatchDataPreviewProps) {
  const [state, setState] = useState<State>({ kind: 'idle' });
  // Cada pedido lleva un número; si se canceló o la pantalla cambió, la respuesta tardía se ignora.
  const requestRef = useRef(0);

  useEffect(
    () => () => {
      requestRef.current += 1;
    },
    [],
  );

  const fetchDay = async () => {
    const request = ++requestRef.current;
    setState({ kind: 'loading' });
    try {
      const data = await readWatchDay(date);
      if (request === requestRef.current) setState({ kind: 'preview', data });
    } catch (error) {
      const code = error instanceof AndroidBridgeError ? error.code : 'unknown';
      if (request === requestRef.current) setState({ kind: 'error', code });
    }
  };

  const cancel = () => {
    requestRef.current += 1;
    setState({ kind: 'idle' });
  };

  const use = (data: WatchDayData) => {
    onUse(data);
    setState({ kind: 'used' });
  };

  return (
    <section className="rounded-xl border border-ink/20 p-4 dark:border-ink-dark/15">
      {state.kind !== 'preview' && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={fetchDay}
              disabled={state.kind === 'loading'}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {state.kind === 'loading' ? 'Leyendo…' : 'Traer datos del reloj'}
            </button>
            {state.kind === 'loading' && (
              <button type="button" onClick={cancel} className={buttonClass}>
                Cancelar
              </button>
            )}
          </div>
          <p className="mt-2 text-sm text-ink/60 dark:text-ink-dark/60">
            Se leen pulso y sueño desde Health Connect solo cuando tocás este botón. Nada se guarda hasta que toques
            Guardar registro.
          </p>
        </>
      )}

      {state.kind === 'used' && (
        <p className="mt-2 text-sm text-success">Listo: completamos los campos. Revisalos y guarda el registro.</p>
      )}

      {state.kind === 'error' && <ErrorMessage code={state.code} />}

      {state.kind === 'preview' && (
        <>
          <h2 className="mb-2 text-base font-semibold text-ink dark:text-ink-dark">Datos del reloj</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm text-ink dark:text-ink-dark">
            <dt className="text-ink/60 dark:text-ink-dark/60">Pulso en reposo</dt>
            <dd>{lpm(state.data.restingBpm)}</dd>
            <dt className="text-ink/60 dark:text-ink-dark/60">Pulso mín. / máx.</dt>
            <dd>
              {state.data.minBpm === null && state.data.maxBpm === null
                ? SIN_DATO
                : `${state.data.minBpm ?? SIN_DATO} / ${state.data.maxBpm ?? SIN_DATO} lpm`}
            </dd>
            <dt className="text-ink/60 dark:text-ink-dark/60">Promedio de las mediciones</dt>
            <dd>{lpm(state.data.avgBpm)}</dd>
            <dt className="text-ink/60 dark:text-ink-dark/60">Última medición</dt>
            <dd>{lastMeasurement(state.data)}</dd>
            <dt className="text-ink/60 dark:text-ink-dark/60">Horas de sueño</dt>
            <dd>
              {state.data.sleepMinutes === null
                ? SIN_DATO
                : `${sleepMinutesToHours(state.data.sleepMinutes).toLocaleString('es-CL')} h`}
            </dd>
            <dt className="text-ink/60 dark:text-ink-dark/60">Pulso durante el sueño</dt>
            <dd>{sleepPulse(state.data)}</dd>
            <dt className="text-ink/60 dark:text-ink-dark/60">Fuente</dt>
            <dd>{state.data.sources.length > 0 ? state.data.sources.join(', ') : SIN_DATO}</dd>
          </dl>
          <p className="mt-3 text-sm text-ink/60 dark:text-ink-dark/60">
            Al usarlos se completan LPM reposo, mín., máx., horas de sueño y el equipo (si está vacío). Lo que diga
            "sin dato" no cambia. El promedio, la última medición y el pulso durante el sueño son solo informativos.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => use(state.data)}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Usar estos datos
            </button>
            <button type="button" onClick={() => setState({ kind: 'idle' })} className={buttonClass}>
              Descartar
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function ErrorMessage({ code }: { code: BridgeError }) {
  const text = (message: string) => <p className="mt-2 text-sm text-ink/80 dark:text-ink-dark/80">{message}</p>;
  const storeButton = (label: string) => (
    <button
      type="button"
      onClick={() => openNativeScreen('healthConnect').catch(() => undefined)}
      className={`mt-2 ${buttonClass}`}
    >
      {label}
    </button>
  );

  switch (code) {
    case 'hc_unavailable':
      return (
        <>
          {text('Para traer datos del reloj necesitás la app Health Connect.')}
          {storeButton('Instalar Health Connect')}
        </>
      );
    case 'hc_update_required':
      return (
        <>
          {text('Health Connect necesita una actualización.')}
          {storeButton('Actualizar Health Connect')}
        </>
      );
    case 'no_permission':
      return text(
        'Sin permiso para leer el reloj. Podés volver a intentarlo, o activarlo en Health Connect → Permisos de apps.',
      );
    case 'no_data':
      return text('No hay datos de este día. Abrí Mi Fitness para sincronizar tu pulsera y volvé a intentar.');
    default:
      return text('No se pudieron leer los datos. Probá de nuevo.');
  }
}
