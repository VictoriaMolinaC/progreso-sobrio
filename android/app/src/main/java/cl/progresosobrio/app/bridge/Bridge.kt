package cl.progresosobrio.app.bridge

import android.content.ActivityNotFoundException
import android.content.Intent
import android.util.Log
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.health.connect.client.HealthConnectClient
import androidx.lifecycle.lifecycleScope
import androidx.webkit.WebMessageCompat
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import cl.progresosobrio.app.PrivacyActivity
import cl.progresosobrio.app.WatchTestActivity
import cl.progresosobrio.app.backup.SaveFile
import cl.progresosobrio.app.health.HealthConnectReader
import cl.progresosobrio.app.health.sourceLabel
import cl.progresosobrio.app.web.PwaWebView
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import org.json.JSONObject
import java.time.ZoneId

// Los logs solo dicen estados, nunca el contenido de los mensajes ni valores de salud.
private const val TAG = "Bridge"

/** Nombre del objeto que ve la PWA: window.ProgresoSobrioAndroid. */
private const val JS_OBJECT_NAME = "ProgresoSobrioAndroid"

/**
 * Puente entre la PWA (dentro del WebView) y la parte nativa.
 * La PWA envía JSON con window.ProgresoSobrioAndroid.postMessage(...) y recibe la respuesta
 * como evento "message". Solo se aceptan mensajes del origen propio y del marco principal.
 *
 * Atiende getCapabilities, openScreen, readDay y saveFile.
 *
 * @param requestPermissions abre el diálogo de permisos de Health Connect y devuelve si
 *   quedaron concedidos los tres.
 * @param saveFile "Guardar como" del sistema, para los respaldos.
 */
class Bridge(
    private val activity: ComponentActivity,
    private val reader: HealthConnectReader,
    private val requestPermissions: suspend () -> Boolean,
    private val saveFile: SaveFile,
) {

    // readDay se atiende de a uno: nunca dos diálogos de permisos encima.
    private val readDayMutex = Mutex()

    // Un solo "Guardar como" abierto a la vez.
    private val saveFileMutex = Mutex()

    /**
     * Instala el puente. Debe llamarse antes de loadUrl: el objeto se inyecta al crear la página.
     * Devuelve false si el WebView no lo soporta; en ese caso la PWA se comporta como en el navegador.
     */
    fun attach(webView: WebView): Boolean {
        if (!WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
            Log.i(TAG, "WebView sin WEB_MESSAGE_LISTENER: la PWA queda en modo web")
            return false
        }
        WebViewCompat.addWebMessageListener(
            webView,
            JS_OBJECT_NAME,
            setOf(PwaWebView.ORIGIN),
        ) { _, message, _, isMainFrame, replyProxy ->
            if (!isMainFrame || message.type != WebMessageCompat.TYPE_STRING) return@addWebMessageListener
            val raw = message.data ?: return@addWebMessageListener
            activity.lifecycleScope.launch {
                handle(raw) { respuesta -> replyProxy.postMessage(respuesta) }
            }
        }
        Log.i(TAG, "Puente instalado")
        return true
    }

    /** Punto único de entrada: lee, enruta y responde. Cualquier error termina en un código sin detalles. */
    internal suspend fun handle(raw: String, reply: (String) -> Unit) {
        val request = parseBridgeRequest(raw) ?: return // no es del protocolo: se ignora en silencio
        val respuesta = try {
            respond(request)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Log.w(TAG, "Falló ${request.requestType}: ${e.javaClass.simpleName}") // solo el tipo de error
            errorResult(request.id, request.requestType, BridgeError.UNKNOWN)
        }
        reply(respuesta)
    }

    private suspend fun respond(request: BridgeRequest): String = when (request) {
        is BridgeRequest.GetCapabilities -> capabilitiesResult(request.id, appVersion(), pwaBuild())
        is BridgeRequest.OpenScreen -> openScreenResult(request.id, ok = openScreen(request.screen))
        is BridgeRequest.ReadDay -> readDay(request)
        is BridgeRequest.BadRequest -> errorResult(request.id, request.type, BridgeError.BAD_REQUEST)
        is BridgeRequest.SaveFile -> save(request)
    }

    /**
     * Guarda un respaldo donde la persona elija. Si ya hay un "Guardar como" abierto (doble toque),
     * el segundo pedido se responde como cancelado en vez de abrir otro selector.
     * Los logs dicen solo el resultado: nunca el nombre ni el contenido del archivo.
     */
    private suspend fun save(request: BridgeRequest.SaveFile): String {
        fun error(code: BridgeError) = errorResult(request.id, request.requestType, code)

        if (!saveFileMutex.tryLock()) return error(BridgeError.CANCELLED)
        return try {
            when (val resultado = saveFile.save(request.filename, request.mime, request.content)) {
                is SaveFile.Resultado.Guardado -> {
                    Log.i(TAG, "saveFile: guardado")
                    saveFileOk(request.id, resultado.nombre)
                }
                SaveFile.Resultado.Cancelado -> {
                    Log.i(TAG, "saveFile: cancelado")
                    error(BridgeError.CANCELLED)
                }
                SaveFile.Resultado.Fallo -> {
                    Log.w(TAG, "saveFile: no se pudo escribir")
                    error(BridgeError.WRITE_FAILED)
                }
            }
        } finally {
            saveFileMutex.unlock()
        }
    }

    /**
     * Lee un día de Health Connect, en primer plano y a pedido de la persona.
     * Revisa que Health Connect esté, pide permisos si faltan y responde los datos o un código.
     */
    private suspend fun readDay(request: BridgeRequest.ReadDay): String = readDayMutex.withLock {
        fun error(code: BridgeError) = errorResult(request.id, request.requestType, code)

        when (reader.sdkStatus()) {
            HealthConnectClient.SDK_AVAILABLE -> Unit
            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> return@withLock error(BridgeError.HC_UPDATE_REQUIRED)
            else -> return@withLock error(BridgeError.HC_UNAVAILABLE)
        }

        if (!reader.hasAllPermissions() && !requestPermissions()) {
            Log.i(TAG, "readDay: sin permiso")
            return@withLock error(BridgeError.NO_PERMISSION)
        }

        val data = reader.readDay(request.date)
        if (data.isEmpty) {
            Log.i(TAG, "readDay: sin datos")
            error(BridgeError.NO_DATA)
        } else {
            Log.i(TAG, "readDay: datos enviados")
            readDayOk(request.id, data, ZoneId.systemDefault()) { sourceLabel(activity, it) }
        }
    }

    // true si se abrió la pantalla.
    private fun openScreen(screen: BridgeRequest.Screen): Boolean {
        val intent = when (screen) {
            BridgeRequest.Screen.WATCH_TEST -> Intent(activity, WatchTestActivity::class.java)
            BridgeRequest.Screen.PRIVACY -> Intent(activity, PrivacyActivity::class.java)
            BridgeRequest.Screen.HEALTH_CONNECT -> reader.playStoreIntent() // instalar o actualizar
        }
        return try {
            activity.startActivity(intent)
            true
        } catch (e: ActivityNotFoundException) {
            false
        }
    }

    @Suppress("DEPRECATION") // getPackageInfo(String, Int) sigue funcionando en todas las versiones
    private fun appVersion(): String =
        activity.packageManager.getPackageInfo(activity.packageName, 0).versionName ?: "?"

    // Commit del que salió la PWA empaquetada (lo escribe scripts/copy-pwa-to-android.mjs).
    private fun pwaBuild(): String = try {
        activity.assets.open("www/version.json").bufferedReader().use { lector ->
            JSONObject(lector.readText()).optString("commit", "unknown")
        }
    } catch (e: Exception) {
        "unknown"
    }
}
