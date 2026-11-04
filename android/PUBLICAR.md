# Publicar una versión de la app Android

Guía paso a paso para sacar una versión nueva del APK y publicarla en GitHub Releases. Está pensada para Windows con PowerShell, que es donde se compila la app.

> **Nunca** subas a GitHub la llave de firma (`.jks`) ni `android/keystore.properties`. Los dos están en `.gitignore`, pero revisa `git status` antes de cada commit.

## Antes de empezar

- Todo lo que va en la versión ya está mergeado en `main`, y el CI de `main` está en verde.
- Tienes la llave de firma y `android/keystore.properties` en tu PC. El archivo tiene esta forma (los valores son de ejemplo):

  ```properties
  storeFile=C:/ruta/fuera/del/repo/llave.jks
  storePassword=…
  keyAlias=…
  keyPassword=…
  ```

  Sin ese archivo, la versión release sale **sin firmar** y no sirve para publicar.

- **Si pierdes la llave, no hay forma de publicar una actualización:** quien tenga la app tendría que desinstalarla, y perdería sus datos. Guárdala en dos lugares fuera del repo.

## 1. Subir el número de versión (PR)

En `android/app/build.gradle.kts`:

- `versionCode`: súmale 1 (por ejemplo, de `2` a `3`). Si no sube, Android no instala la versión nueva encima de la anterior.
- `versionName`: el número que ve la persona (por ejemplo, `0.3.0`).

Haz el PR, espera el CI y mergéalo.

## 2. Compilar desde `main` limpio

```powershell
git switch main; git pull
git status            # tiene que decir "nothing to commit, working tree clean"
pnpm build:android; pnpm copy:android
cd android
.\gradlew.bat testDebugUnitTest
.\gradlew.bat assembleRelease
```

El APK queda en `android\app\build\outputs\apk\release\app-release.apk`.

Revisa que `android\app\src\main\assets\www\version.json` tenga el commit de `main` **sin** `-dirty`. Si dice `-dirty`, había cambios sin commit: no lo publiques.

## 3. Revisar la privacidad del APK

Sigue la sección 1.4 de [`TEST_PLAN.md`](../TEST_PLAN.md#14-verificación-de-privacidad-del-apk). En corto, tiene que pasar todo esto:

- solo los 3 permisos de salud y el interno de androidx, **nunca** `INTERNET`;
- la huella SHA-256 de la firma es la del [README](../README.md#app-android);
- `allowBackup=false`, `dataExtractionRules`, `MetricsOptOut=true`, `EnableSafeBrowsing=false` y un solo ícono en el lanzador;
- el `versionCode` y el `versionName` nuevos.

## 4. Probar antes de publicar

1. **La actualización real:** en el emulador, instala el APK de la versión anterior que está en GitHub Releases, crea algunos datos de prueba y después instala el nuevo **encima**, con `adb install -r`. Los datos tienen que seguir ahí.
2. **La checklist** de la sección 1.3 de `TEST_PLAN.md`, en un teléfono real, con `adb logcat` abierto. No deben aparecer datos de salud en los logs.
3. Anota los resultados en `TEST_PLAN.md` en un PR aparte. Si aparece un error, se corrige antes de publicar.

## 5. Preparar los archivos

Desde la raíz del repo (cambia `0.2.0` por la versión):

```powershell
$v = "0.2.0"
$destino = "$env:USERPROFILE\Documents\ProgresoSobrio-releases"
Copy-Item android\app\build\outputs\apk\release\app-release.apk "$destino\ps-$v.apk"
$hash = (Get-FileHash "$destino\ps-$v.apk" -Algorithm SHA256).Hash.ToLower()
"$hash  ps-$v.apk" | Out-File -Encoding ascii "$destino\ps-$v.apk.sha256"
$hash
```

- El archivo se llama `ps-X.Y.Z.apk` y no lleva el nombre completo de la app: queda guardado en Descargas del teléfono de quien lo baja (igual que los respaldos `ps-…`).
- Guarda esa carpeta: es tu copia de cada versión publicada.

## 6. Crear la Release en GitHub

En la web del repo: **Releases** → **Draft a new release**.

| Campo | Qué poner |
|---|---|
| **Choose a tag** | `android-vX.Y.Z` → **Create new tag**, con destino (*Target*) **main** |
| **Release title** | `App Android X.Y.Z` |
| **Descripción** | Las notas: qué cambió, en palabras simples. Termina con la huella SHA-256 del archivo y cómo verificarla |
| **Attach binaries** | `ps-X.Y.Z.apk` y `ps-X.Y.Z.apk.sha256` |
| **Set as the latest release** | Marcado |

Toca **Publish release**.

## 7. Comprobar lo publicado

Descarga el APK desde la Release, en otra carpeta, y compara su huella con la que guardaste:

```powershell
(Get-FileHash "$env:USERPROFILE\Downloads\ps-$v.apk" -Algorithm SHA256).Hash.ToLower()
```

Si no coinciden, borra la Release y vuelve a subir el archivo.

## Lo que nunca se hace

- Publicar sin subir `versionCode`.
- Publicar un APK compilado con cambios sin commit (`-dirty`).
- Publicar un APK firmado con otra llave: no se instala encima del oficial.
- Subir la llave, `keystore.properties` o sus contraseñas a GitHub, a un chat o a la nube.
