package cl.progresosobrio.app.web

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** Qué se abre dentro del WebView: solo la PWA empaquetada, con https y bajo /www/. */
class PwaWebViewTest {

    private val host = "appassets.androidplatform.net"

    private fun esDeLaPwa(scheme: String?, host: String?, path: String?) =
        PwaWebView.esDireccionDeLaPwa(scheme, host, path)

    @Test
    fun `el origen y la dirección de inicio son los de la PWA empaquetada`() {
        // El puente solo acepta mensajes de ORIGIN: si cambia, hay que revisarlo a propósito.
        assertEquals("https://appassets.androidplatform.net", PwaWebView.ORIGIN)
        assertEquals("https://appassets.androidplatform.net/www/index.html", PwaWebView.START_URL)
    }

    @Test
    fun `los archivos de la PWA se abren dentro`() {
        assertTrue(esDeLaPwa("https", host, "/www/index.html"))
        assertTrue(esDeLaPwa("https", host, "/www/assets/index-Qw-LBGDN.js"))
    }

    @Test
    fun `http sin cifrar no se abre dentro`() {
        assertFalse(esDeLaPwa("http", host, "/www/index.html"))
    }

    @Test
    fun `otro dominio no se abre dentro, aunque se parezca`() {
        assertFalse(esDeLaPwa("https", "progresosobrio.cl", "/www/index.html"))
        assertFalse(esDeLaPwa("https", "$host.ejemplo.com", "/www/index.html"))
        assertFalse(esDeLaPwa("https", "otro-$host", "/www/index.html"))
    }

    @Test
    fun `fuera de www no se abre dentro`() {
        assertFalse(esDeLaPwa("https", host, "/otra/index.html"))
        assertFalse(esDeLaPwa("https", host, "/www")) // sin la barra final
        assertFalse(esDeLaPwa("https", host, "/"))
        assertFalse(esDeLaPwa("https", host, null))
    }

    @Test
    fun `sin esquema ni dominio no se abre dentro`() {
        assertFalse(esDeLaPwa(null, null, null))
        assertFalse(esDeLaPwa("javascript", null, null))
    }
}
