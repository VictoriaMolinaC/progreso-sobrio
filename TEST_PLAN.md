# Plan de Pruebas y Estrategia de Automatización QA

**Proyecto:** Progreso Sobrio
**Repositorio:** [VictoriaMolinaC/progreso-sobrio](https://github.com/VictoriaMolinaC/progreso-sobrio)
**Versión del documento:** 1.5.0
**Fecha de creación:** Octubre 2026
**Última actualización:** Noviembre 2026 (app Android y CI)
**Creadora y mantenedora:** Victoria Molina
**Contribución QA:** Christian Santibáñez Martínez

> ⚠️ **Principio rector:** Este proyecto opera bajo la filosofía "Privacy First" (100% offline, sin backend, sin analíticas, sin llamadas de red con datos personales). La estrategia de pruebas debe garantizar que ningún dato del usuario salga jamás del dispositivo.

---

## Tabla de Contenidos

1. [Alcance y Matriz de Cobertura de Pruebas](#1-alcance-y-matriz-de-cobertura-de-pruebas)
2. [Arquitectura de Pruebas (Privacy-First)](#2-arquitectura-de-pruebas-privacy-first)
3. [Roadmap de Implementación](#3-roadmap-de-implementación)
4. [Estrategia CI/CD y Gobernanza del Código](#4-estrategia-cicd-y-gobernanza-del-código)

---

## 1. Alcance y Matriz de Cobertura de Pruebas

### 1.1 Definición del Alcance

**Dentro del Alcance (IN SCOPE)**

- **Onboarding y Consentimiento:** Tour de bienvenida (4 tarjetas), aceptación de Política de Privacidad y Términos de Uso (app para mayores de 18 años, aviso de que no reemplaza atención médica y derivación a la línea 1412 de SENDA).
- **Gestión de Rachas (Streaks):** Cálculo de días de sobriedad por sustancia. La racha se calcula a partir de la fecha del último consumo registrado para esa sustancia; guardar un registro diario **no** modifica la racha.
- **Registro Diario (< 30 segundos):** LPM en reposo, ansias, sueño, actividad física, energía, ánimo, hábitos cumplidos, disparadores y notas.
- **Historial y Gráficas:** Tarjetas, calendario editable y gráficas (Recharts) de LPM, sueño y actividad.
- **Panel "Qué te ayuda":** Correlaciones simples en lenguaje llano (sin diagnósticos).
- **Respaldo y Restauración:** Exportación e importación de respaldo completo en JSON discreto (`ps-AAAA-MM-DD.json`) y registros en CSV. Se muestra un aviso de confirmación antes de iniciar la exportación.
- **Pantalla de Privacidad ("Ojo Tachado"):** Pantalla neutra que oculta la app de inmediato; opción de bloqueo automático al salir en Ajustes.
- **App Android y Health Connect:** Envoltorio nativo Kotlin (WebView sin permiso de internet) y lectura local de pulso/sueño desde Health Connect con vista previa obligatoria.

**Fuera del Alcance (OUT OF SCOPE)**

- **Backend y Servidores Externos:** Al no existir backend, quedan excluidas las pruebas de APIs de servidor, bases de datos remotas y pasarelas de pago.
- **Analíticas y Telemetría:** Cero pruebas de trackers de eventos o cookies de seguimiento (prohibido por diseño).
- **Agentes de IA:** Rechazado explícitamente por diseño (discusión #47) para proteger la privacidad y evitar riesgos en momentos de crisis.

### 1.2 Mapeo de Casos de Prueba Críticos (BDD / Gherkin)

#### Módulo 1: Privacidad y Modo Offline (Air-Gapped)

```gherkin
Feature: Garantía de Privacidad y Funcionamiento Offline

  Scenario: TC_PRIV_01 - La PWA funciona en Modo Avión sin conexión a internet
    Given que la PWA ha sido cargada e instalada en el navegador
    When el usuario activa el Modo Avión en su dispositivo
    And navega por las distintas pantallas de la aplicación
    Then la aplicación debe operar al 100% sin arrojar errores de red
    And no debe realizarse ninguna petición HTTP hacia dominios externos

  Scenario: TC_PRIV_02 - Cero analíticas o scripts de terceros cargados
    Given que la aplicación está abierta en el navegador con DevTools Network activo
    When se recarga la página de inicio
    Then no debe observarse ninguna llamada a CDNs externas, fuentes de Google, o píxeles de analítica
    And todos los recursos (estilos, iconos, scripts) deben cargarse exclusivamente desde el origen local (`self`)
```

#### Módulo 2: Onboarding — Política de Privacidad y Términos de Uso

```gherkin
Feature: Aceptación de Política de Privacidad y Términos de Uso

  Scenario: TC_CONSENT_01 - Se solicita aceptación la primera vez que se abre la app
    Given que el usuario abre la app por primera vez (sin datos previos en IndexedDB)
    When la app termina de cargar
    Then debe mostrarse la casilla de aceptación de la Política de Privacidad y los Términos de Uso
    And no debe ser posible continuar sin marcar la casilla

  Scenario: TC_CONSENT_02 - No se vuelve a pedir si la versión no cambió
    Given que el usuario ya aceptó la Política y los Términos en su versión actual
    When vuelve a abrir la app
    Then no debe mostrarse nuevamente la pantalla de aceptación

  Scenario: TC_CONSENT_03 - Se vuelve a pedir si cambia la versión de la Política o los Términos
    Given que el usuario aceptó la Política y los Términos en una versión anterior
    When se publica una nueva versión de la Política o los Términos
    And el usuario abre la app
    Then debe mostrarse nuevamente la pantalla de aceptación con la nueva versión
    And el usuario debe aceptar explícitamente antes de poder continuar
```

#### Módulo 3: Registro Diario y Cálculo de Rachas

```gherkin
Feature: Registro Diario y Rachas de Sobriedad

  Scenario: TC_REG_01 - Registro diario exitoso con datos mínimos
    Given que el usuario se encuentra en la pantalla de registro diario
    When ingresa al menos un dato (por ejemplo, nivel de ansias o ánimo)
    And hace clic en "Guardar registro"
    Then el registro debe persistirse localmente en IndexedDB mediante Dexie.js
    And la racha de sobriedad de cada sustancia NO debe cambiar al guardar el registro diario

  Scenario: TC_STREAK_01 - Cálculo correcto de días de abstinencia
    Given que el usuario registró su último consumo de una sustancia en una fecha específica
    When el sistema calcula la racha activa para dicha sustancia
    Then el número de días devuelto debe coincidir con la diferencia en días calendario
     entre esa fecha y la fecha actual
    And la racha solo debe actualizarse cuando el usuario registra un nuevo consumo de esa sustancia

  Scenario: TC_STREAK_02 - Rachas independientes por sustancia
    Given que el usuario tiene registros de último consumo para dos sustancias distintas
    When el sistema calcula las rachas activas
    Then cada sustancia debe tener su propia racha calculada de forma independiente
```

#### Módulo 4: Respaldo y Restauración de Datos (JSON / CSV)

```gherkin
Feature: Respaldo y Restauración de Datos Locales

  Scenario: TC_BACKUP_01 - Aviso de confirmación antes de exportar
    Given que el usuario tiene registros guardados en la aplicación
    When selecciona la opción "Descargar respaldo completo" en Ajustes
    Then debe mostrarse un aviso de confirmación antes de iniciar la descarga
    And solo debe generarse el archivo si el usuario confirma la acción

  Scenario: TC_BACKUP_02 - Generación de respaldo con nomenclatura discreta
    Given que el usuario confirmó la exportación
    Then se debe generar un archivo JSON con nombre discreto (ej: ps-AAAA-MM-DD.json)
    And el archivo debe contener toda la estructura de IndexedDB exportada correctamente

  Scenario: TC_REST_01 - Restauración de respaldo válido con validación estricta
    Given que el usuario selecciona un archivo JSON de respaldo válido previamente exportado
    When ejecuta la opción "Restaurar un respaldo"
    Then el sistema debe validar estrictamente la estructura del JSON antes de sobrescribir datos
    And los datos restaurados deben reflejarse inmediatamente en el historial y las gráficas
```

#### Módulo 5: Seguridad en la App Android y Health Connect

```gherkin
Feature: Restricciones de Seguridad en Android y Health Connect

  Scenario: TC_AND_01 - Ausencia total de permisos de red en Android
    Given que se inspecciona el archivo AndroidManifest.xml de la app Android
    When se revisan los permisos declarados
    Then la aplicación NO debe declarar el permiso android.permission.INTERNET
    And el sistema operativo Android debe bloquear cualquier intento de socket o red por diseño

  Scenario: TC_AND_02 - Lectura de Health Connect bajo demanda y con vista previa
    Given que el usuario utiliza la app Android y desea incorporar datos de su smartwatch
    When presiona la opción "Traer datos del reloj"
    Then el sistema debe mostrar una vista previa obligatoria del pulso y sueño antes de persistir
    And ningún dato de salud debe guardarse automáticamente sin la confirmación explícita del usuario

  Scenario: TC_AND_03 - Instalación limpia sin pedir permisos
    Given que la app Android se instala por primera vez
    When el usuario la abre
    Then debe mostrarse la puerta de edad, luego la aceptación de la Política y los Términos, y el tour
    And no debe aparecer ningún diálogo de permisos hasta que el usuario toque "Traer datos del reloj"

  Scenario: TC_AND_04 - Negar o revocar los permisos no rompe la app
    Given que el usuario negó o revocó los permisos de Health Connect
    When vuelve a tocar "Traer datos del reloj"
    Then la app debe volver a pedir los permisos
    And si el usuario los niega, debe verse un mensaje y el resto de la app debe seguir funcionando

  Scenario: TC_AND_05 - Día sin datos del reloj
    Given que Health Connect no tiene datos del día elegido
    When el usuario toca "Traer datos del reloj"
    Then debe mostrarse "No hay datos de este día. Abre Mi Fitness para sincronizar tu pulsera y vuelve a intentar."
    And la app nunca debe estimar un valor que la pulsera no entregó

  Scenario: TC_AND_06 - Solo los enlaces de teléfono, correo y web segura salen de la app
    Given que la PWA, dentro de la app Android, abre un enlace
    When el enlace es tel:, mailto: o https: a otro sitio
    Then debe abrirse fuera de la app (el marcador sin llamar, el correo o el navegador)
    And cualquier otro esquema (http:, javascript:, file:, intent:…) debe bloquearse
    And dentro del WebView solo debe abrirse la PWA empaquetada (https://appassets.androidplatform.net/www/…)

  Scenario: TC_AND_07 - Respaldo de ida y vuelta entre la app y el navegador
    Given que el usuario exportó un respaldo ps-AAAA-MM-DD.json desde la app Android
    When lo restaura en la PWA del navegador, o al revés
    Then los datos restaurados deben ser los mismos
    And en teléfonos donde Descargas muestra el archivo con 0 B, la app igual debe leerlo completo

  Scenario: TC_AND_08 - Los logs nunca muestran datos de salud
    Given que la app está en uso con adb logcat abierto
    When el usuario trae datos del reloj, guarda registros y exporta respaldos
    Then los logs solo deben mostrar estados ("Puente instalado", "readDay: datos enviados", "saveFile: guardado")
    And nunca valores de pulso, sueño, ansias ni notas
```

### 1.3 Checklist manual de la app Android

Se recorre en el teléfono antes de publicar cada versión del APK, con la versión release (firmada) y, si se puede, también en un emulador con Android 14 o superior, donde los permisos de Health Connect se ven distintos.

**Última pasada: 4 de noviembre de 2026.** APK release firmado y compilado desde `main` (PWA del commit `5c3ec05`), en un Xiaomi con Android 12 (MIUI) y una pulsera Xiaomi sincronizada con Mi Fitness. En el emulador (Android 17), el APK debug, sin pulsera. En los logs: ningún dato de salud y ningún cierre de la app.

| CU | Prueba | Resultado esperado | Xiaomi · Android 12 | Emulador · Android 17 |
|---|---|---|---|---|
| 1 | Instalar limpio y abrir | Puerta de edad → Política y Términos → tour. Sin diálogo de permisos | ✅ | ✅ |
| 2 | Registro → "Traer datos del reloj" (primera vez) | Pantalla de permisos de Health Connect: pulso, pulso en reposo y sueño | ✅ | ✅ |
| 3 | Aceptar los permisos | Vista previa con los datos del día; "Usar estos datos" rellena el registro | ✅ | — (sin pulsera) |
| 4 | Negar los permisos | Mensaje; la app sigue funcionando y el botón sigue disponible | ✅ | — |
| 5 | Health Connect no instalado | "Instalar Health Connect" abre la Play Store | — (1) | — (1) |
| 6 | Día sin sincronizar | "No hay datos de este día…" | ✅ | ✅ |
| 7 | Cambiar la fecha a ayer y traer | Datos de ayer (hasta 7 días atrás) | ✅ | — |
| 8 | Editar lo prellenado antes de guardar | Se guarda lo editado | ✅ | — |
| 9 | Health Connect → permisos de la app → política | Abre la pantalla de privacidad de la app | ✅ | — |
| 10 | Revocar los permisos y volver a traer | La app los vuelve a pedir; nada se rompe | ✅ | — |
| 11 | Exportar en la app → restaurar en el navegador, y al revés | Mismos datos | ✅ | — |
| 12 | Modo avión en lo anterior | Todo funciona igual | ✅ | — |
| 13 | Aceptación de la Política y los Términos | "Continuar" se activa solo al marcar la casilla | ✅ | ✅ |
| 14 | Enlaces a la Política y los Términos | Se abren en el navegador; Atrás vuelve a la app en la misma pantalla | ✅ | — |
| 15 | 1412 (botón del corazón) | Abre el marcador con el 1412, sin llamar | ✅ | — |
| 16 | "Ansias" en el registro | Escala con la guía "1 = nada · 5 = muchas"; basta un dato para guardar | ✅ | — |
| 17 | Ojo tachado | Tapa toda la app. Con "Tapar la app cada vez que salgo de ella", queda tapada al volver y al abrirla | ✅ | ✅ |
| 18 | Exportar | Aviso "Este archivo va a tener tus datos de salud…"; Cancelar no guarda nada; Aceptar guarda `ps-AAAA-MM-DD.json` y `.csv` | ✅ | — |
| 19 | Girar el teléfono con el formulario a medias | No se pierde nada | ✅ | — |
| 20 | Escribir con el teclado abierto | El teclado no tapa el campo activo | ✅ | — |
| 21 | "Datos del reloj" y "Privacidad de la app" (Ajustes → App Android) | El estilo de la PWA (ceja, título liviano, tarjetas de papel, botones píldora); en modo oscuro todo el texto se lee | ✅ | ✅ (2) |
| 22 | "Privacidad de la app" → "Leer la Política de privacidad" | Abre la Política en el navegador | ✅ | ✅ (2) |
| 23 | Ícono y nombre en el lanzador, también al actualizar encima de una versión anterior | La manchita sobre crema y el nombre "PS"; los datos y permisos se mantienen | ✅ | ✅ (2) |

(1) No se prueba: desde Android 14, Health Connect viene con el sistema y no se puede desinstalar; en el Xiaomi, desinstalarlo borraría los datos que Mi Fitness guardó ahí.
(2) Los casos 21 a 23 se agregaron el mismo día, con las versiones que traen el estilo nuevo y el ícono: en el emulador, en modo claro y oscuro; en el Xiaomi, con las tarjetas del reloj con datos reales y actualizando encima de la versión anterior.

### 1.4 Verificación de privacidad del APK

Antes de publicar un APK, desde la raíz del repositorio en PowerShell:

```powershell
$bt = "$env:ANDROID_HOME\build-tools\36.0.0"
$apk = "android\app\build\outputs\apk\release\app-release.apk"

# 1. Permisos: solo los 3 de salud (y el interno de androidx). Nunca INTERNET.
& "$bt\aapt2.exe" dump permissions $apk

# 2. Firma: la huella SHA-256 debe ser la publicada en el README.
& "$bt\apksigner.bat" verify --print-certs $apk

# 3. Sin copia a la nube, WebView sin estadísticas ni Safe Browsing, y un solo ícono.
& "$bt\aapt2.exe" dump xmltree $apk --file AndroidManifest.xml |
  Select-String "allowBackup|dataExtractionRules|MetricsOptOut|EnableSafeBrowsing|LAUNCHER" -Context 0,1

# 4. Logs mientras se recorre la checklist: solo estados, nunca valores de salud.
adb logcat -s Bridge WatchTest
```

Resultado esperado: `READ_HEART_RATE`, `READ_RESTING_HEART_RATE` y `READ_SLEEP` como únicos permisos de salud; la huella del README; `allowBackup=false`, `dataExtractionRules`, `MetricsOptOut=true` y `EnableSafeBrowsing=false`; un solo `LAUNCHER`. Verificado el 4 de noviembre de 2026.

---

## 2. Arquitectura de Pruebas (Privacy-First)

```
┌────────────────────────────┐
│    E2E Tests (Playwright)  │  Flujos críticos (Onboarding,
│                            │  Registro, Exportación)
└─────────────┬──────────────┘
              │
┌─────────────▼──────────────┐
│  Unit Tests (Vitest)       │  Lógica de negocio pura:
│                            │  - Cálculo de Rachas (streak.ts)
│                            │  - Utilidades de Calendario (dates.ts)
│                            │  - Validación de Respaldo JSON
└────────────────────────────┘
```

### 2.1 Stack Tecnológico de Pruebas

- **Tests Unitarios y de Lógica:** Vitest (nativo con Vite, rápido y sin overhead de configuración).
- **Tests E2E / UI:** Playwright (para simular el comportamiento del usuario en la PWA y validar la persistencia en IndexedDB).
- **Linter y Calidad Estática:** oxlint y TypeScript (`tsc -b`).
- **Tests Unitarios de la App Android:** JUnit 4 en la JVM (`testDebugUnitTest`), sin teléfono ni emulador. `org.json` se usa solo en las pruebas y no entra al APK.
- **Linter de Android:** Android Lint (`lintDebug`).

### 2.2 Pruebas Unitarias de la App Android

69 pruebas en `android/app/src/test/`, para la lógica pura del envoltorio Kotlin:

| Carpeta | Qué cubre |
|---|---|
| `health/` | Pulso del día sin muestras repetidas, horas de sueño sin sesiones repetidas ni tramos despierto, límites del día en hora local (incluido el cambio de hora de Chile) y los únicos 3 permisos de Health Connect que pide la app |
| `bridge/` | Mensajes del puente entre la PWA y Android (válidos, otra versión, tipo desconocido, JSON roto, datos inválidos) y el paso de los datos del reloj al registro |
| `backup/` | Nombre seguro de la copia al restaurar un respaldo (nunca sale de la caché) y el límite de tamaño |
| `web/` | Qué se abre dentro del WebView (solo la PWA empaquetada), qué enlaces salen de la app (solo `tel:`, `mailto:` y `https:`) y que el enlace a la Política sea el mismo que usa la PWA |

Se corren desde `android\` con `.\gradlew.bat testDebugUnitTest`; no necesitan la PWA compilada. Lo que depende del teléfono (el WebView, Health Connect real, "Guardar como" y el selector de archivos) se cubre con la checklist manual (§1.3).

---

## 3. Roadmap de Implementación

### Semana 1: Configuración de Vitest y Pruebas Unitarias de Lógica

Instalación y scripts en `package.json`:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

Automatización inicial: tests unitarios en `src/lib/__tests__/` para validar el cálculo de rachas ante saltos de días, zonas horarias y múltiples sustancias.

### Semana 2: Pruebas de Validación de Respaldo

Automatizar pruebas unitarias que verifiquen que la función de importación rechaza archivos JSON corruptos, con estructuras alteradas o maliciosas, protegiendo la base de datos Dexie.js de estados inconsistentes.

### Semana 3: Pruebas E2E con Playwright (Flujos de Interfaz)

Configurar `playwright.config.ts` apuntando al servidor local (`http://localhost:5173`).

Automatizar el flujo del tour de bienvenida, la aceptación de Política y Términos, la creación de un registro diario y la activación de la pantalla de privacidad ("Ojo Tachado").

### App Android

- **Hecho:** pruebas unitarias de la lógica Kotlin (§2.2) y checklist manual en el teléfono y el emulador (§1.3).
- **Hecho:** GitHub Actions corre en cada PR las pruebas de Android y las de la PWA (§4.1).
- **En cada versión nueva del APK:** repetir la checklist (§1.3) y la verificación de privacidad (§1.4) antes de publicarla. Los pasos completos para publicar están en [`android/PUBLICAR.md`](android/PUBLICAR.md).

---

## 4. Estrategia CI/CD y Gobernanza del Código

### 4.1 Pipeline de GitHub Actions

El pipeline vive en [`.github/workflows/ci.yml`](.github/workflows/ci.yml) y corre en cada PR hacia `main` y en cada cambio en `main`. Tiene dos trabajos independientes:

| Trabajo | Qué corre |
|---|---|
| **Android (pruebas y lint)** | Java 25, `./gradlew testDebugUnitTest` y `./gradlew lintDebug`. No necesita la PWA compilada ni un teléfono. |
| **PWA (lint, pruebas y build)** | Node 24 y pnpm 12, `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm test` y `pnpm build` (que incluye `tsc -b`). |

Reglas de seguridad del pipeline:

- **Solo lectura:** `permissions: contents: read`, y el código se descarga sin guardar credenciales (`persist-credentials: false`).
- **Sin secretos:** no usa ninguno. La llave de firma del APK nunca está en GitHub, y el pipeline no compila ni publica APK.
- **Acciones fijadas por commit:** cada acción apunta a un commit exacto (con su versión en un comentario), elegida con al menos dos semanas desde su publicación.
- **Gradle verificado:** `setup-gradle` revisa que `gradle-wrapper.jar` sea el oficial antes de ejecutarlo, y usa la caché `basic` de GitHub Actions.
- **PRs de forks:** GitHub pide aprobar la ejecución en PRs de personas nuevas. Antes de tocar «Approve and run», revisa qué cambia el PR, sobre todo en `.github/`, `android/gradle/` y `package.json`.

### 4.2 Gobernanza y Privacidad en el Repositorio

- **Cero Secretos:** Al no haber backend ni credenciales de base de datos en la PWA, se elimina el riesgo de filtración de API keys en el código fuente.
- **Control de Recursos de Terceros:** Cualquier PR que intente introducir un enlace a CDNs externas o fuentes de Google será rechazado por la política de revisión y verificado por las reglas de CSP en `vercel.json`.
- **Commits y Coautoría:** Mantener el estándar indicado en `CONTRIBUTING.md`, respetando el formato de coautoría si se trabaja en conjunto.
