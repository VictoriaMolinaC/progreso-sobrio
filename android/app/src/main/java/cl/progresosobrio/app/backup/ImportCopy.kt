package cl.progresosobrio.app.backup

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import androidx.core.content.FileProvider
import java.io.File
import java.io.InputStream
import java.io.OutputStream

/**
 * Copia el archivo elegido en "Restaurar un respaldo" a la caché de la app y lo entrega al
 * WebView desde la propia app, con su tamaño real.
 *
 * Por qué: en algunos teléfonos (visto en un Xiaomi con Android 12), un respaldo creado con
 * "Guardar como" aparece en Descargas con tamaño 0. El WebView confía en ese tamaño y lo lee
 * vacío, aunque en el disco tenga los datos. Aquí se lee el contenido completo, sin mirar ese
 * tamaño. La PWA sigue revisando el archivo antes de usarlo.
 */
object ImportCopy {

    private const val CARPETA = "importar"

    // Un respaldo pesa unos KB. Si el archivo es mucho más grande, no es un respaldo: se entrega
    // el original sin copiarlo (como antes) y la PWA lo rechaza.
    private const val MAX_BYTES = 20L * 1024 * 1024

    /** Uri de la copia, o la original si no se pudo copiar (se comporta como antes). */
    fun copy(context: Context, original: Uri): Uri = try {
        val carpeta = File(context.cacheDir, CARPETA)
        carpeta.deleteRecursively() // solo queda la última copia
        carpeta.mkdirs()
        val destino = File(carpeta, nombreSeguro(nombreVisible(context, original)))
        val copiado = context.contentResolver.openInputStream(original)?.use { entrada ->
            destino.outputStream().use { salida -> copiarConLimite(entrada, salida) }
        } ?: false
        if (copiado) {
            FileProvider.getUriForFile(context, "${context.packageName}.archivos", destino)
        } else {
            destino.delete()
            original
        }
    } catch (e: Exception) {
        original
    }

    /** Borra la copia anterior: trae datos de salud y no tiene por qué quedar en la caché. */
    fun clear(context: Context) {
        File(context.cacheDir, CARPETA).deleteRecursively()
    }

    // false si el archivo supera MAX_BYTES.
    private fun copiarConLimite(entrada: InputStream, salida: OutputStream): Boolean {
        val buffer = ByteArray(8 * 1024)
        var total = 0L
        while (true) {
            val leidos = entrada.read(buffer)
            if (leidos < 0) return true
            total += leidos
            if (total > MAX_BYTES) return false
            salida.write(buffer, 0, leidos)
        }
    }

    // Nombre del archivo según el proveedor: la PWA lo muestra en "Restaurado desde …".
    private fun nombreVisible(context: Context, uri: Uri): String? = try {
        context.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) cursor.getString(0) else null
        }
    } catch (e: Exception) {
        null
    }
}

/** Solo el nombre, sin carpetas: así la copia nunca queda fuera de la carpeta de la caché. */
internal fun nombreSeguro(nombre: String?): String =
    nombre?.substringAfterLast('/')?.substringAfterLast('\\')?.trim()
        ?.takeIf { it.isNotEmpty() && it != "." && it != ".." }
        ?: "respaldo.json"
