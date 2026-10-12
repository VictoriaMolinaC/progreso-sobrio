package cl.progresosobrio.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import cl.progresosobrio.app.ui.Textos
import cl.progresosobrio.app.ui.theme.ProgresoSobrioTheme

/**
 * Pantalla de privacidad. Health Connect la abre cuando la persona quiere saber
 * por qué la app pide permisos. Health Connect exige que exista para mostrar
 * el diálogo de permisos.
 */
class PrivacyActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ProgresoSobrioTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    Column(
                        modifier = Modifier
                            .padding(innerPadding)
                            .padding(24.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Text(Textos.PRIVACIDAD_TEXTO,style = MaterialTheme.typography.bodyLarge)
                        Text(Textos.PRIVACIDAD_SIN_INTERNET, style = MaterialTheme.typography.bodyLarge)
                    }
                }
            }
        }
    }
}
