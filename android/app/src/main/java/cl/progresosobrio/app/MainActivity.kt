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
import cl.progresosobrio.app.web.PwaWebView

/**
 * Pantalla principal: la PWA empaquetada en el APK, dentro de un WebView.
 * Sin internet: todo se sirve desde assets/www/.
 */
class MainActivity : ComponentActivity() {

    private var webView: WebView? = null

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
