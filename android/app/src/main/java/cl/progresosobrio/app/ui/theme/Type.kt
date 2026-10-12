package cl.progresosobrio.app.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

// Fuente del sistema. Texto base de 16 sp; nada visible baja de 14 sp.
val Typography = Typography(
    // Valores grandes ("47", "9,6")
    headlineLarge = TextStyle(fontWeight = FontWeight.Medium, fontSize = 32.sp, lineHeight = 40.sp),
    // Título de la pantalla
    headlineSmall = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 24.sp, lineHeight = 32.sp),
    // Títulos de tarjeta y fecha
    titleMedium = TextStyle(fontWeight = FontWeight.Medium, fontSize = 18.sp, lineHeight = 26.sp),
    // Texto base
    bodyLarge = TextStyle(fontWeight = FontWeight.Normal, fontSize = 16.sp, lineHeight = 24.sp),
    bodyMedium = TextStyle(fontWeight = FontWeight.Normal, fontSize = 16.sp, lineHeight = 24.sp),
    // Botones
    labelLarge = TextStyle(fontWeight = FontWeight.Medium, fontSize = 16.sp, lineHeight = 24.sp),
    // Etiquetas pequeñas ("mín", "Fuente")
    labelMedium = TextStyle(fontWeight = FontWeight.Medium, fontSize = 14.sp, lineHeight = 20.sp),
)
