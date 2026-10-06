package cl.progresosobrio.app.ui

/**
 * Todos los textos que ve la persona, en un solo lugar.
 * Cuando se pasen a strings.xml, solo hay que cambiar este archivo.
 */
object Textos {

    // --- Pantalla de privacidad ---
    const val PRIVACIDAD_TEXTO = "Progreso Sobrio lee desde Health Connect tres datos: pulso, pulso en reposo y sueño. Solo lo hace cuando tocas «Traer datos del reloj», nunca en segundo plano. Los datos solo se muestran en pantalla; esta app no los guarda ni los envía a ningún lugar. Puedes quitar el acceso cuando quieras en Health Connect → Permisos de apps. Los datos que tu pulsera entrega a Health Connect los maneja la app del fabricante (por ejemplo, Mi Fitness) con sus propias reglas de privacidad. Contacto: contacto.progresosobrio@gmail.com"
    const val PRIVACIDAD_SIN_INTERNET =
        "Esta app no tiene permiso de internet. Solo lee pulso y sueño desde Health Connect cuando tú lo pides."

    // --- Pantalla "Datos del reloj" ---
    const val TITULO = "Datos del reloj"
    const val DIA_ANTERIOR = "Día anterior"
    const val DIA_SIGUIENTE = "Día siguiente"
    const val BOTON_TRAER = "Traer datos del reloj"

    const val NECESITAS_HC = "Necesitas Health Connect"
    const val BOTON_INSTALAR_HC = "Instalar Health Connect"
    const val BOTON_ACTUALIZAR_HC = "Actualizar Health Connect"

    const val SIN_PERMISO = "Sin permiso para leer el reloj"
    const val BOTON_PEDIR_PERMISOS = "Pedir permisos de nuevo"
    const val NOTA_PERMISOS = "También puedes activarlo en Health Connect → Permisos de apps"

    const val SIN_DATOS_DEL_DIA =
        "No hay datos de este día. Abre Mi Fitness para sincronizar tu pulsera y vuelve a intentar."
    const val ERROR_GENERICO = "No se pudieron leer los datos. Intenta de nuevo."
    const val ERROR_PLAY_STORE = "No se pudo abrir Play Store."

    const val PIE = "Nada sale de tu teléfono. Esta app no tiene permiso de internet."

    // --- Tarjetas de resultado ---
    const val SIN_DATO = "sin dato"
    fun pulsoReposo(valor: String) = "Pulso en reposo: $valor"
    fun pulsoMinMaxProm(valor: String) = "Pulso mín / máx / promedio: $valor"
    fun ultimaMedicion(valor: String) = "Última medición: $valor"
    fun sueno(valor: String) = "Sueño: $valor"
    fun fuente(valor: String) = "Fuente: $valor"

    // --- Unidades ---
    fun lpm(valor: String) = "$valor lpm"
    fun lpmALas(valor: String, hora: String) = "$valor lpm a las $hora"
    fun horas(valor: String) = "$valor h"
}
