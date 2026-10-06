package cl.progresosobrio.app.health

import java.time.Instant
import java.time.LocalDate

/**
 * Lo que se leyó de Health Connect para un día.
 * Si un valor no existe, es null y se muestra "sin dato". Nunca se estima.
 */
data class DayHealthData(
    val date: LocalDate,
    val restingBpm: Int?,       // pulso en reposo (Mi Fitness hoy no lo escribe)
    val minBpm: Int?,           // pulso mínimo del día
    val maxBpm: Int?,           // pulso máximo del día
    val avgBpm: Int?,           // pulso promedio del día
    val lastBpm: Int?,          // última medición del día
    val lastBpmTime: Instant?,  // momento de esa última medición
    val sleepMinutes: Long?,    // minutos de sueño que terminaron ese día
    val sources: Set<String>,   // packageName de las apps que escribieron los datos
) {
    /** true si no llegó ningún dato de ese día. */
    val isEmpty: Boolean
        get() = restingBpm == null && minBpm == null && maxBpm == null &&
            avgBpm == null && lastBpm == null && sleepMinutes == null
}
