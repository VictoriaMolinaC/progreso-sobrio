package cl.progresosobrio.app.health

import org.junit.Assert.assertEquals
import org.junit.Test

/** Nombre de la app de origen cuando Android no deja ver el nombre real. */
class SourceLabelsTest {

    @Test
    fun `Mi Fitness se reconoce por su paquete`() {
        assertEquals("Mi Fitness", nombreConocido("com.xiaomi.wearable"))
    }

    @Test
    fun `una app desconocida muestra su paquete tal cual`() {
        assertEquals("com.ejemplo.reloj", nombreConocido("com.ejemplo.reloj"))
    }
}
