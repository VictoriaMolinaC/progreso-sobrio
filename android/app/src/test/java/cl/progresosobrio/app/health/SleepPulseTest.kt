package cl.progresosobrio.app.health

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId

class SleepPulseTest {

    private val santiago = ZoneId.of("America/Santiago")

    // Arma un instante a partir de una fecha y hora local de Santiago, ej. "2026-10-07T06:30".
    private fun local(fechaHora: String): Instant =
        LocalDateTime.parse(fechaHora).atZone(santiago).toInstant()

    // Noche del 6 al 7 oct 2026: de 23:30 a 06:30.
    private val noche = local("2026-10-06T23:30") to local("2026-10-07T06:30")

    @Test
    fun `solo cuentan las muestras dentro de la sesión`() {
        val muestras = listOf(
            local("2026-10-06T22:00") to 80, // antes de dormir: no cuenta
            local("2026-10-07T01:00") to 50,
            local("2026-10-07T03:00") to 54,
            local("2026-10-07T08:00") to 90, // ya despierta: no cuenta
        )

        assertEquals(SleepPulse(minBpm = 50, avgBpm = 52), sleepPulse(muestras, listOf(noche)))
    }

    @Test
    fun `dos sesiones se juntan y el promedio se redondea`() {
        val siesta = local("2026-10-07T15:00") to local("2026-10-07T15:40")
        val muestras = listOf(
            local("2026-10-07T02:00") to 47, // en la noche
            local("2026-10-07T15:20") to 64, // en la siesta
        )

        // Promedio (47 + 64) / 2 = 55,5 → 56.
        assertEquals(SleepPulse(minBpm = 47, avgBpm = 56), sleepPulse(muestras, listOf(noche, siesta)))
    }

    @Test
    fun `sin muestras dentro de las sesiones es null`() {
        val muestrasDeDia = listOf(local("2026-10-07T10:00") to 75)

        assertNull(sleepPulse(muestrasDeDia, listOf(noche)))
        assertNull(sleepPulse(emptyList(), listOf(noche)))
    }

    @Test
    fun `sin sesiones es null`() {
        val muestras = listOf(local("2026-10-07T02:00") to 50)

        assertNull(sleepPulse(muestras, emptyList()))
    }

    @Test
    fun `muestra justo en el inicio cuenta y justo en el fin no`() {
        val (inicio, fin) = noche
        val muestras = listOf(inicio to 60, fin to 90)

        assertEquals(SleepPulse(minBpm = 60, avgBpm = 60), sleepPulse(muestras, listOf(noche)))
    }

    @Test
    fun `con sesiones superpuestas cada muestra cuenta una sola vez`() {
        // Otra sesión que se cruza con la noche (por ejemplo, escrita por otra app).
        val otra = local("2026-10-07T00:00") to local("2026-10-07T07:00")
        val muestras = listOf(
            local("2026-10-07T02:00") to 50, // dentro de las dos sesiones
            local("2026-10-07T06:45") to 62, // solo dentro de "otra"
        )

        // Si la de las 02:00 contara doble, el promedio sería (50 + 50 + 62) / 3 = 54.
        // Contando una vez: (50 + 62) / 2 = 56.
        assertEquals(SleepPulse(minBpm = 50, avgBpm = 56), sleepPulse(muestras, listOf(noche, otra)))
    }

    @Test
    fun `una muestra repetida en dos registros cuenta una vez`() {
        // Mi Fitness reescribe registros que se superponen: la misma medición llega dos veces.
        val muestras = listOf(
            local("2026-10-07T02:00") to 50,
            local("2026-10-07T02:00") to 50, // la misma muestra, desde otro registro
            local("2026-10-07T04:00") to 62,
        )

        // Si contara doble, el promedio sería (50 + 50 + 62) / 3 = 54.
        // Contando una vez: (50 + 62) / 2 = 56.
        assertEquals(SleepPulse(minBpm = 50, avgBpm = 56), sleepPulse(muestras, listOf(noche)))
    }
}
