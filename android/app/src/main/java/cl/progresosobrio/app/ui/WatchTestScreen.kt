package cl.progresosobrio.app.ui

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.pm.PackageManager
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import cl.progresosobrio.app.health.DayHealthData
import cl.progresosobrio.app.health.HealthConnectReader
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

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            Text(
                Textos.PIE,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier
                    .navigationBarsPadding()
                    .padding(16.dp),
            )
        },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Text(Textos.TITULO, style = MaterialTheme.typography.headlineSmall)

            // Selector de día: hasta 7 días atrás, nunca el futuro.
            val cargando = estado == Estado.Loading
            Row(verticalAlignment = Alignment.CenterVertically) {
                TextButton(
                    onClick = { cambiarDia(dia.minusDays(1)) },
                    enabled = !cargando && dia.isAfter(hoy.minusDays(MAX_DIAS_ATRAS)),
                    modifier = Modifier.semantics { contentDescription = Textos.DIA_ANTERIOR },
                ) { Text("←", style = MaterialTheme.typography.titleLarge) }

                Text(formatearDia(dia), style = MaterialTheme.typography.titleMedium)

                TextButton(
                    onClick = { cambiarDia(dia.plusDays(1)) },
                    enabled = !cargando && dia.isBefore(hoy),
                    modifier = Modifier.semantics { contentDescription = Textos.DIA_SIGUIENTE },
                ) { Text("→", style = MaterialTheme.typography.titleLarge) }
            }

            Button(onClick = { traerDatos() }, enabled = !cargando) {
                Text(Textos.BOTON_TRAER)
            }

            when (val e = estado) {
                Estado.Idle -> Unit
                Estado.Loading -> CircularProgressIndicator()
                Estado.HcNotInstalled -> {
                    Text(Textos.NECESITAS_HC)
                    OutlinedButton(onClick = { abrirPlayStore() }) { Text(Textos.BOTON_INSTALAR_HC) }
                }
                Estado.HcUpdateRequired -> {
                    OutlinedButton(onClick = { abrirPlayStore() }) { Text(Textos.BOTON_ACTUALIZAR_HC) }
                }
                Estado.PermissionDenied -> {
                    Text(Textos.SIN_PERMISO)
                    OutlinedButton(onClick = { pedirPermisos.launch(reader.permissions) }) {
                        Text(Textos.BOTON_PEDIR_PERMISOS)
                    }
                    Text(Textos.NOTA_PERMISOS, style = MaterialTheme.typography.bodySmall)
                }
                Estado.NoData -> Text(Textos.SIN_DATOS_DEL_DIA)
                is Estado.Error -> Text(e.mensaje, color = MaterialTheme.colorScheme.error)
                is Estado.Loaded -> Resultado(e.data)
            }
        }
    }
}

/** Las tarjetas con los datos del día. Todo lo que sea null se muestra como "sin dato". */
@Composable
private fun Resultado(data: DayHealthData) {
    val context = LocalContext.current
    val fuentes = data.sources.map { nombreDeApp(context, it) }.distinct().sorted()

    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Tarjeta(Textos.pulsoReposo(data.restingBpm?.let { Textos.lpm(it.toString()) } ?: Textos.SIN_DATO))
        Tarjeta(Textos.pulsoMinMaxProm(formatearMinMaxProm(data)))
        Tarjeta(Textos.ultimaMedicion(formatearUltimaMedicion(data)))
        Tarjeta(Textos.sueno(data.sleepMinutes?.let { formatearHoras(it) } ?: Textos.SIN_DATO))
        Tarjeta(Textos.fuente(if (fuentes.isEmpty()) Textos.SIN_DATO else fuentes.joinToString(", ")))
    }
}

@Composable
private fun Tarjeta(texto: String) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Text(texto, modifier = Modifier.padding(16.dp), style = MaterialTheme.typography.bodyLarge)
    }
}

// --- Formatos ---

private val formatoDia = DateTimeFormatter.ofPattern("EEE d MMM", ESPANOL)
private val formatoHora = DateTimeFormatter.ofPattern("HH:mm", ESPANOL)

// "mar 6 oct". Java escribe "mar. 6 oct." en español, así que se quitan los puntos.
private fun formatearDia(dia: LocalDate): String = formatoDia.format(dia).replace(".", "")

// "53 / 115 / 66 lpm". Si falta uno, ese lugar dice "sin dato"; si faltan todos, solo "sin dato".
private fun formatearMinMaxProm(data: DayHealthData): String {
    val valores = listOf(data.minBpm, data.maxBpm, data.avgBpm)
    if (valores.all { it == null }) return Textos.SIN_DATO
    return Textos.lpm(valores.joinToString(" / ") { it?.toString() ?: Textos.SIN_DATO })
}

// "96 lpm a las 10:45", en hora local.
private fun formatearUltimaMedicion(data: DayHealthData): String {
    val bpm = data.lastBpm ?: return Textos.SIN_DATO
    val momento = data.lastBpmTime ?: return Textos.lpm(bpm.toString())
    val hora = formatoHora.format(momento.atZone(ZoneId.systemDefault()))
    return Textos.lpmALas(bpm.toString(), hora)
}

// 372 minutos → "6,2 h" (con coma decimal).
private fun formatearHoras(minutos: Long): String =
    Textos.horas(String.format(ESPANOL, "%.1f", minutos / 60.0))

// --- Nombre de la app que escribió los datos ---

// Nombres conocidos, por si Android no deja ver el nombre de la app.
private val nombresConocidos = mapOf("com.xiaomi.wearable" to "Mi Fitness")

// Intenta el nombre real de la app; si no, el mapa; si tampoco, el packageName.
@Suppress("DEPRECATION") // getApplicationInfo(String, Int) sigue funcionando en todas las versiones
private fun nombreDeApp(context: Context, packageName: String): String =
    try {
        val pm = context.packageManager
        pm.getApplicationLabel(pm.getApplicationInfo(packageName, 0)).toString()
    } catch (e: PackageManager.NameNotFoundException) {
        nombresConocidos[packageName] ?: packageName
    }
