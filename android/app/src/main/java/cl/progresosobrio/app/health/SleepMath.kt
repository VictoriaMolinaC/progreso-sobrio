package cl.progresosobrio.app.health

import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

/** Una sesión de sueño. [stages] queda vacía si la app que la escribió no informa etapas. */
data class SleepSession(
    val start: Instant,
    val end: Instant,
    val stages: List<SleepStage> = emptyList(),
)

/** Una etapa dentro de la sesión. [awake] = despierto, despierto en cama o fuera de la cama. */
data class SleepStage(val start: Instant, val end: Instant, val awake: Boolean)

/**
 * Minutos de sueño que cuentan para [date].
 *
 * Una sesión cuenta para el día en que termina: así el sueño que cruza la medianoche
 * cuenta para el día en que uno despierta.
 *
 * De cada sesión se toman los tramos dormidos: sus etapas que no son "despierto"; si la
 * sesión no trae etapas, la sesión completa. Mi Fitness repite la misma noche en cada
 * sincronización (sesiones superpuestas, con el mismo inicio y finales cada vez más tarde),
 * así que los tramos que se superponen o se tocan se fusionan y se suma la unión: cada
 * minuto dormido cuenta una vez. Sesiones separadas (noche y siesta) se siguen sumando.
 *
 * Devuelve null si ninguna sesión termina ese día (no hay dato, no es "0 horas").
 */
fun sleepMinutesEndingOn(
    sessions: List<SleepSession>,
    date: LocalDate,
    zone: ZoneId,
): Long? {
    val (dayStart, dayEnd) = dayBounds(date, zone)

    // Solo las sesiones cuyo fin cae dentro del día [inicio, fin).
    val endingThatDay = sessions.filter { !it.end.isBefore(dayStart) && it.end.isBefore(dayEnd) }
    if (endingThatDay.isEmpty()) return null

    val asleep = endingThatDay.flatMap { session ->
        if (session.stages.isEmpty()) {
            listOf(session.start to session.end)
        } else {
            session.stages.filterNot { it.awake }.map { it.start to it.end }
        }
    }

    return mergeOverlapping(asleep)
        .fold(Duration.ZERO) { total, (start, end) -> total + Duration.between(start, end) }
        .toMinutes()
}

/** Une los intervalos que se superponen o se tocan. Devuelve intervalos separados, ordenados por inicio. */
internal fun mergeOverlapping(intervals: List<Pair<Instant, Instant>>): List<Pair<Instant, Instant>> {
    val merged = mutableListOf<Pair<Instant, Instant>>()
    for ((start, end) in intervals.sortedBy { it.first }) {
        val last = merged.lastOrNull()
        if (last != null && start <= last.second) {
            merged[merged.lastIndex] = last.first to maxOf(last.second, end)
        } else {
            merged += start to end
        }
    }
    return merged
}
