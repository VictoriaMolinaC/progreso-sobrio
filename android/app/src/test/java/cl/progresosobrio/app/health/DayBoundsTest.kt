package cl.progresosobrio.app.health

import org.junit.Assert.assertEquals
import org.junit.Test
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

class DayBoundsTest {

    private val santiago = ZoneId.of("America/Santiago")

    @Test
    fun `un día normal va de medianoche a medianoche`() {
        // 6 oct 2026 en Chile: horario de verano, UTC-3.
        val (inicio, fin) = dayBounds(LocalDate.of(2026, 10, 6), santiago)

        assertEquals(Instant.parse("2026-10-06T03:00:00Z"), inicio) // 00:00 hora local
        assertEquals(Instant.parse("2026-10-07T03:00:00Z"), fin)    // 00:00 del día siguiente
    }

    @Test
    fun `cambio de hora en Chile - el día empieza a la 01_00 y dura 23 horas`() {
        // 6 sep 2026: en Chile el reloj salta de 00:00 a 01:00, así que la medianoche no existe.
        val (inicio, fin) = dayBounds(LocalDate.of(2026, 9, 6), santiago)

        assertEquals(Instant.parse("2026-09-06T04:00:00Z"), inicio) // 01:00 hora local (UTC-3)
        assertEquals(Instant.parse("2026-09-07T03:00:00Z"), fin)    // 00:00 del 7 sep (UTC-3)
        assertEquals(23L, Duration.between(inicio, fin).toHours())
    }
}
