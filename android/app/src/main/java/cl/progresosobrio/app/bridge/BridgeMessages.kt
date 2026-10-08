package cl.progresosobrio.app.bridge

import org.json.JSONObject
import java.time.LocalDate
import java.time.format.DateTimeParseException

// Protocolo del puente PWA ↔ Android (v1). Contrato completo en android/PLAN.md, sección 6.
// Lógica pura: sin dependencias de Android, se prueba en BridgeMessagesTest.

/** Versión del protocolo. Un mensaje con otra versión se ignora. */
const val BRIDGE_PROTOCOL_VERSION = 1

/** Peticiones de la PWA a Android. */
sealed class BridgeRequest {
    abstract val id: String

    data class GetCapabilities(override val id: String) : BridgeRequest()
    data class ReadDay(override val id: String, val date: LocalDate) : BridgeRequest()
    data class SaveFile(
        override val id: String,
        val filename: String,
        val mime: String,
        val content: String,
    ) : BridgeRequest()
    data class OpenScreen(override val id: String, val screen: Screen) : BridgeRequest()

    /** Formato correcto pero algún campo inválido: se responde bad_request para que la PWA no quede esperando. */
    data class BadRequest(override val id: String, val type: String) : BridgeRequest()

    enum class Screen(val code: String) { WATCH_TEST("watchTest"), PRIVACY("privacy") }
}

/** Códigos de error hacia la PWA. Nunca se envían mensajes ni trazas. */
enum class BridgeError(val code: String) {
    HC_UNAVAILABLE("hc_unavailable"),
    HC_UPDATE_REQUIRED("hc_update_required"),
    NO_PERMISSION("no_permission"),
    NO_DATA("no_data"),
    CANCELLED("cancelled"),
    WRITE_FAILED("write_failed"),
    BAD_REQUEST("bad_request"),
    UNKNOWN("unknown"),
}

/** Nombre del tipo de la petición tal como viaja en el JSON ("readDay", "openScreen"…). */
val BridgeRequest.requestType: String
    get() = when (this) {
        is BridgeRequest.GetCapabilities -> "getCapabilities"
        is BridgeRequest.ReadDay -> "readDay"
        is BridgeRequest.SaveFile -> "saveFile"
        is BridgeRequest.OpenScreen -> "openScreen"
        is BridgeRequest.BadRequest -> type
    }

/**
 * Lee un mensaje de la PWA. Nunca lanza.
 * - null: no es un mensaje del protocolo (JSON roto, `v` distinta, sin `id`, `type` desconocido) → se ignora.
 * - BadRequest: el formato es correcto pero algún campo no (fecha inválida, pantalla desconocida…).
 */
fun parseBridgeRequest(json: String): BridgeRequest? = try {
    val obj = JSONObject(json)
    val id = obj.opt("id") as? String
    val type = obj.opt("type") as? String
    if (obj.opt("v") != BRIDGE_PROTOCOL_VERSION || id.isNullOrEmpty() || type == null) {
        null
    } else {
        when (type) {
            "getCapabilities" -> BridgeRequest.GetCapabilities(id)
            "readDay" -> parseDate(obj.opt("date"))
                ?.let { BridgeRequest.ReadDay(id, it) }
                ?: BridgeRequest.BadRequest(id, type)
            "saveFile" -> {
                val filename = obj.opt("filename") as? String
                val mime = obj.opt("mime") as? String
                val content = obj.opt("content") as? String
                if (filename.isNullOrBlank() || mime.isNullOrBlank() || content == null) {
                    BridgeRequest.BadRequest(id, type)
                } else {
                    BridgeRequest.SaveFile(id, filename, mime, content)
                }
            }
            "openScreen" -> BridgeRequest.Screen.entries.find { it.code == obj.opt("screen") }
                ?.let { BridgeRequest.OpenScreen(id, it) }
                ?: BridgeRequest.BadRequest(id, type)
            else -> null
        }
    }
} catch (e: Exception) {
    null
}

// "2026-10-07" → LocalDate; cualquier otra cosa → null.
private fun parseDate(value: Any?): LocalDate? = try {
    (value as? String)?.let { LocalDate.parse(it) }
} catch (e: DateTimeParseException) {
    null
}

/** Respuesta a getCapabilities: versión de la app, build de la PWA empaquetada y protocolo. */
fun capabilitiesResult(id: String, appVersion: String, pwaBuild: String): String =
    response(id, "getCapabilitiesResult", ok = true)
        .put("appVersion", appVersion)
        .put("pwaBuild", pwaBuild)
        .put("protocol", BRIDGE_PROTOCOL_VERSION)
        .toString()

/** Respuesta a openScreen. */
fun openScreenResult(id: String, ok: Boolean): String =
    response(id, "openScreenResult", ok).toString()

/** Error para cualquier petición: `<tipo>Result` con ok=false y solo un código. */
fun errorResult(id: String, requestType: String, error: BridgeError): String =
    response(id, "${requestType}Result", ok = false)
        .put("error", error.code)
        .toString()

private fun response(id: String, type: String, ok: Boolean): JSONObject = JSONObject()
    .put("v", BRIDGE_PROTOCOL_VERSION)
    .put("id", id)
    .put("type", type)
    .put("ok", ok)
