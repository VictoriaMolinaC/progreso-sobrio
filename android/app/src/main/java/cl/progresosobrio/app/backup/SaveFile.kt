package cl.progresosobrio.app.backup

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContract
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.IOException

/**
 * "Guardar como" del sistema: la persona elige dónde queda el archivo (Descargas, Drive…)
 * y la app lo escribe ahí. No necesita permisos de almacenamiento.
 *
 * Debe crearse al crear la actividad (como propiedad): Android exige registrar el lanzador
 * antes de que la pantalla arranque.
 */
class SaveFile(private val activity: ComponentActivity) {

    sealed class Resultado {
        /** [nombre]: el nombre final del archivo (la persona puede cambiarlo en el selector). */
        data class Guardado(val nombre: String) : Resultado()
        data object Cancelado : Resultado()
        data object Fallo : Resultado()
    }

    // Uri elegida, o null si la persona cerró el selector.
    private var espera: CompletableDeferred<Uri?>? = null
    private val crearDocumento = activity.registerForActivityResult(CrearDocumento) { uri ->
        espera?.complete(uri)
    }

    /** Abre "Guardar como" con el nombre sugerido y escribe [content] en UTF-8. */
    suspend fun save(filename: String, mime: String, content: String): Resultado {
        val espera = CompletableDeferred<Uri?>()
        this.espera = espera
        val elegida = try {
            crearDocumento.launch(Peticion(filename, mime))
            espera.await()
        } catch (e: ActivityNotFoundException) {
            return Resultado.Fallo // el teléfono no tiene selector de documentos
        } finally {
            this.espera = null
        }
        val uri = elegida ?: return Resultado.Cancelado

        return try {
            withContext(Dispatchers.IO) {
                // "wt": si la persona eligió un archivo que ya existía, se reemplaza completo
                // (con "w" a secas, algunos proveedores dejan restos del archivo anterior).
                activity.contentResolver.openOutputStream(uri, "wt")?.use { salida ->
                    salida.write(content.toByteArray(Charsets.UTF_8))
                } ?: throw IOException("sin salida")
            }
            Resultado.Guardado(nombreVisible(uri) ?: filename)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Resultado.Fallo
        }
    }

    // Nombre con que quedó el archivo, según el proveedor (Descargas, Drive…).
    private fun nombreVisible(uri: Uri): String? = try {
        activity.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) cursor.getString(0) else null
        }
    } catch (e: Exception) {
        null
    }

    private data class Peticion(val nombre: String, val mime: String)

    // Como ActivityResultContracts.CreateDocument, pero con el tipo de archivo en cada pedido (JSON o CSV).
    private object CrearDocumento : ActivityResultContract<Peticion, Uri?>() {
        override fun createIntent(context: Context, input: Peticion): Intent =
            Intent(Intent.ACTION_CREATE_DOCUMENT)
                .addCategory(Intent.CATEGORY_OPENABLE)
                .setType(input.mime)
                .putExtra(Intent.EXTRA_TITLE, input.nombre)

        override fun parseResult(resultCode: Int, intent: Intent?): Uri? =
            if (resultCode == Activity.RESULT_OK) intent?.data else null
    }
}
