package cl.progresosobrio.app.ui.theme

import androidx.compose.ui.graphics.Color

// Colores del sistema «Diario con bruma»: los mismos de la PWA (src/index.css) y del sitio
// (diseno/tokens.md). En modo oscuro, los que la PWA arma con transparencia ya vienen
// mezclados sobre el fondo café.
// Solo neutros, salvia y la ceja terracota: en la PWA el ámbar, el verde y el coral
// significan "logro" o "alerta", y aquí ningún dato se califica.
// Entre paréntesis, el contraste más bajo sobre los fondos donde se usa
// (mínimo AA: 4,5 para texto, 3 para íconos y bordes).

// --- Modo claro ---
val Crema = Color(0xFFFAF6F0)          // fondo (--crema / base)
val Tarjeta = Color(0xFFFFFCF7)        // tarjetas de papel y botón secundario (--tarjeta / card)
val Bruma = Color(0xFFDAE2D8)          // parte alta del degradado del fondo (--bruma / mist)
val Linea = Color(0xFFE6DDD1)          // bordes finos (--linea / line)
val Tinta = Color(0xFF3E3A36)          // texto (--tinta / ink) (8,5)
val TintaSuave = Color(0xFF655D56)     // texto secundario y "sin dato" (--tinta-suave / ink-soft) (4,9)
val Salvia = Color(0xFF5B9279)         // borde del botón secundario, nunca texto (--salvia / primary) (3,5)
val SalviaBoton = Color(0xFF467A62)    // botón principal con texto blanco (--salvia-boton) (5,0) y candado (4,2)
val SalviaTexto = Color(0xFF3D6A54)    // texto del botón secundario (--salvia-texto / primary-text) (4,7)
val SalviaSuave = Color(0xFFE6EEE8)    // aviso de privacidad (--salvia-suave / primary-soft)
val TerracotaTexto = Color(0xFF8C5339) // cejas (--terracota-texto / secondary-text) (4,6)

// --- Modo oscuro ---
val Cafe = Color(0xFF221E1A)                 // fondo (base-dark)
val TarjetaOscura = Color(0xFF2D2824)        // tarjetas: ink-dark al 5 % sobre el café
val BrumaOscura = Color(0xFF303B32)          // degradado del fondo: primary al 25 % sobre el café
val LineaOscura = Color(0xFF37332E)          // bordes finos: ink-dark al 10 % sobre el café
val SalviaSuaveOscura = Color(0xFF2B2F28)    // aviso de privacidad: primary al 15 % sobre el café
val CremaAtenuada = Color(0xFFF5EFE6)        // texto (ink-dark) (10,2)
val CremaSuave = Color(0xFFB3ADA6)           // texto secundario y "sin dato" (ink-soft-dark) (5,3)
val SalviaTextoOscura = Color(0xFF8FC1A6)    // texto salvia y candado (primary-text-dark) (5,8)
val TerracotaTextoOscura = Color(0xFFE0A083) // cejas (secondary-text-dark) (5,3)
