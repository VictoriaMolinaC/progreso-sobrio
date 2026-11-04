package cl.progresosobrio.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.core.net.toUri
import cl.progresosobrio.app.ui.AvisoPrivacidad
import cl.progresosobrio.app.ui.BotonSecundario
import cl.progresosobrio.app.ui.EncabezadoPantalla
import cl.progresosobrio.app.ui.FondoBruma
import cl.progresosobrio.app.ui.TarjetaPapel
import cl.progresosobrio.app.ui.Textos
import cl.progresosobrio.app.ui.theme.ProgresoSobrioTheme
import cl.progresosobrio.app.web.ExternalLinks
import cl.progresosobrio.app.web.URL_POLITICA_PRIVACIDAD

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
                // La política completa se abre en el navegador: la app no tiene permiso de internet.
                PantallaPrivacidad(onAbrirPolitica = { ExternalLinks.open(this, URL_POLITICA_PRIVACIDAD.toUri()) })
            }
        }
    }
}

/** Encabezado, el texto en párrafos (con desplazamiento: es largo), el aviso sin internet y la política. */
@Composable
private fun PantallaPrivacidad(onAbrirPolitica: () -> Unit) {
    // Fondo transparente (lo pone FondoBruma) y color del texto explícito, como en "Datos del reloj".
    FondoBruma {
        Scaffold(
            modifier = Modifier.fillMaxSize(),
            containerColor = Color.Transparent,
            contentColor = MaterialTheme.colorScheme.onBackground,
        ) { innerPadding ->
            Column(
                modifier = Modifier
                    .padding(innerPadding)
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                EncabezadoPantalla(Textos.CEJA_PRIVACIDAD, Textos.TITULO_PRIVACIDAD, Textos.BAJADA_PRIVACIDAD)
                TarjetaPapel {
                    Textos.PRIVACIDAD_PARRAFOS.forEach { parrafo ->
                        Text(parrafo, style = MaterialTheme.typography.bodyLarge)
                    }
                }
                AvisoPrivacidad(Textos.PRIVACIDAD_SIN_INTERNET)
                BotonSecundario(texto = Textos.BOTON_POLITICA, onClick = onAbrirPolitica)
            }
        }
    }
}
