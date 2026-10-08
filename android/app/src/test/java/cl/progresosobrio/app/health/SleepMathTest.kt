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

    // Una sesión de sueño; sin etapas, salvo que se indiquen.
    private fun sesion(inicio: String, fin: String, etapas: List<SleepStage> = emptyList()) =
        SleepSession(local(inicio), local(fin), etapas)

    private fun dormido(inicio: String, fin: String) = SleepStage(local(inicio), local(fin), awake = false)
    private fun despierto(inicio: String, fin: String) = SleepStage(local(inicio), local(fin), awake = true)

    // Noche del 5 al 6 oct, 23:30 → 06:30 (420 min), con 30 min despierto: 390 min dormido.
    private val etapasNoche = listOf(
        dormido("2026-10-05T23:30", "2026-10-06T02:00"),   // 150 min
        despierto("2026-10-06T02:00", "2026-10-06T02:20"), // 20 min
        dormido("2026-10-06T02:20", "2026-10-06T05:00"),   // 160 min
        despierto("2026-10-06T05:00", "2026-10-06T05:10"), // 10 min
        dormido("2026-10-06T05:10", "2026-10-06T06:30"),   // 80 min
    )

    @Test
    fun `sesión que cruza la medianoche cuenta para el día en que termina`() {
        // Duerme de 23:30 del 5 oct a 06:30 del 6 oct = 7 h = 420 min.
        val sesiones = listOf(sesion("2026-10-05T23:30", "2026-10-06T06:30"))

        assertEquals(420L, sleepMinutesEndingOn(sesiones, hoy, santiago))
        // Y no se cuenta también para el día anterior.
        assertNull(sleepMinutesEndingOn(sesiones, hoy.minusDays(1), santiago))
    }

    @Test
    fun `dos sesiones del mismo día se suman`() {
        // Noche de 00:15 a 06:00 (345 min) + siesta de 15:00 a 15:40 (40 min) = 385 min.
        val sesiones = listOf(
            sesion("2026-10-06T00:15", "2026-10-06T06:00"),
            sesion("2026-10-06T15:00", "2026-10-06T15:40"),
        )

        assertEquals(385L, sleepMinutesEndingOn(sesiones, hoy, santiago))
    }

    @Test
    fun `sin sesiones es null`() {
        assertNull(sleepMinutesEndingOn(emptyList(), hoy, santiago))
    }

    @Test
    fun `sesión duplicada exacta cuenta una vez`() {
        // La misma noche escrita dos veces: 23:30 del 5 oct a 06:30 del 6 oct = 420 min.
        val noche = sesion("2026-10-05T23:30", "2026-10-06T06:30")

        assertEquals(420L, sleepMinutesEndingOn(listOf(noche, noche), hoy, santiago))
        // Y sigue contando solo para el día en que termina.
        assertNull(sleepMinutesEndingOn(listOf(noche, noche), hoy.minusDays(1), santiago))
    }

    @Test
    fun `sesiones parcialmente solapadas suman la unión`() {
        // 23:30 → 05:00 y 01:00 → 06:30: la unión es 23:30 → 06:30 = 420 min (no 330 + 330).
        val sesiones = listOf(
            sesion("2026-10-05T23:30", "2026-10-06T05:00"),
            sesion("2026-10-06T01:00", "2026-10-06T06:30"),
        )

        assertEquals(420L, sleepMinutesEndingOn(sesiones, hoy, santiago))
    }

    @Test
    fun `patrón de Mi Fitness más una siesta separada`() {
        // Cada sincronización reescribe la noche desde el mismo inicio, cada vez más larga.
        // La noche cuenta una vez (23:30 → 06:30 = 420 min) y la siesta se suma (40 min).
        val sesiones = listOf(
            sesion("2026-10-05T23:30", "2026-10-06T03:00"),
            sesion("2026-10-05T23:30", "2026-10-06T05:00"),
            sesion("2026-10-05T23:30", "2026-10-06T06:30"),
            sesion("2026-10-06T15:00", "2026-10-06T15:40"),
        )

        assertEquals(460L, sleepMinutesEndingOn(sesiones, hoy, santiago))
    }

    @Test
    fun `si ninguna sesión termina ese día es null y no cero`() {
        // Hay sueño, pero terminó el día anterior: para hoy no hay dato.
        val sesiones = listOf(sesion("2026-10-04T23:00", "2026-10-05T07:00"))

        assertNull(sleepMinutesEndingOn(sesiones, hoy, santiago))
    }

    // --- Etapas ---

    @Test
    fun `sesión con etapas descuenta los despertares`() {
        val noche = sesion("2026-10-05T23:30", "2026-10-06T06:30", etapasNoche)

        // 420 min de sesión − 30 min despierto = 390 min.
        assertEquals(390L, sleepMinutesEndingOn(listOf(noche), hoy, santiago))
    }

    @Test
    fun `siesta sin etapas suma completa junto a una noche con etapas`() {
        val sesiones = listOf(
            sesion("2026-10-05T23:30", "2026-10-06T06:30", etapasNoche), // 390 min dormido
            sesion("2026-10-06T15:00", "2026-10-06T15:40"),              // sin etapas: 40 min
        )

        assertEquals(430L, sleepMinutesEndingOn(sesiones, hoy, santiago))
    }

    @Test
    fun `sesiones solapadas con etapas no cuentan dos veces`() {
        // Como Mi Fitness: una copia parcial (hasta 03:00) y la noche completa, con las mismas etapas.
        val parcial = sesion(
            "2026-10-05T23:30", "2026-10-06T03:00",
            listOf(
                dormido("2026-10-05T23:30", "2026-10-06T02:00"),
                despierto("2026-10-06T02:00", "2026-10-06T02:20"),
                dormido("2026-10-06T02:20", "2026-10-06T03:00"),
            ),
        )
        val completa = sesion("2026-10-05T23:30", "2026-10-06T06:30", etapasNoche)

        assertEquals(390L, sleepMinutesEndingOn(listOf(parcial, completa), hoy, santiago))
    }
}
