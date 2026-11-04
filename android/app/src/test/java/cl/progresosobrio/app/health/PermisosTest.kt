package cl.progresosobrio.app.health

import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * Permisos de Health Connect que pide la app. Si alguien agrega otro (pasos, ubicación…), este
 * test falla: antes hay que revisar el AndroidManifest y la Política de privacidad.
 */
class PermisosTest {

    @Test
    fun `solo pide leer pulso, pulso en reposo y sueño`() {
        assertEquals(
            setOf(
                "android.permission.health.READ_HEART_RATE",
                "android.permission.health.READ_RESTING_HEART_RATE",
                "android.permission.health.READ_SLEEP",
            ),
            HealthConnectReader.PERMISOS,
        )
    }
}
