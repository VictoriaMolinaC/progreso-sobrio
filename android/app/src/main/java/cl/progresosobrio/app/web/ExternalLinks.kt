package cl.progresosobrio.app.web

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import cl.progresosobrio.app.ui.Textos

/** Qué app del teléfono abre un enlace que sale de la PWA. */
internal enum class TipoDeEnlace { MARCADOR, CORREO, WEB }

/**
 * Solo tel:, mailto: y https: salen de la app; cualquier otro esquema (http:, javascript:,
 * file:, intent:, content:, data:…) da null y no se abre. Lógica pura: la cubren los tests.
 */
internal fun tipoDeEnlace(scheme: String?): TipoDeEnlace? = when (scheme?.lowercase()) {
    "tel" -> TipoDeEnlace.MARCADOR
    "mailto" -> TipoDeEnlace.CORREO
    "https" -> TipoDeEnlace.WEB
    else -> null
}

/** Abre fuera de la app los enlaces que la PWA no maneja: teléfono, correo y web. */
object ExternalLinks {

    /** true si la URL es tel:, mailto: o https: (se intentó abrir fuera); false si no corresponde. */
    fun open(context: Context, url: Uri): Boolean {
        val intent = when (tipoDeEnlace(url.scheme)) {
            TipoDeEnlace.MARCADOR -> Intent(Intent.ACTION_DIAL, url) // abre el marcador con el número; no llama
            TipoDeEnlace.CORREO -> Intent(Intent.ACTION_SENDTO, url)
            TipoDeEnlace.WEB -> Intent(Intent.ACTION_VIEW, url)
            null -> return false
        }
        try {
            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(context, Textos.SIN_APP_PARA_ENLACE, Toast.LENGTH_SHORT).show()
        }
        return true
    }
}
