package cl.progresosobrio.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import cl.progresosobrio.app.ui.WatchTestScreen
import cl.progresosobrio.app.ui.theme.ProgresoSobrioTheme

/**
 * Pantalla de prueba / diagnóstico "Datos del reloj".
 * Solo se abre desde dentro de la app (en la versión debug, también desde su propio icono).
 */
class WatchTestActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ProgresoSobrioTheme {
                WatchTestScreen()
            }
        }
    }
}
