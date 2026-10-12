package cl.progresosobrio.app.backup

import org.junit.Assert.assertEquals
import org.junit.Test

/** Nombre de la copia del respaldo a restaurar: nunca sale de la carpeta de la caché. */
class ImportCopyTest {

    @Test
    fun nombreNormalSeMantiene() {
        assertEquals(
            "progreso-sobrio-datos-2026-10-12 (1).json",
            nombreSeguro("progreso-sobrio-datos-2026-10-12 (1).json"),
        )
    }

    @Test
    fun seQuitanLasCarpetas() {
        assertEquals("respaldo.json", nombreSeguro("../../otra/respaldo.json"))
        assertEquals("respaldo.json", nombreSeguro("C:\\carpeta\\respaldo.json"))
    }

    @Test
    fun sinNombreUsable() {
        assertEquals("respaldo.json", nombreSeguro(null))
        assertEquals("respaldo.json", nombreSeguro(""))
        assertEquals("respaldo.json", nombreSeguro(".."))
        assertEquals("respaldo.json", nombreSeguro("carpeta/"))
    }
}
