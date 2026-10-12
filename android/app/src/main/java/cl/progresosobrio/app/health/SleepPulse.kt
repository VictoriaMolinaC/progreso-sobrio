package cl.progresosobrio.app.health

import java.time.Instant
import kotlin.math.roundToInt

/** Pulso mientras se dormía: mínimo y promedio (redondeado al entero). */
data class SleepPulse(val minBpm: Int, val avgBpm: Int)

/**
 * Pulso durante el sueño, calculado solo con muestras reales.
 *
 * Cuentan las muestras que caen dentro de alguna sesión, con la regla [inicio, fin):
 * una muestra justo en el inicio cuenta, una justo en el fin no.
 * Cada muestra cuenta una sola vez, aunque dos sesiones se superpongan.
 * Si la misma muestra (mismo momento y mismo lpm) llega repetida, también cuenta una vez.
 *
 * Devuelve null si no hay sesiones o si ninguna muestra cae dentro de ellas.
 */
fun sleepPulse(
    samples: List<Pair<Instant, Int>>,         // (momento, lpm)
    sessions: List<Pair<Instant, Instant>>,    // (inicio, fin)
): SleepPulse? {
    val bpmWhileAsleep = samples
        .distinct() // Mi Fitness repite la misma muestra en registros que se superponen
        .filter { (time, _) -> sessions.any { (start, end) -> time >= start && time < end } }
        .map { (_, bpm) -> bpm }
    if (bpmWhileAsleep.isEmpty()) return null

    return SleepPulse(
        minBpm = bpmWhileAsleep.min(),
        avgBpm = bpmWhileAsleep.average().roundToInt(),
    )
}
