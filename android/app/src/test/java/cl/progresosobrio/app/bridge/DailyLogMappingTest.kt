package cl.progresosobrio.app.bridge

import cl.progresosobrio.app.health.DayHealthData
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

/** Cómo viajan los datos del día a la PWA (readDayOk → WatchDayData). */
class DailyLogMappingTest {

    private val santiago = ZoneId.of("America/Santiago")
    private val dia = LocalDate.of(2026, 10, 8)

    // En la app el nombre lo da SourceLabels; aquí, un mapa fijo.
    private val nombres = mapOf(
        "com.xiaomi.wearable" to "Mi Fitness",
        "com.mi.health" to "Mi Fitness",
        "otra.app" to "Otra app",
    )
    private val etiqueta: (String) -> String = { nombres[it] ?: it }

    private fun datos(
        sources: Set<String> = setOf("com.xiaomi.wearable"),
        lastBpmTime: Instant? = Instant.parse("2026-10-08T18:08:00Z"),
    ) = DayHealthData(
        date = dia,
        restingBpm = 58,
        minBpm = 39,
        maxBpm = 128,
        avgBpm = 67,
        lastBpm = 108,
        lastBpmTime = lastBpmTime,
        sleepMinutes = 700,
        sleepMinBpm = 39,
        sleepAvgBpm = 66,
        sources = sources,
    )

    private fun watchDay(data: DayHealthData): JSONObject =
        JSONObject(readDayOk("a1", data, santiago, etiqueta)).getJSONObject("data")

    @Test
    fun `readDayOk lleva todos los campos`() {
        val respuesta = JSONObject(readDayOk("a1", datos(), santiago, etiqueta))
        assertEquals("readDayResult", respuesta.getString("type"))
        assertTrue(respuesta.getBoolean("ok"))

        val data = respuesta.getJSONObject("data")
        assertEquals("2026-10-08", data.getString("date"))
        assertEquals(58, data.getInt("restingBpm"))
        assertEquals(39, data.getInt("minBpm"))
        assertEquals(128, data.getInt("maxBpm"))
        assertEquals(67, data.getInt("avgBpm"))
        assertEquals(108, data.getInt("lastBpm"))
        assertEquals(700L, data.getLong("sleepMinutes"))
        assertEquals(39, data.getInt("sleepMinBpm"))
        assertEquals(66, data.getInt("sleepAvgBpm"))
        assertEquals("Mi Fitness", data.getJSONArray("sources").getString(0))
    }

    @Test
    fun `los valores que faltan viajan como null y no se omiten`() {
        val vacio = DayHealthData(
            date = dia, restingBpm = null, minBpm = null, maxBpm = null, avgBpm = null,
            lastBpm = null, lastBpmTime = null, sleepMinutes = null, sleepMinBpm = null,
            sleepAvgBpm = null, sources = emptySet(),
        )
        val data = watchDay(vacio)

        val campos = listOf(
            "restingBpm", "minBpm", "maxBpm", "avgBpm", "lastBpm",
            "lastBpmTime", "sleepMinutes", "sleepMinBpm", "sleepAvgBpm",
        )
        for (campo in campos) {
            assertTrue("$campo debe estar presente", data.has(campo))
            assertTrue("$campo debe ser null", data.isNull(campo))
        }
        assertEquals(0, data.getJSONArray("sources").length())
    }

    @Test
    fun `la última medición va en ISO 8601 con la zona del teléfono`() {
        // 18:08 UTC del 8 oct = 15:08 en Santiago (horario de verano, UTC-3).
        assertEquals("2026-10-08T15:08-03:00", watchDay(datos()).getString("lastBpmTime"))
    }

    @Test
    fun `las fuentes van con nombre legible, sin repetir y ordenadas`() {
        val data = watchDay(datos(sources = setOf("otra.app", "com.xiaomi.wearable", "com.mi.health")))
        val fuentes = data.getJSONArray("sources")

        assertEquals(2, fuentes.length())
        assertEquals("Mi Fitness", fuentes.getString(0))
        assertEquals("Otra app", fuentes.getString(1))
    }
}
