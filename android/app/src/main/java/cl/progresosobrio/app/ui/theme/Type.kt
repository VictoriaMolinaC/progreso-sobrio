package cl.progresosobrio.app.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

// Fuente del sistema, como la PWA. Texto base de 16 sp; nada visible baja de 14 sp,
// salvo las cejas (13 sp, siempre en 600 y mayúsculas, igual que en la PWA).
val Typography = Typography(
    // Valores grandes ("47", "9,6")
    headlineLarge = TextStyle(fontWeight = FontWeight.Medium, fontSize = 32.sp, lineHeight = 40.sp),
    // Fecha del selector de día
    titleMedium = TextStyle(fontWeight = FontWeight.Medium, fontSize = 18.sp, lineHeight = 26.sp),
    // Texto base
    bodyLarge = TextStyle(fontWeight = FontWeight.Normal, fontSize = 16.sp, lineHeight = 24.sp),
    bodyMedium = TextStyle(fontWeight = FontWeight.Normal, fontSize = 16.sp, lineHeight = 24.sp),
    // Botones
    labelLarge = TextStyle(fontWeight = FontWeight.Medium, fontSize = 16.sp, lineHeight = 24.sp),
    // Etiquetas pequeñas ("mín", "Fuente")
    labelMedium = TextStyle(fontWeight = FontWeight.Medium, fontSize = 14.sp, lineHeight = 20.sp),
)

// --- Encabezado de pantalla, como el de la PWA (ScreenTitle) ---

/** Ceja terracota sobre el título: 13 sp en 600, mayúsculas y con aire entre letras. */
val EstiloCeja = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 13.sp, lineHeight = 18.sp, letterSpacing = 1.3.sp)

/** Título liviano: 28 sp en 300 (el peso 300 nunca baja de 28). */
val EstiloTituloPantalla =
    TextStyle(fontWeight = FontWeight.Light, fontSize = 28.sp, lineHeight = 34.sp, letterSpacing = (-0.7).sp)

/** Títulos de tarjeta: 18 sp en 600, como los subtítulos del sitio. */
val EstiloTituloTarjeta = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 18.sp, lineHeight = 26.sp)
