import { useLiveQuery } from 'dexie-react-hooks';
import { type FormEvent, useEffect, useState } from 'react';
import { CheckboxGroup } from '../components/forms/CheckboxGroup';
import { DateField } from '../components/forms/DateField';
import { ScaleSelector } from '../components/forms/ScaleSelector';
import { TextField } from '../components/forms/TextField';
import { WatchDataPreview } from '../components/registro/WatchDataPreview';
import { getFirstUsedDate } from '../db/init';
import {
  getDailyLogByDate,
  getEarliestDailyLogDate,
  getHrThreshold,
  habitsRepo,
  triggersRepo,
  upsertDailyLog,
} from '../db/repositories';
import type { DailyLog, Scale1to5 } from '../db/types';
import { isAndroidBridgeAvailable, type WatchDayData } from '../lib/androidBridge';
import { toDateKey } from '../lib/dates';
import { mapWatchDayToForm } from '../lib/watchDayMapping';

interface FormState {
  restingHeartRate: string;
  minHeartRate: string;
  maxHeartRate: string;
  deviceUsed: string;
  craving: Scale1to5 | undefined;
  sleepHours: string;
  sleepQuality: Scale1to5 | undefined;
  activityMinutes: string;
  activityType: string;
  energy: Scale1to5 | undefined;
  mood: Scale1to5 | undefined;
  notes: string;
  triggerIds: number[];
  habitIds: number[];
}

const emptyForm: FormState = {
  restingHeartRate: '',
  minHeartRate: '',
  maxHeartRate: '',
  deviceUsed: '',
  craving: undefined,
  sleepHours: '',
  sleepQuality: undefined,
  activityMinutes: '',
  activityType: '',
  energy: undefined,
  mood: undefined,
  notes: '',
  triggerIds: [],
  habitIds: [],
};

function formFromLog(log: DailyLog): FormState {
  return {
    restingHeartRate: log.restingHeartRate?.toString() ?? '',
    minHeartRate: log.minHeartRate?.toString() ?? '',
    maxHeartRate: log.maxHeartRate?.toString() ?? '',
    deviceUsed: log.deviceUsed ?? '',
    craving: log.craving,
    sleepHours: log.sleepHours?.toString() ?? '',
    sleepQuality: log.sleepQuality,
    activityMinutes: log.activityMinutes?.toString() ?? '',
    activityType: log.activityType ?? '',
    energy: log.energy,
    mood: log.mood,
    notes: log.notes ?? '',
    triggerIds: log.triggerIds,
    habitIds: log.habitIds,
  };
}

const toNumberOrUndefined = (value: string) => (value.trim() === '' ? undefined : Number(value));

interface RegistroScreenProps {
  initialDate?: string;
}

export function RegistroScreen({ initialDate }: RegistroScreenProps) {
  const today = toDateKey(new Date());
  const [minDate, setMinDate] = useState<string | undefined>();
  const [date, setDate] = useState(initialDate ?? today);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [existingLog, setExistingLog] = useState<DailyLog | null>(null);
  const [savedForDate, setSavedForDate] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [hrWarningMessage, setHrWarningMessage] = useState<string | null>(null);
  const saved = savedForDate === date;
  const triggers = useLiveQuery(() => triggersRepo.getActive()) ?? [];
  const habits = useLiveQuery(() => habitsRepo.getActive()) ?? [];

  useEffect(() => {
    Promise.all([getFirstUsedDate(), getEarliestDailyLogDate()]).then(([firstUsedIso, earliestLogDate]) => {
      const firstUsedKey = firstUsedIso ? toDateKey(new Date(firstUsedIso)) : undefined;
      // El mínimo es lo más antiguo entre "primer uso de la app" y el registro más
      // antiguo que ya exista — así no bloqueamos historial real (ej. datos de ejemplo).
      const candidates = [firstUsedKey, earliestLogDate].filter((d): d is string => Boolean(d));
      if (candidates.length > 0) setMinDate(candidates.sort()[0]);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    getDailyLogByDate(date).then((log) => {
      if (cancelled) return;
      setExistingLog(log ?? null);
      setForm(log ? formFromLog(log) : emptyForm);
      setIsDirty(false);
    });
    return () => {
      cancelled = true;
    };
  }, [date]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSavedForDate(null);
    setIsDirty(true);
  };

  const toggleArrayField = (key: 'triggerIds' | 'habitIds', id: number) => {
    setForm((prev) => {
      const current = prev[key];
      const next = current.includes(id) ? current.filter((existingId) => existingId !== id) : [...current, id];
      return { ...prev, [key]: next };
    });
    setSavedForDate(null);
    setIsDirty(true);
  };

  // "Usar estos datos" (solo en la app Android): completa los campos y deja el formulario con
  // cambios sin guardar. Nada se guarda hasta "Guardar registro".
  const applyWatchData = (data: WatchDayData) => {
    setForm((prev) => ({ ...prev, ...mapWatchDayToForm(data, prev) }));
    setSavedForDate(null);
    setIsDirty(true);
  };

  const handleDateChange = (newDate: string) => {
    if (isDirty) {
      const confirmed = window.confirm(
        'Tienes cambios sin guardar en este registro. Si cambiás de fecha se van a perder. ¿Continuar igual?',
      );
      if (!confirmed) return;
    }
    setDate(newDate);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.craving || !form.sleepQuality || !form.energy || !form.mood) return;

    await upsertDailyLog({
      date,
      restingHeartRate: toNumberOrUndefined(form.restingHeartRate),
      minHeartRate: toNumberOrUndefined(form.minHeartRate),
      maxHeartRate: toNumberOrUndefined(form.maxHeartRate),
      deviceUsed: form.deviceUsed.trim() || undefined,
      craving: form.craving,
      triggerIds: form.triggerIds,
      sleepHours: toNumberOrUndefined(form.sleepHours),
      sleepQuality: form.sleepQuality,
      activityMinutes: toNumberOrUndefined(form.activityMinutes),
      activityType: form.activityType.trim() || undefined,
      energy: form.energy,
      mood: form.mood,
      habitIds: form.habitIds,
      notes: form.notes.trim() || undefined,
    });

    const restingValue = toNumberOrUndefined(form.restingHeartRate);
    if (restingValue !== undefined) {
      const threshold = await getHrThreshold();
      setHrWarningMessage(
        restingValue > threshold
          ? `Tu LPM en reposo (${restingValue}) superó tu umbral configurado (${threshold}). Puede ser buena idea prestarle atención.`
          : null,
      );
    } else {
      setHrWarningMessage(null);
    }

    setSavedForDate(date);
    setIsDirty(false);
  };

  const canSave = form.craving && form.sleepQuality && form.energy && form.mood;

  return (
    <div className="px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold text-ink dark:text-ink-dark">Registro diario</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-10">
        <DateField label="Fecha" value={date} onChange={handleDateChange} min={minDate} max={today} required />

        {existingLog && (
          <p className="-mt-2 text-sm text-secondary">Ya existe un registro para este día, se va a actualizar.</p>
        )}

        {/* key={date}: al cambiar de fecha, la vista previa vuelve a empezar (nunca muestra datos de otro día). */}
        {isAndroidBridgeAvailable() && <WatchDataPreview key={date} date={date} onUse={applyWatchData} />}

        <div className="grid grid-cols-3 gap-2">
          <TextField
            label="LPM reposo"
            type="number"
            min="0"
            value={form.restingHeartRate}
            onChange={(value) => updateField('restingHeartRate', value)}
          />
          <TextField
            label="LPM mín."
            type="number"
            min="0"
            value={form.minHeartRate}
            onChange={(value) => updateField('minHeartRate', value)}
          />
          <TextField
            label="LPM máx."
            type="number"
            min="0"
            value={form.maxHeartRate}
            onChange={(value) => updateField('maxHeartRate', value)}
          />
        </div>

        <TextField
          label="Equipo con el que mediste"
          placeholder="Ej: Xiaomi Smart Band 10"
          value={form.deviceUsed}
          onChange={(value) => updateField('deviceUsed', value)}
        />

        <ScaleSelector label="Craving" value={form.craving} onChange={(value) => updateField('craving', value)} />

        <CheckboxGroup
          label="Disparadores"
          options={triggers}
          selectedIds={form.triggerIds}
          onToggle={(id) => toggleArrayField('triggerIds', id)}
        />

        <div className="grid grid-cols-2 gap-2">
          <TextField
            label="Horas de sueño"
            type="number"
            step="0.1"
            min="0"
            value={form.sleepHours}
            onChange={(value) => updateField('sleepHours', value)}
          />
          <ScaleSelector
            label="Calidad de sueño"
            value={form.sleepQuality}
            onChange={(value) => updateField('sleepQuality', value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <TextField
            label="Minutos de actividad"
            type="number"
            min="0"
            value={form.activityMinutes}
            onChange={(value) => updateField('activityMinutes', value)}
          />
          <TextField
            label="Tipo de actividad"
            placeholder="Ej: Caminata"
            value={form.activityType}
            onChange={(value) => updateField('activityType', value)}
          />
        </div>

        <ScaleSelector label="Energía" value={form.energy} onChange={(value) => updateField('energy', value)} />
        <ScaleSelector label="Ánimo" value={form.mood} onChange={(value) => updateField('mood', value)} />

        <CheckboxGroup
          label="Hábitos de apoyo cumplidos"
          options={habits}
          selectedIds={form.habitIds}
          onToggle={(id) => toggleArrayField('habitIds', id)}
        />

        <label className="flex flex-col gap-1 text-sm text-ink/80 dark:text-ink-dark/80">
          Notas
          <textarea
            value={form.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            rows={3}
            className="w-full rounded-xl border border-ink/20 bg-base px-3 py-2 text-ink dark:border-ink-dark/15 dark:bg-base-dark dark:text-ink-dark"
          />
        </label>

        <button
          type="submit"
          disabled={!canSave}
          className="rounded-full bg-primary px-4 py-3 text-base font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Guardar registro
        </button>

        {saved && <p className="text-center text-sm text-success">Guardado ✓</p>}
        {saved && hrWarningMessage && <p className="text-center text-sm text-warning">{hrWarningMessage}</p>}
        {!canSave && (
          <p className="text-center text-sm text-ink/50 dark:text-ink-dark/50">
            Faltan craving, sueño, energía o ánimo para guardar.
          </p>
        )}
      </form>
    </div>
  );
}
