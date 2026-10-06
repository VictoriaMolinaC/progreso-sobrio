package cl.progresosobrio.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import cl.progresosobrio.app.ui.WatchTestScreen
import cl.progresosobrio.app.ui.theme.ProgresoSobrioTheme

/** Pantalla de inicio: muestra la prueba "Datos del reloj". */
class MainActivity : ComponentActivity() {
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
