package cl.progresosobrio.app.web

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/** Qué enlaces de la PWA salen de la app: solo teléfono, correo y web cifrada. */
class ExternalLinksTest {

    @Test
    fun `tel, mailto y https salen de la app`() {
        assertEquals(TipoDeEnlace.MARCADOR, tipoDeEnlace("tel"))
        assertEquals(TipoDeEnlace.CORREO, tipoDeEnlace("mailto"))
        assertEquals(TipoDeEnlace.WEB, tipoDeEnlace("https"))
    }

    @Test
    fun `el esquema se reconoce aunque venga en mayúsculas`() {
        assertEquals(TipoDeEnlace.MARCADOR, tipoDeEnlace("TEL"))
        assertEquals(TipoDeEnlace.CORREO, tipoDeEnlace("MailTo"))
        assertEquals(TipoDeEnlace.WEB, tipoDeEnlace("HTTPS"))
    }

    @Test
    fun `http sin cifrar no se abre`() {
        assertNull(tipoDeEnlace("http"))
    }

    @Test
    fun `esquemas peligrosos o internos no se abren`() {
        val bloqueados = listOf("javascript", "file", "intent", "content", "data", "blob", "market", "sms", "geo", "ftp")
        for (esquema in bloqueados) {
            assertNull("$esquema: no debería salir de la app", tipoDeEnlace(esquema))
        }
    }

    @Test
    fun `sin esquema no se abre`() {
        assertNull(tipoDeEnlace(null))
        assertNull(tipoDeEnlace(""))
    }

    @Test
    fun `la política de privacidad se abre en el navegador`() {
        assertEquals(TipoDeEnlace.WEB, tipoDeEnlace(URL_POLITICA_PRIVACIDAD.substringBefore(':')))
    }

    @Test
    fun `la política es la misma que enlaza la PWA`() {
        // Los tests corren desde android/app: la PWA está dos carpetas más arriba.
        val constantes = File("../../src/lib/constants.ts")
        assertTrue("No se encontró ${constantes.absolutePath}", constantes.isFile)
        val urlPwa = Regex("""privacyUrl:\s*'([^']+)'""").find(constantes.readText())?.groupValues?.get(1)
        assertEquals(urlPwa, URL_POLITICA_PRIVACIDAD)
    }
}
