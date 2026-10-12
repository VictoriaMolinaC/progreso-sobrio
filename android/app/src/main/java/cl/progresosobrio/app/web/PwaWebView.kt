package cl.progresosobrio.app.web

import android.annotation.SuppressLint
import android.app.Activity
import android.app.AlertDialog
import android.content.pm.ApplicationInfo
import android.net.Uri
import android.webkit.JsResult
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader
import java.io.ByteArrayInputStream

/**
 * El WebView de la app, endurecido: solo muestra la PWA empaquetada en assets/www/.
 * Nada se carga desde internet (la app no tiene ese permiso); los enlaces de teléfono,
 * correo y web salen de la app, y cualquier otra dirección se bloquea.
 */
object PwaWebView {

    // Dominio reservado para servir archivos locales con https (así funcionan IndexedDB y localStorage).
    private const val HOST = "appassets.androidplatform.net"
    private const val PWA_PATH = "/www/"

    /** Origen de la PWA: el único al que el puente le acepta mensajes. */
    const val ORIGIN = "https://$HOST"

    /** Dirección de inicio de la PWA. */
    const val START_URL = "$ORIGIN${PWA_PATH}index.html"

    @SuppressLint("SetJavaScriptEnabled") // la PWA es una app React: sin JavaScript no funciona
    fun create(
        activity: Activity,
        onHistoryChanged: (canGoBack: Boolean) -> Unit,
        onRendererGone: () -> Unit,
    ): WebView {
        // Inspeccionar el WebView desde chrome://inspect: solo en la versión debug.
        val depurable = (activity.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0
        WebView.setWebContentsDebuggingEnabled(depurable)

        // Solo /www/... se sirve, desde assets/www/...; el resto de assets/ no queda expuesto.
        val assets = WebViewAssetLoader.AssetsPathHandler(activity)
        val loader = WebViewAssetLoader.Builder()
            .setDomain(HOST)
            .addPathHandler(PWA_PATH) { path -> assets.handle("www/$path") }
            .build()

        return WebView(activity).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true // localStorage: ahí la PWA guarda el tema
                allowFileAccess = false
                allowContentAccess = false
                mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
                setGeolocationEnabled(false)
            }
            webViewClient = Cliente(activity, loader, onHistoryChanged, onRendererGone)
            webChromeClient = Dialogos(activity)
        }
    }

    private fun esDeLaPwa(url: Uri): Boolean =
        url.scheme == "https" && url.host == HOST && url.path?.startsWith(PWA_PATH) == true

    private fun noEncontrado() = WebResourceResponse(
        "text/plain", "utf-8", 404, "Not Found", emptyMap(), ByteArrayInputStream(ByteArray(0))
    )

    // Lint avisa que falta onRenderProcessGone, pero está implementado al final de la clase.
    @SuppressLint("MissingOnRenderProcessGone")
    private class Cliente(
        private val activity: Activity,
        private val loader: WebViewAssetLoader,
        private val onHistoryChanged: (Boolean) -> Unit,
        private val onRendererGone: () -> Unit,
    ) : WebViewClient() {

        // Todo lo que pide la PWA (HTML, JS, CSS, íconos) sale de los assets.
        // Si no es un archivo de la PWA se responde 404 vacío: nunca se intenta la red.
        override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse =
            loader.shouldInterceptRequest(request.url) ?: noEncontrado()

        // Navegación: solo dentro de la PWA. tel:, mailto: y https: salen de la app con un Intent;
        // todo lo demás (blob:, data:, javascript:, otros dominios por http) se bloquea.
        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
            if (esDeLaPwa(request.url)) return false
            ExternalLinks.open(activity, request.url)
            return true
        }

        override fun doUpdateVisitedHistory(view: WebView, url: String?, isReload: Boolean) {
            onHistoryChanged(view.canGoBack())
        }

        override fun onRenderProcessGone(view: WebView, detail: RenderProcessGoneDetail): Boolean {
            onRendererGone()
            return true // la app no se cierra
        }
    }

    // confirm() y alert() con un diálogo nativo, sin la dirección interna en el título
    // (el diálogo por defecto dice "La página en https://appassets.androidplatform.net dice:").
    private class Dialogos(private val activity: Activity) : WebChromeClient() {

        override fun onJsAlert(view: WebView, url: String?, message: String?, result: JsResult): Boolean {
            if (activity.isFinishing) { result.cancel(); return true }
            AlertDialog.Builder(activity)
                .setMessage(message)
                .setPositiveButton(android.R.string.ok) { _, _ -> result.confirm() }
                .setOnCancelListener { result.confirm() }
                .show()
            return true
        }

        override fun onJsConfirm(view: WebView, url: String?, message: String?, result: JsResult): Boolean {
            if (activity.isFinishing) { result.cancel(); return true }
            AlertDialog.Builder(activity)
                .setMessage(message)
                .setPositiveButton(android.R.string.ok) { _, _ -> result.confirm() }
                .setNegativeButton(android.R.string.cancel) { _, _ -> result.cancel() }
                .setOnCancelListener { result.cancel() } // atrás o tocar fuera = cancelar
                .show()
            return true
        }
    }
}
