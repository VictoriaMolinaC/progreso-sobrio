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
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
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

        // 1) Pulso mín / máx / promedio: los calcula Health Connect. Sin datos → null.
        val aggregate = client.aggregate(
            AggregateRequest(
                metrics = setOf(HeartRateRecord.BPM_MIN, HeartRateRecord.BPM_MAX, HeartRateRecord.BPM_AVG),
                timeRangeFilter = dayFilter,
            )
        )

        // 2) Última medición: la muestra más reciente dentro del día.
        //    Mi Fitness guarda bloques de ~30 min, cada uno con varias muestras.
        val heartRateRecords = readAll(HeartRateRecord::class, dayFilter)
        val lastSample = heartRateRecords
            .flatMap { it.samples }
            .filter { it.time >= start && it.time < end }
            .maxByOrNull { it.time }

        // 3) Pulso en reposo: el último registro del día, o null (Mi Fitness hoy no lo escribe).
        val resting = readAll(RestingHeartRateRecord::class, dayFilter).maxByOrNull { it.time }

        // 4) Sueño: se busca desde el mediodía del día anterior para alcanzar la noche que
        //    cruza la medianoche. Solo cuentan las sesiones que terminan este día.
        val previousNoon = date.minusDays(1).atTime(12, 0).atZone(zone).toInstant()
        val sleepSessions = readAll(SleepSessionRecord::class, TimeRangeFilter.between(previousNoon, end))
            .filter { it.endTime >= start && it.endTime < end }
        val sessionRanges = sleepSessions.map { it.startTime to it.endTime }
        val sleepMinutes = sleepMinutesEndingOn(sessionRanges, date, zone)

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
            heartRateRecords + listOfNotNull(resting) + sleepSessions + sleepHeartRateRecords
        val sources = records.map { it.metadata.dataOrigin.packageName }.toSet()

        return DayHealthData(
            date = date,
            restingBpm = resting?.beatsPerMinute?.toInt(),
            minBpm = aggregate[HeartRateRecord.BPM_MIN]?.toInt(),
            maxBpm = aggregate[HeartRateRecord.BPM_MAX]?.toInt(),
            avgBpm = aggregate[HeartRateRecord.BPM_AVG]?.toInt(),
            lastBpm = lastSample?.beatsPerMinute?.toInt(),
            lastBpmTime = lastSample?.time,
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
    }
}
