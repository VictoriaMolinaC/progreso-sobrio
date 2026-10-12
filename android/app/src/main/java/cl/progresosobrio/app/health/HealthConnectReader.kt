package cl.progresosobrio.app.health

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.RestingHeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import java.time.Duration
import java.time.LocalDate
import java.time.ZoneId
import kotlin.reflect.KClass

/**
 * Lee pulso y sueño desde Health Connect.
 * Solo lectura, solo cuando se le pide (al tocar el botón). No guarda nada ni escribe en logs.
 */
class HealthConnectReader(private val context: Context) {

    // El cliente se crea recién al usarlo: crearlo falla si Health Connect no está disponible.
    private val client by lazy { HealthConnectClient.getOrCreate(context) }

    /** Permisos de lectura que pide la app. */
    val permissions = setOf(
        HealthPermission.getReadPermission(HeartRateRecord::class),
        HealthPermission.getReadPermission(RestingHeartRateRecord::class),
        HealthPermission.getReadPermission(SleepSessionRecord::class),
    )

    /**
     * Estado de Health Connect en el teléfono:
     * SDK_AVAILABLE (listo), SDK_UNAVAILABLE (no instalado) o
     * SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED (hay que actualizarlo).
     */
    fun sdkStatus(): Int = HealthConnectClient.getSdkStatus(context, HEALTH_CONNECT_PACKAGE)

    /** true si la persona ya concedió los tres permisos. */
    suspend fun hasAllPermissions(): Boolean =
        client.permissionController.getGrantedPermissions().containsAll(permissions)

    /** Lee los datos de [date] en hora local. Lo que no exista queda en null. */
    suspend fun readDay(date: LocalDate, zone: ZoneId = ZoneId.systemDefault()): DayHealthData {
        val (start, end) = dayBounds(date, zone)
        val dayFilter = TimeRangeFilter.between(start, end)

        // 1) Pulso del día (mín / máx / promedio). Se lee desde 24 h antes del inicio del día:
        //    Mi Fitness escribe registros que empiezan la noche anterior (ej. 9:30 p. m. → 1:29 p. m.)
        //    y además los repite superpuestos. dayPulse usa solo las muestras del día, cada una
        //    una vez. No se usa el promedio de Health Connect porque cuenta las repetidas.
        val heartRateRecords = readAll(
            HeartRateRecord::class,
            TimeRangeFilter.between(start.minus(Duration.ofHours(24)), end),
        )
        val samples = heartRateRecords.flatMap { it.samples }.map { it.time to it.beatsPerMinute.toInt() }
        val pulse = dayPulse(samples, start, end)

        // 2) Última medición: la muestra más reciente dentro del día.
        val lastSample = samples
            .filter { (time, _) -> time >= start && time < end }
            .maxByOrNull { (time, _) -> time }

        // Para "Fuente": solo los registros de pulso con alguna muestra dentro del día.
        val dayHeartRateRecords = heartRateRecords.filter { record ->
            record.samples.any { it.time >= start && it.time < end }
        }

        // 3) Pulso en reposo: el último registro del día, o null (Mi Fitness hoy no lo escribe).
        val resting = readAll(RestingHeartRateRecord::class, dayFilter).maxByOrNull { it.time }

        // 4) Sueño: se busca desde el mediodía del día anterior para alcanzar la noche que
        //    cruza la medianoche. Solo cuentan las sesiones que terminan este día; si traen
        //    etapas, los tramos despierto no suman.
        val previousNoon = date.minusDays(1).atTime(12, 0).atZone(zone).toInstant()
        val sleepSessions = readAll(SleepSessionRecord::class, TimeRangeFilter.between(previousNoon, end))
            .filter { it.endTime >= start && it.endTime < end }
        val sessionRanges = sleepSessions.map { it.startTime to it.endTime }
        val sleepMinutes = sleepMinutesEndingOn(sleepSessions.map { it.toSleepSession() }, date, zone)

        // 5) Pulso durante el sueño: una sola lectura desde el inicio de la primera sesión
        //    hasta el fin de la última (la noche suele empezar el día anterior).
        //    Ojo: Mi Fitness reescribe registros que se superponen, así que la misma muestra
        //    puede llegar varias veces. sleepPulse quita las repetidas y se queda solo con
        //    las muestras que caen dentro de alguna sesión.
        val sleepHeartRateRecords = if (sessionRanges.isEmpty()) {
            emptyList()
        } else {
            val from = sessionRanges.minOf { it.first }
            val to = sessionRanges.maxOf { it.second }
            readAll(HeartRateRecord::class, TimeRangeFilter.between(from, to))
        }
        val pulseWhileAsleep = sleepPulse(
            samples = sleepHeartRateRecords.flatMap { it.samples }.map { it.time to it.beatsPerMinute.toInt() },
            sessions = sessionRanges,
        )

        // Apps que escribieron estos datos (por ejemplo, Mi Fitness).
        val records: List<Record> =
            dayHeartRateRecords + listOfNotNull(resting) + sleepSessions + sleepHeartRateRecords
        val sources = records.map { it.metadata.dataOrigin.packageName }.toSet()

        return DayHealthData(
            date = date,
            restingBpm = resting?.beatsPerMinute?.toInt(),
            minBpm = pulse?.minBpm,
            maxBpm = pulse?.maxBpm,
            avgBpm = pulse?.avgBpm,
            lastBpm = lastSample?.second,
            lastBpmTime = lastSample?.first,
            sleepMinutes = sleepMinutes,
            sleepMinBpm = pulseWhileAsleep?.minBpm,
            sleepAvgBpm = pulseWhileAsleep?.avgBpm,
            sources = sources,
        )
    }

    /** Abre Play Store en la ficha de Health Connect, para instalarlo o actualizarlo. */
    fun playStoreIntent(): Intent =
        Intent(Intent.ACTION_VIEW).apply {
            setPackage("com.android.vending")
            data = Uri.parse(
                "market://details?id=$HEALTH_CONNECT_PACKAGE&url=healthconnect%3A%2F%2Fonboarding"
            )
            putExtra("overlay", true)
            putExtra("callerId", context.packageName)
        }

    // Sesión de Health Connect → modelo de SleepMath. Despierto, despierto en cama y fuera de
    // la cama no cuentan como sueño; las demás etapas (ligero, profundo, REM, sin detalle) sí.
    private fun SleepSessionRecord.toSleepSession() = SleepSession(
        start = startTime,
        end = endTime,
        stages = stages.map { SleepStage(it.startTime, it.endTime, awake = it.stage in AWAKE_STAGES) },
    )

    // Lee todos los registros de un tipo, página por página.
    private suspend fun <T : Record> readAll(type: KClass<T>, filter: TimeRangeFilter): List<T> {
        val result = mutableListOf<T>()
        var pageToken: String? = null
        do {
            val response = client.readRecords(
                ReadRecordsRequest(recordType = type, timeRangeFilter = filter, pageToken = pageToken)
            )
            result += response.records
            pageToken = response.pageToken
        } while (!pageToken.isNullOrEmpty())
        return result
    }

    companion object {
        const val HEALTH_CONNECT_PACKAGE = "com.google.android.apps.healthdata"

        private val AWAKE_STAGES = setOf(
            SleepSessionRecord.STAGE_TYPE_AWAKE,
            SleepSessionRecord.STAGE_TYPE_AWAKE_IN_BED,
            SleepSessionRecord.STAGE_TYPE_OUT_OF_BED,
        )
    }
}
