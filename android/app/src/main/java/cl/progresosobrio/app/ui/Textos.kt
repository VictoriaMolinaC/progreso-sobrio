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
    fun hoy(fecha: String) = "hoy · $fecha"
    const val BOTON_TRAER = "Traer datos del reloj"
    const val LEYENDO = "Leyendo…"

    const val NECESITAS_HC = "Necesitas Health Connect"
    const val HC_DESACTUALIZADO = "Health Connect necesita una actualización"
    const val BOTON_INSTALAR_HC = "Instalar Health Connect"
    const val BOTON_ACTUALIZAR_HC = "Actualizar Health Connect"

    const val SIN_PERMISO = "Sin permiso para leer el reloj"
    const val BOTON_PEDIR_PERMISOS = "Pedir permisos de nuevo"
    const val NOTA_PERMISOS = "También puedes activarlo en Health Connect → Permisos de apps"

    const val SIN_DATOS_DEL_DIA =
        "No hay datos de este día. Abre Mi Fitness para sincronizar tu pulsera y vuelve a intentar."
    const val ERROR_GENERICO = "No se pudieron leer los datos. Intenta de nuevo."
    const val ERROR_PLAY_STORE = "No se pudo abrir Play Store."

    const val PRIVACIDAD_RESUMEN = "Nada sale de tu teléfono. Esta app no tiene permiso de internet."

    // --- Tarjetas de resultado ---
    const val PULSO_DEL_DIA = "Pulso del día"
    const val MIN = "mín"
    const val MAX = "máx"
    const val PROMEDIO = "promedio"
    const val SUENO = "Sueño"
    const val PULSO_EN_REPOSO = "Pulso en reposo"
    const val NOTA_REPOSO = "No disponible desde tu pulsera"
    const val SIN_DATO = "sin dato"
    const val GUION = "—" // se ve en lugar de un número que falta; el lector de pantalla dice "sin dato"
    fun ultimaMedicion(valor: String) = "Última medición: $valor"
    fun pulsoSueno(valor: String) = "Pulso durante el sueño: $valor"
    fun fuente(valor: String) = "Fuente: $valor"

    // --- Unidades ---
    const val LPM = "lpm"
    const val HORAS = "h"
    fun lpm(valor: String) = "$valor $LPM"
    fun lpmALas(valor: String, hora: String) = "$valor $LPM a las $hora"
    fun minYPromedio(min: String, promedio: String) = "mín $min · promedio $promedio $LPM"
}
