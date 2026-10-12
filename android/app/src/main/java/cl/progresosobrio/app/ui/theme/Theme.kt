package cl.progresosobrio.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

private val LightColorScheme = lightColorScheme(
    primary = SalviaProfunda,
    onPrimary = Color.White,
    background = Crema,
    onBackground = Tinta,
    surface = Crema,
    onSurface = Tinta,
    onSurfaceVariant = TintaSuave,
    surfaceContainerLowest = TarjetaClara,
    surfaceContainerLow = TarjetaClara,
    surfaceContainer = TarjetaClara,
    surfaceContainerHigh = TarjetaClara,
    surfaceContainerHighest = TarjetaClara,
    secondaryContainer = SalviaSuaveClara,
    onSecondaryContainer = Tinta,
    outline = TintaSuave,
    outlineVariant = BordeClaro,
)

private val DarkColorScheme = darkColorScheme(
    primary = Salvia,
    onPrimary = Cafe,
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
    outline = CremaSuave,
    outlineVariant = BordeOscuro,
)

// Esquinas redondeadas: 16 dp en botones, 20 dp en tarjetas.
private val Formas = Shapes(
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(20.dp),
)

/**
 * Tema de la app. Sigue el modo claro u oscuro del sistema.
 * Sin Material You: los colores son fijos (los de la PWA), no los del fondo de pantalla.
 */
@Composable
fun ProgresoSobrioTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme,
        typography = Typography,
        shapes = Formas,
        content = content
    )
}
