# Imágenes del README

Plantillas HTML del banner y de los collages de capturas. No son parte de la app: solo sirven para generar las imágenes de `.github/`.

| Plantilla | Imagen |
|---|---|
| `banner.html` | `.github/banner.png` (1280×640, también sirve como *Social preview* del repo) |
| `01-primera-vez.html` | `.github/screenshots/capturas-primera-vez.png` |
| `02-dia-a-dia.html` | `.github/screenshots/capturas-dia-a-dia.png` |
| `03-modo-oscuro.html` | `.github/screenshots/capturas-modo-oscuro.png` |
| `04-app-android.html` | `.github/screenshots/capturas-app-android.png` |
| `modo-avion.html` | `.github/screenshots/modo-avion.png` |

## Regenerarlas

Desde la raíz del repo:

```bash
node .github/imagenes/generar.mjs
```

Usa Edge (Windows) o Chrome/Chromium (Linux y macOS) sin ventana y con un perfil temporal. Si el navegador está en otra ruta: `NAVEGADOR=/ruta/al/navegador node .github/imagenes/generar.mjs`. Las plantillas no cargan nada de internet.

## Capturas (`capturas/`)

- Pantallas de la app con los **datos de ejemplo**, salvo las `04-*`, que son de un teléfono de prueba con una Xiaomi Smart Band 10 (mediciones de prueba, publicadas con permiso).
- Recortadas sin la barra de estado ni la de navegación (para no mostrar notificaciones) y achicadas a 540 px de ancho. `05-modo-avion` conserva la barra de estado porque muestra el avión.
- Para reemplazar una: toma la captura nueva, recórtala igual y guárdala con el mismo nombre. Antes de publicar, revisa que no muestre datos personales (nombres, teléfonos, notificaciones).

## Fuentes (`fuentes/`)

Lora y Poppins, de Google Fonts, bajo la licencia SIL Open Font License 1.1 (`OFL-Lora.txt`, `OFL-Poppins.txt`). Solo se usan en estas plantillas.
