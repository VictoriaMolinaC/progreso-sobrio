import { db } from './db';
import { addDays, toDateKey } from '../lib/dates';
import { getSetting, setDemoSubstanceId, setSetting } from './repositories/settings';
import type { DailyLog, Scale1to5 } from './types';

const SEEDED_KEY = 'seeded';

const SAMPLE_HABITS = ['Meditar', 'Ir a terapia', 'Llamar a un contacto de apoyo', 'Ejercicio', 'Diario de gratitud'];
const SAMPLE_TRIGGERS = ['Estrés laboral', 'Conflictos familiares', 'Aburrimiento', 'Reuniones sociales', 'Insomnio'];

const clamp1to5 = (n: number) => Math.max(1, Math.min(5, Math.round(n))) as Scale1to5;

/**
 * Precarga una persona ficticia con ~15 días de sobriedad, para que la app
 * no arranque vacía. Se ejecuta una sola vez (marcada en settings), así que
 * borrar todos los datos reales del usuario después no la vuelve a disparar.
 */
export async function seedDatabaseIfEmpty(): Promise<void> {
  if (await getSetting(SEEDED_KEY, false)) return;

  const now = new Date();
  const nowIso = now.toISOString();

  await db.transaction(
    'rw',
    [db.habits, db.triggers, db.substances, db.contacts, db.dailyLogs, db.settings],
    async () => {
      const habitIds = await Promise.all(
        SAMPLE_HABITS.map((name) => db.habits.add({ name, active: true, createdAt: nowIso })),
      );
      const triggerIds = await Promise.all(
        SAMPLE_TRIGGERS.map((name) => db.triggers.add({ name, active: true, createdAt: nowIso })),
      );

      const demoSubstanceId = await db.substances.add({
        name: 'Alcohol',
        lastUseDate: toDateKey(addDays(now, -15)),
        createdAt: nowIso,
      });
      // Se guarda para poder avisar en Inicio que estos datos son de ejemplo,
      // y dejar de avisarlo en cuanto esta sustancia ya no exista.
      await setDemoSubstanceId(demoSubstanceId);

      await db.contacts.add({
        name: 'Camila (hermana)',
        phone: '+56 9 1234 5678',
        relationship: 'Familia',
        createdAt: nowIso,
      });

      const logs: Omit<DailyLog, 'id'>[] = [];
      for (let dayOffset = 14; dayOffset >= 0; dayOffset--) {
        const dayIndex = 14 - dayOffset; // 0 = hace 14 días, 14 = hoy
        const progress = dayIndex / 14; // mejora gradual a lo largo del período
        const didActivity = dayIndex % 2 === 0;
        const restingHeartRate = Math.round(86 - progress * 16 + (dayIndex % 3 === 0 ? 3 : 0));

        logs.push({
          date: toDateKey(addDays(now, -dayOffset)),
          restingHeartRate,
          minHeartRate: restingHeartRate - 8,
          maxHeartRate: restingHeartRate + 24,
          deviceUsed: 'Xiaomi Smart Band 10',
          craving: clamp1to5(4 - progress * 2 + (dayIndex % 4 === 0 ? 1 : 0)),
          triggerIds: dayIndex % 4 === 0 ? [triggerIds[0]] : [],
          sleepHours: Math.round((5.5 + progress * 2) * 2) / 2,
          sleepQuality: clamp1to5(2 + progress * 2),
          activityMinutes: didActivity ? 20 + (dayIndex % 3) * 10 : 0,
          activityType: didActivity ? 'Caminata' : undefined,
          energy: clamp1to5(2 + progress * 2),
          mood: clamp1to5(2 + progress * 2 - (dayIndex % 5 === 0 ? 1 : 0)),
          habitIds: didActivity ? [habitIds[0], habitIds[3]] : [habitIds[0]],
          notes: dayIndex === 0 ? 'Primer registro con Progreso Sobrio.' : undefined,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
      }

      await db.dailyLogs.bulkAdd(logs);
      await setSetting(SEEDED_KEY, true);
    },
  );
}
