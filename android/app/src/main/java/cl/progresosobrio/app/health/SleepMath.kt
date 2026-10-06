package cl.progresosobrio.app.health

import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

/**
 * Minutos de sueño que cuentan para [date].
 *
 * Cada sesión es un par (inicio, fin). Una sesión cuenta para el día en que
 * termina: así el sueño que cruza la medianoche cuenta para el día en que uno despierta.
 *
 * Devuelve null si ninguna sesión termina ese día (no hay dato, no es "0 horas").
 */
fun sleepMinutesEndingOn(
    sessions: List<Pair<Instant, Instant>>,
    date: LocalDate,
    zone: ZoneId,
): Long? {
    val (dayStart, dayEnd) = dayBounds(date, zone)

    // Solo las sesiones cuyo fin cae dentro del día [inicio, fin).
    val endingThatDay = sessions.filter { (_, end) ->
        !end.isBefore(dayStart) && end.isBefore(dayEnd)
    }
    if (endingThatDay.isEmpty()) return null

    return endingThatDay.sumOf { (start, end) -> Duration.between(start, end).toMinutes() }
}
