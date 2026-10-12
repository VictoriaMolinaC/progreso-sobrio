package cl.progresosobrio.app.health

import android.content.Context
import android.content.pm.PackageManager

// Nombres conocidos, por si Android no deja ver el nombre de la app (visibilidad de paquetes).
private val nombresConocidos = mapOf("com.xiaomi.wearable" to "Mi Fitness")

/**
 * Nombre legible de la app que escribió los datos ("Mi Fitness").
 * Intenta el nombre real de la app; si no, el mapa de conocidos; si tampoco, el packageName.
 * Lo usan la pantalla de prueba y el puente.
 */
@Suppress("DEPRECATION") // getApplicationInfo(String, Int) sigue funcionando en todas las versiones
fun sourceLabel(context: Context, packageName: String): String =
    try {
        val pm = context.packageManager
        pm.getApplicationLabel(pm.getApplicationInfo(packageName, 0)).toString()
    } catch (e: PackageManager.NameNotFoundException) {
        nombresConocidos[packageName] ?: packageName
    }
