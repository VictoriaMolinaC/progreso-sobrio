/** Escala usada para ansias (campo `craving`), calidad de sueño, energía y ánimo. */
export type Scale1to5 = 1 | 2 | 3 | 4 | 5;

export interface Substance {
  id: number;
  name: string;
  /** Fecha (ISO, YYYY-MM-DD) del último consumo — de acá se calcula la racha. */
  lastUseDate: string;
  color?: string;
  createdAt: string;
}

export interface DailyLog {
  id: number;
  /** ISO YYYY-MM-DD, único: un registro por día. */
  date: string;
  restingHeartRate?: number;
  minHeartRate?: number;
  maxHeartRate?: number;
  /** Equipo con el que se midió (ej. "Xiaomi Smart Band 10"), texto libre. */
  deviceUsed?: string;
  // Las cuatro escalas son opcionales: para guardar el día basta un dato, el que sea.
  craving?: Scale1to5;
  triggerIds: number[];
  sleepHours?: number;
  sleepQuality?: Scale1to5;
  activityMinutes?: number;
  activityType?: string;
  energy?: Scale1to5;
  mood?: Scale1to5;
  /** Hábitos de apoyo cumplidos ese día. */
  habitIds: number[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: number;
  name: string;
  phone?: string;
  relationship?: string;
  createdAt: string;
}

/** Ítem de una lista editable por el usuario (hábitos o disparadores). */
export interface ListItem {
  id: number;
  name: string;
  /** false = ya no se ofrece para nuevos registros, pero se conserva en el histórico. */
  active: boolean;
  createdAt: string;
}

export type Habit = ListItem;
export type Trigger = ListItem;

export interface Settings {
  key: string;
  value: unknown;
}
