package cl.progresosobrio.app.ui.theme

import androidx.compose.ui.graphics.Color

// Colores tomados de la PWA (src/index.css) para que ambas apps se vean iguales.
// Solo neutros y salvia: en la PWA el ámbar, el verde y el coral significan
// "logro" o "alerta", y aquí ningún dato se califica.
// Entre paréntesis, el contraste con el fondo donde se usa (mínimo AA: 4,5 texto, 3 iconos).

// --- Modo claro ---
val Crema = Color(0xFFFAF6F0)            // fondo (--color-base)
val Tinta = Color(0xFF3E3A36)            // texto (--color-ink) (10,5 sobre crema)
val TintaSuave = Color(0xFF6B645C)       // texto secundario y "sin dato" (5,8 sobre tarjeta)
val TarjetaClara = Color(0xFFFFFFFF)     // tarjetas
val BordeClaro = Color(0xFFD8CFC4)       // bordes y separadores
val SalviaProfunda = Color(0xFF44735E)   // acento: salvia más oscuro, con texto blanco (5,4)
val SalviaSuaveClara = Color(0xFFDCE9E2) // fondo del bloque de privacidad (texto: 9,0)

// --- Modo oscuro ---
val Cafe = Color(0xFF221E1A)             // fondo (--color-base-dark)
val CremaAtenuada = Color(0xFFF5EFE6)    // texto (--color-ink-dark) (12,6 sobre tarjeta)
val CremaSuave = Color(0xFFB5ACA1)       // texto secundario y "sin dato" (6,4 sobre tarjeta)
val TarjetaOscura = Color(0xFF2E2925)    // tarjetas, un poco más claras que el fondo
val BordeOscuro = Color(0xFF4A433D)      // bordes y separadores
val Salvia = Color(0xFF5B9279)           // acento (--color-primary), con texto café encima (4,6)
val SalviaSuaveOscura = Color(0xFF2B3A33) // fondo del bloque de privacidad (texto: 10,5)
