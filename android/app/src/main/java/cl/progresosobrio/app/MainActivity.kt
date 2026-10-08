package cl.progresosobrio.app

import android.graphics.Color
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.WebView
import android.widget.FrameLayout
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.SystemBarStyle
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.health.connect.client.PermissionController
import cl.progresosobrio.app.bridge.Bridge
import cl.progresosobrio.app.health.HealthConnectReader
import cl.progresosobrio.app.web.PwaWebView
import kotlinx.coroutines.CompletableDeferred

/**
 * Pantalla principal: la PWA empaquetada en el APK, dentro de un WebView.
 * Sin internet: todo se sirve desde assets/www/.
 */
class MainActivity : ComponentActivity() {

    private var webView: WebView? = null

    private val reader by lazy { HealthConnectReader(applicationContext) }

    // Diálogo de permisos de Health Connect para el puente. Se registra al crear la actividad
    // (Android lo exige antes de que la pantalla arranque); el puente espera su resultado.
    private var esperaPermisos: CompletableDeferred<Unit>? = null
    private val pedirPermisos = registerForActivityResult(
        PermissionController.createRequestPermissionResultContract()
    ) { esperaPermisos?.complete(Unit) }

    /** Abre el diálogo de permisos y devuelve si quedaron concedidos los tres. */
    private suspend fun pedirPermisosDeSalud(): Boolean {
        val espera = CompletableDeferred<Unit>()
        esperaPermisos = espera
        pedirPermisos.launch(reader.permissions)
        espera.await()
        esperaPermisos = null
        return reader.hasAllPermissions()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Barras del sistema con estilo claro fijo (iconos oscuros), como el tema por defecto de la PWA.
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.light(Color.TRANSPARENT, Color.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.light(Color.TRANSPARENT, Color.TRANSPARENT),
        )

        // "Atrás" vuelve dentro del WebView solo si hay a dónde volver;
        // si no, Android hace lo de siempre (en Android 12+ manda la app al fondo sin cerrarla).
        val volverEnWeb = object : OnBackPressedCallback(false) {
            override fun handleOnBackPressed() {
                webView?.goBack()
            }
        }
        onBackPressedDispatcher.addCallback(this, volverEnWeb)

        val web = PwaWebView.create(
            activity = this,
            onHistoryChanged = { puedeVolver -> volverEnWeb.isEnabled = puedeVolver },
            onRendererGone = { recreate() }, // si el motor del WebView se cae, se rearma la pantalla
        )

        // El fondo crema queda detrás de las barras del sistema.
        val contenedor = FrameLayout(this).apply {
            setBackgroundColor(getColor(R.color.fondo_web))
            addView(web, FrameLayout.LayoutParams(MATCH, MATCH))
        }

        // El WebView queda entre las barras del sistema, el recorte de la cámara y el teclado:
        // nada de la PWA queda tapado (en Android 15+ la app siempre dibuja de borde a borde).
        ViewCompat.setOnApplyWindowInsetsListener(contenedor) { vista, insets ->
            val margenes = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() or
                    WindowInsetsCompat.Type.displayCutout() or
                    WindowInsetsCompat.Type.ime()
            )
            vista.setPadding(margenes.left, margenes.top, margenes.right, margenes.bottom)
            WindowInsetsCompat.CONSUMED
        }

        setContentView(contenedor)
        webView = web

        // El puente se instala antes de cargar la PWA: el objeto se inyecta al crear la página.
        Bridge(this, reader, ::pedirPermisosDeSalud).attach(web)
        web.loadUrl(PwaWebView.START_URL)
    }

    override fun onDestroy() {
        webView?.let { web ->
            (web.parent as? ViewGroup)?.removeView(web)
            web.destroy()
        }
        webView = null
        super.onDestroy()
    }

    private companion object {
        const val MATCH = FrameLayout.LayoutParams.MATCH_PARENT
    }
}
