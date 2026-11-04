package cl.progresosobrio.app.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import cl.progresosobrio.app.R
import cl.progresosobrio.app.ui.theme.EstiloCeja
import cl.progresosobrio.app.ui.theme.EstiloTituloPantalla
import cl.progresosobrio.app.ui.theme.PsTema
import java.util.Locale

// Piezas del sistema de la PWA para las pantallas nativas ("Datos del reloj" y privacidad).

private val ESPANOL = Locale.forLanguageTag("es-CL")

/** Fondo como el de la PWA: la bruma arriba, que baja a la crema a los 576 dp (36rem). */
@Composable
fun FondoBruma(contenido: @Composable () -> Unit) {
    val colores = PsTema.colores
    val alto = with(LocalDensity.current) { 576.dp.toPx() }
    Box(
        modifier = Modifier
            .fillMaxSize()
            // Después de endY el degradado sigue con el último color: la crema.
            .background(Brush.verticalGradient(listOf(colores.bruma, colores.fondo), startY = 0f, endY = alto)),
    ) {
        contenido()
    }
}

/** Nombre de la pantalla, como ScreenTitle de la PWA: ceja terracota, título liviano y bajada opcional. */
@Composable
fun EncabezadoPantalla(ceja: String, titulo: String, bajada: String? = null) {
    val colores = PsTema.colores
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(
            ceja.uppercase(ESPANOL),
            style = EstiloCeja,
            color = colores.ceja,
            // El lector de pantalla lee la palabra normal, no letra por letra.
            modifier = Modifier.semantics { contentDescription = ceja },
        )
        Text(
            titulo,
            style = EstiloTituloPantalla,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.semantics { heading() },
        )
        if (bajada != null) {
            Text(bajada, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

/** Tarjeta de papel: borde fino, esquinas de 16 dp y sombra suave (solo en claro, como la PWA). */
@Composable
fun TarjetaPapel(contenido: @Composable ColumnScope.() -> Unit) {
    val colores = PsTema.colores
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        color = colores.tarjeta,
        contentColor = MaterialTheme.colorScheme.onSurface,
        border = BorderStroke(1.dp, colores.linea),
        shadowElevation = if (colores.conSombra) 1.dp else 0.dp,
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            content = contenido,
        )
    }
}

/**
 * Botón principal: píldora salvia con texto blanco, de ancho completo.
 * Deshabilitado se ve en la línea con texto tinta: legible, no desteñido.
 */
@Composable
fun BotonPrincipal(onClick: () -> Unit, enabled: Boolean = true, contenido: @Composable RowScope.() -> Unit) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 56.dp),
        shape = CircleShape,
        colors = ButtonDefaults.buttonColors(
            disabledContainerColor = PsTema.colores.linea,
            disabledContentColor = MaterialTheme.colorScheme.onSurface,
        ),
        content = contenido,
    )
}

/** Botón secundario: píldora de papel con borde salvia y texto salvia, de ancho completo (no se corta). */
@Composable
fun BotonSecundario(texto: String, onClick: () -> Unit) {
    val colores = PsTema.colores
    OutlinedButton(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 48.dp),
        shape = CircleShape,
        border = BorderStroke(1.5.dp, MaterialTheme.colorScheme.outline),
        colors = ButtonDefaults.outlinedButtonColors(
            containerColor = colores.fondoBotonSecundario,
            contentColor = colores.salviaTexto,
        ),
    ) {
        Text(texto, fontWeight = FontWeight.SemiBold)
    }
}

/** Aviso de privacidad: candado y texto legible sobre salvia suave, no letra chica. */
@Composable
fun AvisoPrivacidad(texto: String) {
    val colores = PsTema.colores
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        color = colores.salviaSuave,
        contentColor = MaterialTheme.colorScheme.onSecondaryContainer,
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Icon(
                painterResource(R.drawable.ic_lock),
                contentDescription = null, // decorativo: el texto ya lo dice todo
                tint = colores.candado,
            )
            Text(texto, style = MaterialTheme.typography.bodyLarge)
        }
    }
}
