package cl.progresosobrio.app.bridge

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate

class BridgeMessagesTest {

    // Arma un mensaje v1 con id "a1" y los campos que se le pasen.
    private fun mensaje(campos: String) = """{"v":1,"id":"a1",$campos}"""

    // --- Peticiones válidas ---

    @Test
    fun `getCapabilities válido`() {
        assertEquals(
            BridgeRequest.GetCapabilities("a1"),
            parseBridgeRequest(mensaje(""""type":"getCapabilities"""")),
        )
    }

    @Test
    fun `readDay válido con fecha local`() {
        assertEquals(
            BridgeRequest.ReadDay("a1", LocalDate.of(2026, 10, 7)),
            parseBridgeRequest(mensaje(""""type":"readDay","date":"2026-10-07"""")),
        )
    }

    @Test
    fun `saveFile válido`() {
        assertEquals(
            BridgeRequest.SaveFile("a1", "respaldo.json", "application/json", "{}"),
            parseBridgeRequest(
                mensaje(""""type":"saveFile","filename":"respaldo.json","mime":"application/json","content":"{}"""")
            ),
        )
    }

    @Test
    fun `openScreen válido para las dos pantallas`() {
        assertEquals(
            BridgeRequest.OpenScreen("a1", BridgeRequest.Screen.WATCH_TEST),
            parseBridgeRequest(mensaje(""""type":"openScreen","screen":"watchTest"""")),
        )
        assertEquals(
            BridgeRequest.OpenScreen("a1", BridgeRequest.Screen.PRIVACY),
            parseBridgeRequest(mensaje(""""type":"openScreen","screen":"privacy"""")),
        )
    }

    // --- Mensajes que no son del protocolo: se ignoran (null) ---

    @Test
    fun `versión distinta o ausente se ignora`() {
        assertNull(parseBridgeRequest("""{"v":2,"id":"a1","type":"getCapabilities"}"""))
        assertNull(parseBridgeRequest("""{"v":"1","id":"a1","type":"getCapabilities"}"""))
        assertNull(parseBridgeRequest("""{"id":"a1","type":"getCapabilities"}"""))
    }

    @Test
    fun `type desconocido se ignora`() {
        assertNull(parseBridgeRequest(mensaje(""""type":"borrarTodo"""")))
        assertNull(parseBridgeRequest(mensaje(""""type":"getCapabilitiesResult"""")))
    }

    @Test
    fun `JSON roto o que no es un objeto se ignora`() {
        assertNull(parseBridgeRequest("{roto"))
        assertNull(parseBridgeRequest(""))
        assertNull(parseBridgeRequest("[]"))
        assertNull(parseBridgeRequest("null"))
    }

    @Test
    fun `id ausente, vacío o que no es texto se ignora`() {
        assertNull(parseBridgeRequest("""{"v":1,"type":"getCapabilities"}"""))
        assertNull(parseBridgeRequest("""{"v":1,"id":"","type":"getCapabilities"}"""))
        assertNull(parseBridgeRequest("""{"v":1,"id":7,"type":"getCapabilities"}"""))
    }

    // --- Formato correcto con un campo inválido: bad_request ---

    @Test
    fun `readDay con fecha inválida o ausente es BadRequest`() {
        val esperado = BridgeRequest.BadRequest("a1", "readDay")
        assertEquals(esperado, parseBridgeRequest(mensaje(""""type":"readDay","date":"2026-13-01"""")))
        assertEquals(esperado, parseBridgeRequest(mensaje(""""type":"readDay","date":"7/10/2026"""")))
        assertEquals(esperado, parseBridgeRequest(mensaje(""""type":"readDay"""")))
    }

    @Test
    fun `openScreen con pantalla desconocida es BadRequest`() {
        assertEquals(
            BridgeRequest.BadRequest("a1", "openScreen"),
            parseBridgeRequest(mensaje(""""type":"openScreen","screen":"ajustes"""")),
        )
    }

    @Test
    fun `saveFile sin nombre de archivo es BadRequest`() {
        assertEquals(
            BridgeRequest.BadRequest("a1", "saveFile"),
            parseBridgeRequest(mensaje(""""type":"saveFile","mime":"text/csv","content":"a,b"""")),
        )
    }

    // --- Respuestas ---

    @Test
    fun `capabilitiesResult lleva todos sus campos`() {
        val json = JSONObject(capabilitiesResult("a1", appVersion = "1.0", pwaBuild = "4dafa9d"))

        assertEquals(1, json.getInt("v"))
        assertEquals("a1", json.getString("id"))
        assertEquals("getCapabilitiesResult", json.getString("type"))
        assertTrue(json.getBoolean("ok"))
        assertEquals("1.0", json.getString("appVersion"))
        assertEquals("4dafa9d", json.getString("pwaBuild"))
        assertEquals(1, json.getInt("protocol"))
    }

    @Test
    fun `openScreenResult informa si se abrió`() {
        val json = JSONObject(openScreenResult("a1", ok = false))

        assertEquals("openScreenResult", json.getString("type"))
        assertFalse(json.getBoolean("ok"))
    }

    @Test
    fun `errorResult usa el tipo de la petición y solo un código`() {
        val json = JSONObject(errorResult("a1", "readDay", BridgeError.BAD_REQUEST))

        assertEquals("a1", json.getString("id"))
        assertEquals("readDayResult", json.getString("type"))
        assertFalse(json.getBoolean("ok"))
        assertEquals("bad_request", json.getString("error"))
        assertEquals(5, json.length()) // v, id, type, ok, error: nada más
    }
}
