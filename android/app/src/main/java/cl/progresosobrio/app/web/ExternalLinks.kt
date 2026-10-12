package cl.progresosobrio.app.web

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import cl.progresosobrio.app.ui.Textos

/** Abre fuera de la app los enlaces que la PWA no maneja: teléfono, correo y web. */
object ExternalLinks {

    /** true si la URL es tel:, mailto: o https: (se intentó abrir fuera); false si no corresponde. */
    fun open(context: Context, url: Uri): Boolean {
        val intent = when (url.scheme?.lowercase()) {
            "tel" -> Intent(Intent.ACTION_DIAL, url) // abre el marcador con el número; no llama
            "mailto" -> Intent(Intent.ACTION_SENDTO, url)
            "https" -> Intent(Intent.ACTION_VIEW, url)
            else -> return false
        }
        try {
            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(context, Textos.SIN_APP_PARA_ENLACE, Toast.LENGTH_SHORT).show()
        }
        return true
    }
}
