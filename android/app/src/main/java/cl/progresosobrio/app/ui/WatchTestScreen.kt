package cl.progresosobrio.app.ui

import android.content.ActivityNotFoundException
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import cl.progresosobrio.app.R
import cl.progresosobrio.app.health.DayHealthData
import cl.progresosobrio.app.health.HealthConnectReader
import cl.progresosobrio.app.health.sourceLabel
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

// Los logs solo dicen estados ("permiso concedido"), nunca datos de salud.
private const val TAG = "WatchTest"
private const val MAX_DIAS_ATRAS = 7L
private val ESPANOL = Locale.forLanguageTag("es-CL")

/** Lo que puede estar mostrando la pantalla. */
private sealed interface Estado {
    data object Idle : Estado                          // aún no se toca el botón
    data object HcNotInstalled : Estado                // falta instalar Health Connect
    data object HcUpdateRequired : Estado              // hay que actualizar Health Connect
    data object PermissionDenied : Estado              // la persona no dio permiso
    data object Loading : Estado                       // leyendo
    data class Loaded(val data: DayHealthData) : Estado
    data object NoData : Estado                        // no hay nada de ese día
    data class Error(val mensaje: String) : Estado     // mensaje simple, sin detalles técnicos
}

/** Pantalla de prueba: elige un día y trae pulso y sueño desde Health Connect. */
@Composable
fun WatchTestScreen() {
    val context = LocalContext.current
    val reader = remember { HealthConnectReader(context.applicationContext) }
    val scope = rememberCoroutineScope()

    val hoy = LocalDate.now()
    var dia by remember { mutableStateOf(hoy) }
    var estado by remember { mutableStateOf<Estado>(Estado.Idle) }

    // Lee el día elegido y deja el resultado en "estado".
    suspend fun leer() {
        estado = Estado.Loading
        estado = try {
            val datos = reader.readDay(dia)
            if (datos.isEmpty) Estado.NoData else Estado.Loaded(datos)
        } catch (e: CancellationException) {
            throw e // se cerró la pantalla: no es un error
        } catch (e: Exception) {
            Log.w(TAG, "No se pudo leer: ${e.javaClass.simpleName}") // solo el tipo de error
            Estado.Error(Textos.ERROR_GENERICO)
        }
    }

    // Abre el diálogo de permisos de Health Connect. Al volver, revisa si quedaron los tres.
    val pedirPermisos = rememberLauncherForActivityResult(
        PermissionController.createRequestPermissionResultContract()
    ) {
        scope.launch {
            val concedidos = try { reader.hasAllPermissions() } catch (e: Exception) { false }
            if (concedidos) {
                Log.i(TAG, "Permiso concedido")
                leer()
            } else {
                Log.i(TAG, "Permiso negado")
                estado = Estado.PermissionDenied
            }
        }
    }

    // Botón principal: primero Health Connect, luego permisos, luego leer.
    fun traerDatos() {
        when (reader.sdkStatus()) {
            HealthConnectClient.SDK_AVAILABLE -> scope.launch {
                estado = Estado.Loading
                val tienePermisos = try { reader.hasAllPermissions() } catch (e: Exception) { false }
                if (tienePermisos) leer() else pedirPermisos.launch(reader.permissions)
            }
            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> estado = Estado.HcUpdateRequired
            else -> estado = Estado.HcNotInstalled
        }
    }

    fun abrirPlayStore() {
        try {
            context.startActivity(reader.playStoreIntent())
        } catch (e: ActivityNotFoundException) {
            estado = Estado.Error(Textos.ERROR_PLAY_STORE)
        }
    }

    // Al cambiar de día se borra el resultado anterior, para no mezclar días.
    fun cambiarDia(nuevo: LocalDate) {
        dia = nuevo
        estado = Estado.Idle
    }

    val cargando = estado == Estado.Loading

    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 24.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            // --- Cabecera ---
            Text(Textos.TITULO, style = MaterialTheme.typography.headlineSmall)
            SelectorDeDia(
                dia = dia,
                hoy = hoy,
                habilitado = !cargando,
                onCambiar = { cambiarDia(it) },
            )
            BotonTraer(cargando = cargando, onClick = { traerDatos() })
            Spacer(Modifier.size(4.dp))

            // --- Contenido según el estado ---
            when (val e = estado) {
                Estado.Idle, Estado.Loading -> Unit
                Estado.HcNotInstalled -> TarjetaMensaje(
                    texto = Textos.NECESITAS_HC,
                    boton = Textos.BOTON_INSTALAR_HC,
                    onBoton = { abrirPlayStore() },
                )
                Estado.HcUpdateRequired -> TarjetaMensaje(
                    texto = Textos.HC_DESACTUALIZADO,
                    boton = Textos.BOTON_ACTUALIZAR_HC,
                    onBoton = { abrirPlayStore() },
                )
                Estado.PermissionDenied -> TarjetaMensaje(
                    texto = Textos.SIN_PERMISO,
                    boton = Textos.BOTON_PEDIR_PERMISOS,
                    onBoton = { pedirPermisos.launch(reader.permissions) },
                    nota = Textos.NOTA_PERMISOS,
                )
                Estado.NoData -> TarjetaMensaje(texto = Textos.SIN_DATOS_DEL_DIA)
                is Estado.Error -> TarjetaMensaje(texto = e.mensaje) // sin rojo: no es una alarma
                is Estado.Loaded -> Resultado(e.data)
            }

            // --- Privacidad ---
            Spacer(Modifier.size(4.dp))
            BloquePrivacidad()
        }
    }
}

// --- Cabecera ---

/** Flechas y fecha al medio. Hasta 7 días atrás, nunca el futuro. */
@Composable
private fun SelectorDeDia(
    dia: LocalDate,
    hoy: LocalDate,
    habilitado: Boolean,
    onCambiar: (LocalDate) -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(
            onClick = { onCambiar(dia.minusDays(1)) },
            enabled = habilitado && dia.isAfter(hoy.minusDays(MAX_DIAS_ATRAS)),
        ) {
            Icon(painterResource(R.drawable.ic_chevron_left), contentDescription = Textos.DIA_ANTERIOR)
        }

        // Ancho mínimo fijo para que las flechas no salten al cambiar el largo de la fecha.
        Text(
            text = if (dia == hoy) Textos.hoy(formatearDia(dia)) else formatearDia(dia),
            style = MaterialTheme.typography.titleMedium,
            textAlign = TextAlign.Center,
            modifier = Modifier.widthIn(min = 168.dp),
        )

        IconButton(
            onClick = { onCambiar(dia.plusDays(1)) },
            enabled = habilitado && dia.isBefore(hoy),
        ) {
            Icon(painterResource(R.drawable.ic_chevron_right), contentDescription = Textos.DIA_SIGUIENTE)
        }
    }
}

/** Acción principal, de ancho completo. Mientras lee dice "Leyendo…" y no se puede tocar. */
@Composable
private fun BotonTraer(cargando: Boolean, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        enabled = !cargando,
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 56.dp),
        shape = MaterialTheme.shapes.medium,
        colors = ButtonDefaults.buttonColors(
            // Deshabilitado con colores legibles (los de Material por defecto son muy tenues).
            disabledContainerColor = MaterialTheme.colorScheme.surfaceContainerLow,
            disabledContentColor = MaterialTheme.colorScheme.onSurfaceVariant,
        ),
    ) {
        if (cargando) {
            CircularProgressIndicator(
                modifier = Modifier.size(18.dp),
                strokeWidth = 2.dp,
                color = LocalContentColor.current,
            )
            Spacer(Modifier.width(12.dp))
            Text(Textos.LEYENDO)
        } else {
            Text(Textos.BOTON_TRAER)
        }
    }
}

// --- Tarjetas ---

/** Tarjeta base: esquinas de 20 dp, levemente elevada. */
@Composable
private fun Tarjeta(contenido: @Composable ColumnScope.() -> Unit) {
    ElevatedCard(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            content = contenido,
        )
    }
}

/** Estados sin datos / sin permiso / sin Health Connect / error: mensaje centrado y botón debajo. */
@Composable
private fun TarjetaMensaje(
    texto: String,
    boton: String? = null,
    onBoton: () -> Unit = {},
    nota: String? = null,
) {
    Tarjeta {
        Text(
            texto,
            style = MaterialTheme.typography.bodyLarge,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(),
        )
        if (boton != null) {
            FilledTonalButton(
                onClick = onBoton,
                shape = MaterialTheme.shapes.medium,
                modifier = Modifier
                    .heightIn(min = 48.dp)
                    .align(Alignment.CenterHorizontally),
            ) { Text(boton) }
        }
        if (nota != null) {
            Text(
                nota,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

/** Los datos del día. Todo lo que sea null se muestra suave ("—" o "sin dato"), nunca como error. */
@Composable
private fun Resultado(data: DayHealthData) {
    val context = LocalContext.current
    val suave = MaterialTheme.colorScheme.onSurfaceVariant
    val fuentes = data.sources.map { sourceLabel(context, it) }.distinct().sorted()

    // Pulso del día: mín / máx / promedio en tres columnas.
    Tarjeta {
        TituloTarjeta(Textos.PULSO_DEL_DIA)
        // Alineadas por abajo: si una etiqueta ocupa dos líneas, los números quedan a la misma altura.
        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.Bottom) {
            ValorEnColumna(Textos.MIN, data.minBpm, Modifier.weight(1f))
            ValorEnColumna(Textos.MAX, data.maxBpm, Modifier.weight(1f))
            ValorEnColumna(Textos.PROMEDIO, data.avgBpm, Modifier.weight(1f))
        }
        Text(
            Textos.ultimaMedicion(formatearUltimaMedicion(data)),
            color = if (data.lastBpm == null) suave else MaterialTheme.colorScheme.onSurface,
        )
    }

    // Sueño: horas en grande y el pulso durante el sueño debajo.
    Tarjeta {
        TituloTarjeta(Textos.SUENO)
        val minutos = data.sleepMinutes
        if (minutos != null) ValorGrande(formatearHoras(minutos), Textos.HORAS) else SinDato()
        Text(
            Textos.pulsoSueno(formatearPulsoSueno(data)),
            color = if (data.sleepMinBpm == null) suave else MaterialTheme.colorScheme.onSurface,
        )
    }

    // Pulso en reposo: dato distinto, no se mezcla con el del sueño.
    Tarjeta {
        TituloTarjeta(Textos.PULSO_EN_REPOSO)
        val reposo = data.restingBpm
        if (reposo != null) {
            ValorGrande(reposo.toString(), Textos.LPM)
        } else {
            SinDato()
            Text(Textos.NOTA_REPOSO, color = suave)
        }
    }

    // Fuente: línea discreta.
    Text(
        Textos.fuente(if (fuentes.isEmpty()) Textos.SIN_DATO else fuentes.joinToString(", ")),
        style = MaterialTheme.typography.labelMedium,
        color = suave,
        modifier = Modifier.padding(horizontal = 4.dp),
    )
}

@Composable
private fun TituloTarjeta(texto: String) {
    Text(texto, style = MaterialTheme.typography.titleMedium)
}

/** Nombre pequeño arriba y valor grande abajo. Si falta, un guion suave. */
@Composable
private fun ValorEnColumna(etiqueta: String, valor: Int?, modifier: Modifier) {
    // mergeDescendants: el lector de pantalla lee la columna completa, por ejemplo "mín, 47 lpm".
    Column(modifier = modifier.semantics(mergeDescendants = true) {}) {
        Text(
            etiqueta,
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        if (valor != null) {
            ValorGrande(valor.toString(), Textos.LPM)
        } else {
            Text(
                Textos.GUION,
                style = MaterialTheme.typography.headlineLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.semantics { contentDescription = Textos.SIN_DATO },
            )
        }
    }
}

/** Valor grande con la unidad pequeña al lado: "47 lpm", "9,6 h". */
@Composable
private fun ValorGrande(valor: String, unidad: String) {
    val colorUnidad = MaterialTheme.colorScheme.onSurfaceVariant
    val tamanoUnidad = MaterialTheme.typography.labelLarge.fontSize
    Text(
        buildAnnotatedString {
            append(valor)
            withStyle(SpanStyle(fontSize = tamanoUnidad, fontWeight = FontWeight.Normal, color = colorUnidad)) {
                append(" $unidad")
            }
        },
        style = MaterialTheme.typography.headlineLarge,
    )
}

/** "sin dato" suave, en el lugar del valor grande. */
@Composable
private fun SinDato() {
    Text(
        Textos.SIN_DATO,
        style = MaterialTheme.typography.titleMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
    )
}

/** Bloque de privacidad al final: candado y texto legible, no letra chica. */
@Composable
private fun BloquePrivacidad() {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        color = MaterialTheme.colorScheme.secondaryContainer,
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
                tint = MaterialTheme.colorScheme.primary,
            )
            Text(Textos.PRIVACIDAD_RESUMEN, style = MaterialTheme.typography.bodyLarge)
        }
    }
}

// --- Formatos ---

private val formatoDia = DateTimeFormatter.ofPattern("EEE d MMM", ESPANOL)
private val formatoHora = DateTimeFormatter.ofPattern("HH:mm", ESPANOL)

// "mar 6 oct". Java escribe "mar. 6 oct." en español, así que se quitan los puntos.
private fun formatearDia(dia: LocalDate): String = formatoDia.format(dia).replace(".", "")

// "96 lpm a las 10:45", en hora local.
private fun formatearUltimaMedicion(data: DayHealthData): String {
    val bpm = data.lastBpm ?: return Textos.SIN_DATO
    val momento = data.lastBpmTime ?: return Textos.lpm(bpm.toString())
    val hora = formatoHora.format(momento.atZone(ZoneId.systemDefault()))
    return Textos.lpmALas(bpm.toString(), hora)
}

// "mín 47 · promedio 55 lpm". Los dos salen de las mismas muestras: si falta uno, "sin dato".
private fun formatearPulsoSueno(data: DayHealthData): String {
    val min = data.sleepMinBpm ?: return Textos.SIN_DATO
    val promedio = data.sleepAvgBpm ?: return Textos.SIN_DATO
    return Textos.minYPromedio(min.toString(), promedio.toString())
}

// 372 minutos → "6,2" (con coma decimal; la unidad "h" se dibuja aparte).
private fun formatearHoras(minutos: Long): String = String.format(ESPANOL, "%.1f", minutos / 60.0)
