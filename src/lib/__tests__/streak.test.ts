import { describe, it, expect } from 'vitest';
import { getStreakDays } from '../streak';

describe('getStreakDays - Cálculo de rachas de sobriedad', () => {
  it('TC_STREAK_01: Debe calcular correctamente los días de abstinencia para una fecha reciente', () => {
    // Último consumo hace 7 días
    const lastUseDate = '2026-10-15';
    const today = new Date(2026, 9, 22); // Octubre 22

    const streak = getStreakDays(lastUseDate, today);

    expect(streak).toBe(7);
  });

  it('Debe devolver 0 si el último consumo fue hoy', () => {
    const lastUseDate = '2026-10-22';
    const today = new Date(2026, 9, 22); // Octubre 22

    const streak = getStreakDays(lastUseDate, today);

    expect(streak).toBe(0);
  });

  it('Debe devolver 0 si el último consumo es futuro (caso borde)', () => {
    const lastUseDate = '2026-10-25';
    const today = new Date(2026, 9, 22); // Octubre 22

    const streak = getStreakDays(lastUseDate, today);

    expect(streak).toBe(0);
  });

  it('Debe calcular correctamente rachas largas (meses)', () => {
    const lastUseDate = '2026-01-01';
    const today = new Date(2026, 9, 22); // Octubre 22

    const streak = getStreakDays(lastUseDate, today);

    // De 2026-01-01 a 2026-10-22 son exactamente 294 días
    expect(streak).toBe(294);
  });

  it('Debe usar la fecha actual por defecto si no se proporciona', () => {
    const lastUseDate = '2026-10-20';
    const streak = getStreakDays(lastUseDate);

    // Debe ser un número positivo (no podemos asegurar el valor exacto sin mockear Date)
    expect(streak).toBeGreaterThanOrEqual(0);
    expect(typeof streak).toBe('number');
  });

  it('Debe manejar correctamente años bisiestos', () => {
    // 2024 es bisiesto, 29 de febrero existe
    const lastUseDate = '2024-02-28';
    const today = new Date(2024, 2, 1); // 1 de marzo (marzo es 2)

    const streak = getStreakDays(lastUseDate, today);

    expect(streak).toBe(2); // 28 feb + 29 feb = 2 días
  });

  it('Debe calcular rachas con múltiples sustancias en paralelo', () => {
    const substance1LastUse = '2026-09-01';
    const substance2LastUse = '2026-10-01';
    const today = new Date(2026, 9, 22); // Octubre 22

    const streak1 = getStreakDays(substance1LastUse, today);
    const streak2 = getStreakDays(substance2LastUse, today);

    expect(streak1).toBeGreaterThan(streak2);
    expect(streak2).toBe(21);
  });

  it('Debe ser consistente independientemente de la hora del día', () => {
    const lastUseDate = '2026-10-15';
    const morning = new Date(2026, 9, 22, 9, 0, 0);
    const afternoon = new Date(2026, 9, 22, 18, 0, 0);
    const midnight = new Date(2026, 9, 22, 23, 59, 59);

    const streakMorning = getStreakDays(lastUseDate, morning);
    const streakAfternoon = getStreakDays(lastUseDate, afternoon);
    const streakMidnight = getStreakDays(lastUseDate, midnight);

    expect(streakMorning).toBe(streakAfternoon);
    expect(streakAfternoon).toBe(streakMidnight);
    expect(streakMorning).toBe(7);
  });

  it('Debe calcular correctamente cruzando el cambio de hora DST en Chile (America/Santiago)', () => {
    // En 2026 Chile adelanta el reloj el domingo 13 de septiembre
    // La racha debe contar días calendario, no horas
    const originalTZ = process.env['TZ'];
    process.env['TZ'] = 'America/Santiago';
    try {
      const lastUseDate = '2026-09-12';
      const today = new Date(2026, 8, 14); // 14 de septiembre (mes 8 = septiembre)
      const streak = getStreakDays(lastUseDate, today);
      expect(streak).toBe(2);
    } finally {
      if (originalTZ === undefined) {
        delete process.env['TZ'];
      } else {
        process.env['TZ'] = originalTZ;
      }
    }
  });
});
