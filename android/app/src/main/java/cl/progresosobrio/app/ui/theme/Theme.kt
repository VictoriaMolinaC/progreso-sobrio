package cl.progresosobrio.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

private val LightColorScheme = lightColorScheme(
    primary = SalviaBoton,
    onPrimary = Color.White,
    background = Crema,
    onBackground = Tinta,
    surface = Crema,
    onSurface = Tinta,
    onSurfaceVariant = TintaSuave,
    surfaceContainerLowest = Tarjeta,
    surfaceContainerLow = Tarjeta,
    surfaceContainer = Tarjeta,
    surfaceContainerHigh = Tarjeta,
    surfaceContainerHighest = Tarjeta,
    secondaryContainer = SalviaSuave,
    onSecondaryContainer = Tinta,
    outline = Salvia,
    outlineVariant = Linea,
)

// El botón principal es el mismo salvia con texto blanco que en claro, como en la PWA.
private val DarkColorScheme = darkColorScheme(
    primary = SalviaBoton,
    onPrimary = Color.White,
    background = Cafe,
    onBackground = CremaAtenuada,
    surface = Cafe,
    onSurface = CremaAtenuada,
    onSurfaceVariant = CremaSuave,
    surfaceContainerLowest = TarjetaOscura,
    surfaceContainerLow = TarjetaOscura,
    surfaceContainer = TarjetaOscura,
    surfaceContainerHigh = TarjetaOscura,
    surfaceContainerHighest = TarjetaOscura,
    secondaryContainer = SalviaSuaveOscura,
    onSecondaryContainer = CremaAtenuada,
    outline = Salvia,
    outlineVariant = LineaOscura,
)

/** Colores del sistema de la PWA que Material no tiene: bruma, línea, cejas, etc. */
@Immutable
data class PsColores(
    val fondo: Color,
    val bruma: Color,
    val tarjeta: Color,
    val linea: Color,
    val ceja: Color,
    val salviaTexto: Color,
    val salviaSuave: Color,
    val candado: Color,
    /** Fondo del botón secundario: papel en claro, transparente en oscuro (como la PWA). */
    val fondoBotonSecundario: Color,
    /** Sombra suave en las tarjetas: solo en claro; en oscuro la PWA no la usa. */
    val conSombra: Boolean,
)

private val PsClaro = PsColores(
    fondo = Crema,
    bruma = Bruma,
    tarjeta = Tarjeta,
    linea = Linea,
    ceja = TerracotaTexto,
    salviaTexto = SalviaTexto,
    salviaSuave = SalviaSuave,
    candado = SalviaBoton,
    fondoBotonSecundario = Tarjeta,
    conSombra = true,
)

// El candado usa el salvia claro: el de botón queda bajo 3:1 sobre el aviso oscuro.
private val PsOscuro = PsColores(
    fondo = Cafe,
    bruma = BrumaOscura,
    tarjeta = TarjetaOscura,
    linea = LineaOscura,
    ceja = TerracotaTextoOscura,
    salviaTexto = SalviaTextoOscura,
    salviaSuave = SalviaSuaveOscura,
    candado = SalviaTextoOscura,
    fondoBotonSecundario = Color.Transparent,
    conSombra = false,
)

private val LocalPsColores = staticCompositionLocalOf { PsClaro }

/** Acceso a los colores propios del sistema: `PsTema.colores.bruma`. */
object PsTema {
    val colores: PsColores
        @Composable @ReadOnlyComposable get() = LocalPsColores.current
}

// Esquinas: 16 dp en tarjetas y avisos (--r del sitio). Los botones son píldoras (ver Componentes.kt).
private val Formas = Shapes(
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(16.dp),
)

/**
 * Tema de las pantallas nativas. Sigue el modo claro u oscuro del teléfono.
 * Sin Material You: los colores son fijos (los de la PWA), no los del fondo de pantalla.
 */
@Composable
fun ProgresoSobrioTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    CompositionLocalProvider(LocalPsColores provides if (darkTheme) PsOscuro else PsClaro) {
        MaterialTheme(
            colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme,
            typography = Typography,
            shapes = Formas,
            content = content
        )
    }
}
