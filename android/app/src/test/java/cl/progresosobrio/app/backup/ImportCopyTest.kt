package cl.progresosobrio.app.backup

import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream

/**
 * Copia del respaldo a restaurar: el nombre nunca sale de la carpeta de la caché, y un archivo
 * demasiado grande no se copia.
 */
class ImportCopyTest {

    @Test
    fun nombreDiscretoSeMantiene() {
        assertEquals("ps-2026-11-04.json", nombreSeguro("ps-2026-11-04.json"))
        assertEquals("ps-2026-11-04 (1).json", nombreSeguro("ps-2026-11-04 (1).json"))
    }

    @Test
    fun nombreAntiguoSeMantiene() {
        // Los respaldos de antes de los nombres ps-… se siguen restaurando.
        assertEquals(
            "progreso-sobrio-datos-2026-10-12 (1).json",
            nombreSeguro("progreso-sobrio-datos-2026-10-12 (1).json"),
        )
    }

    @Test
    fun seQuitanLosEspaciosDeLosBordes() {
        assertEquals("ps-2026-11-04.json", nombreSeguro("  ps-2026-11-04.json "))
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
        assertEquals("respaldo.json", nombreSeguro("   "))
        assertEquals("respaldo.json", nombreSeguro("."))
        assertEquals("respaldo.json", nombreSeguro(".."))
        assertEquals("respaldo.json", nombreSeguro("carpeta/"))
    }

    @Test
    fun copiaCompletaHastaElLimite() {
        // Más grande que el búfer de 8 KB, para que se copie en varias vueltas.
        val datos = ByteArray(20_000) { (it % 251).toByte() }
        val salida = ByteArrayOutputStream()
        assertTrue(ImportCopy.copiarConLimite(ByteArrayInputStream(datos), salida, maxBytes = 20_000))
        assertArrayEquals(datos, salida.toByteArray())
    }

    @Test
    fun archivoVacioSeCopia() {
        // Aquí no falla: la PWA es la que revisa el archivo y lo rechaza si no es un respaldo.
        val salida = ByteArrayOutputStream()
        assertTrue(ImportCopy.copiarConLimite(ByteArrayInputStream(ByteArray(0)), salida, maxBytes = 20_000))
        assertEquals(0, salida.size())
    }

    @Test
    fun archivoSobreElLimiteNoSeCopia() {
        val datos = ByteArray(20_001)
        assertFalse(ImportCopy.copiarConLimite(ByteArrayInputStream(datos), ByteArrayOutputStream(), maxBytes = 20_000))
    }
}
