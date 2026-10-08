package cl.progresosobrio.app.health

import java.time.Instant
import kotlin.math.roundToInt

/** Pulso del día: mínimo, máximo y promedio (redondeado al entero). */
data class DayPulse(val minBpm: Int, val maxBpm: Int, val avgBpm: Int)

/**
 * Pulso del día calculado solo con muestras reales, cada una contada una vez.
 *
 * Mi Fitness reescribe registros que se superponen, así que la misma muestra
 * (mismo momento y mismo lpm) puede llegar varias veces: cuenta una sola.
 * Cuentan las muestras dentro de [start, end): la de las 00:00 cuenta,
 * la de las 00:00 del día siguiente no.
 *
 * Devuelve null si no queda ninguna muestra dentro del día.
 */
fun dayPulse(
    samples: List<Pair<Instant, Int>>,   // (momento, lpm)
    start: Instant,
    end: Instant,
): DayPulse? {
    val bpmOfDay = samples
        .distinct()
        .filter { (time, _) -> time >= start && time < end }
        .map { (_, bpm) -> bpm }
    if (bpmOfDay.isEmpty()) return null

    return DayPulse(
        minBpm = bpmOfDay.min(),
        maxBpm = bpmOfDay.max(),
        avgBpm = bpmOfDay.average().roundToInt(),
    )
}
