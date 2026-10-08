package cl.progresosobrio.app.health

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId

class DayPulseTest {

    private val santiago = ZoneId.of("America/Santiago")

    // Arma un instante a partir de una fecha y hora local de Santiago, ej. "2026-10-07T06:30".
    private fun local(fechaHora: String): Instant =
        LocalDateTime.parse(fechaHora).atZone(santiago).toInstant()

    // El día 7 oct 2026, de 00:00 (incluido) a 00:00 del 8 (excluido).
    private val inicio = local("2026-10-07T00:00")
    private val fin = local("2026-10-08T00:00")

    @Test
    fun `muestras repetidas en registros superpuestos cuentan una vez`() {
        // Como Mi Fitness: cada sincronización reescribe un registro más largo con las mismas muestras.
        val a = local("2026-10-07T02:00") to 50
        val b = local("2026-10-07T08:00") to 60
        val c = local("2026-10-07T12:00") to 85
        val muestras = listOf(a) + listOf(a, b) + listOf(a, b, c)

        // Contando repetidas: (50·3 + 60·2 + 85) / 6 = 59,2 → 59.
        // Contando una vez: (50 + 60 + 85) / 3 = 65.
        assertEquals(DayPulse(minBpm = 50, maxBpm = 85, avgBpm = 65), dayPulse(muestras, inicio, fin))
    }

    @Test
    fun `solo cuentan las muestras del día`() {
        val muestras = listOf(
            local("2026-10-06T22:00") to 120, // noche anterior: no cuenta
            local("2026-10-07T03:00") to 52,
            local("2026-10-07T15:00") to 70,
            local("2026-10-08T01:00") to 45,  // día siguiente: no cuenta
        )

        assertEquals(DayPulse(minBpm = 52, maxBpm = 70, avgBpm = 61), dayPulse(muestras, inicio, fin))
    }

    @Test
    fun `muestra justo a medianoche cuenta y la de la medianoche siguiente no`() {
        val muestras = listOf(inicio to 58, fin to 99)

        assertEquals(DayPulse(minBpm = 58, maxBpm = 58, avgBpm = 58), dayPulse(muestras, inicio, fin))
    }

    @Test
    fun `un solo bloque de 30 minutos`() {
        // Bloque de 10:00 a 10:29 con varias muestras.
        val muestras = listOf(
            local("2026-10-07T10:00") to 72,
            local("2026-10-07T10:10") to 80,
            local("2026-10-07T10:20") to 76,
        )

        assertEquals(DayPulse(minBpm = 72, maxBpm = 80, avgBpm = 76), dayPulse(muestras, inicio, fin))
    }

    @Test
    fun `sin muestras en el día es null`() {
        val soloDelDiaAnterior = listOf(local("2026-10-06T23:00") to 70)

        assertNull(dayPulse(emptyList(), inicio, fin))
        assertNull(dayPulse(soloDelDiaAnterior, inicio, fin))
    }

    @Test
    fun `el promedio se redondea al entero más cercano`() {
        val muestras = listOf(
            local("2026-10-07T09:00") to 60,
            local("2026-10-07T09:10") to 61,
        )

        // (60 + 61) / 2 = 60,5 → 61.
        assertEquals(DayPulse(minBpm = 60, maxBpm = 61, avgBpm = 61), dayPulse(muestras, inicio, fin))
    }
}
