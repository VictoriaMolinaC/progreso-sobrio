package cl.progresosobrio.app.health

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId

class SleepMathTest {

    private val santiago = ZoneId.of("America/Santiago")
    private val hoy = LocalDate.of(2026, 10, 6)

    // Arma un instante a partir de una fecha y hora local de Santiago, ej. "2026-10-06T06:30".
    private fun local(fechaHora: String): Instant =
        LocalDateTime.parse(fechaHora).atZone(santiago).toInstant()

    @Test
    fun `sesión que cruza la medianoche cuenta para el día en que termina`() {
        // Duerme de 23:30 del 5 oct a 06:30 del 6 oct = 7 h = 420 min.
        val sesiones = listOf(local("2026-10-05T23:30") to local("2026-10-06T06:30"))

        assertEquals(420L, sleepMinutesEndingOn(sesiones, hoy, santiago))
        // Y no se cuenta también para el día anterior.
        assertNull(sleepMinutesEndingOn(sesiones, hoy.minusDays(1), santiago))
    }

    @Test
    fun `dos sesiones del mismo día se suman`() {
        // Noche de 00:15 a 06:00 (345 min) + siesta de 15:00 a 15:40 (40 min) = 385 min.
        val sesiones = listOf(
            local("2026-10-06T00:15") to local("2026-10-06T06:00"),
            local("2026-10-06T15:00") to local("2026-10-06T15:40"),
        )

        assertEquals(385L, sleepMinutesEndingOn(sesiones, hoy, santiago))
    }

    @Test
    fun `sin sesiones es null`() {
        assertNull(sleepMinutesEndingOn(emptyList(), hoy, santiago))
    }

    @Test
    fun `si ninguna sesión termina ese día es null y no cero`() {
        // Hay sueño, pero terminó el día anterior: para hoy no hay dato.
        val sesiones = listOf(local("2026-10-04T23:00") to local("2026-10-05T07:00"))

        assertNull(sleepMinutesEndingOn(sesiones, hoy, santiago))
    }
}
