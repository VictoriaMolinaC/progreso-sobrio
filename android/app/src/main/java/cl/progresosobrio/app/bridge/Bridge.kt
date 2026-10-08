package cl.progresosobrio.app.bridge

import android.content.Intent
import android.util.Log
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.lifecycle.lifecycleScope
import androidx.webkit.WebMessageCompat
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import cl.progresosobrio.app.PrivacyActivity
import cl.progresosobrio.app.WatchTestActivity
import cl.progresosobrio.app.web.PwaWebView
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import org.json.JSONObject

// Los logs solo dicen estados, nunca el contenido de los mensajes (un respaldo lleva datos de salud).
private const val TAG = "Bridge"

/** Nombre del objeto que ve la PWA: window.ProgresoSobrioAndroid. */
private const val JS_OBJECT_NAME = "ProgresoSobrioAndroid"

/**
 * Puente entre la PWA (dentro del WebView) y la parte nativa.
 * La PWA envía JSON con window.ProgresoSobrioAndroid.postMessage(...) y recibe la respuesta
 * como evento "message". Solo se aceptan mensajes del origen propio y del marco principal.
 *
 * Por ahora atiende getCapabilities y openScreen; readDay llega en el CP5 y saveFile en el CP6.
 */
class Bridge(private val activity: ComponentActivity) {

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

    private fun respond(request: BridgeRequest): String = when (request) {
        is BridgeRequest.GetCapabilities -> capabilitiesResult(request.id, appVersion(), pwaBuild())
        is BridgeRequest.OpenScreen -> {
            openScreen(request.screen)
            openScreenResult(request.id, ok = true)
        }
        is BridgeRequest.BadRequest -> errorResult(request.id, request.type, BridgeError.BAD_REQUEST)
        // Todavía no disponibles: readDay llega en el CP5 y saveFile en el CP6.
        is BridgeRequest.ReadDay, is BridgeRequest.SaveFile ->
            errorResult(request.id, request.requestType, BridgeError.UNKNOWN)
    }

    private fun openScreen(screen: BridgeRequest.Screen) {
        val destino = when (screen) {
            BridgeRequest.Screen.WATCH_TEST -> WatchTestActivity::class.java
            BridgeRequest.Screen.PRIVACY -> PrivacyActivity::class.java
        }
        activity.startActivity(Intent(activity, destino))
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
