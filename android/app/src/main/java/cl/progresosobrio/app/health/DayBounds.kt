package cl.progresosobrio.app.health

import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

/**
 * Inicio y fin de un día en hora local, como instantes.
 * Inicio: 00:00 de ese día (incluido). Fin: 00:00 del día siguiente (excluido).
 *
 * Si ese día la medianoche no existe por el cambio de hora (pasa en Chile en
 * septiembre), el día empieza en la primera hora válida, por ejemplo 01:00.
 */
fun dayBounds(date: LocalDate, zone: ZoneId): Pair<Instant, Instant> {
    val start = date.atStartOfDay(zone).toInstant()
    val end = date.plusDays(1).atStartOfDay(zone).toInstant()
    return start to end
}
