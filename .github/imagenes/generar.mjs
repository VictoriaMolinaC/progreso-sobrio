// Convierte las plantillas HTML de esta carpeta en las imágenes del README, con un navegador sin
// ventana (Edge en Windows, Chrome o Chromium en Linux/macOS). Node puro, sin dependencias.
// Uso, desde la raíz del repo:  node .github/imagenes/generar.mjs
// Para usar otro navegador:     NAVEGADOR=/ruta/al/navegador node .github/imagenes/generar.mjs
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));

// plantilla → imagen final (relativa a esta carpeta) y tamaño exacto en píxeles
const imagenes = [
  { plantilla: 'banner.html', salida: '../banner.png', ancho: 1280, alto: 640 },
  { plantilla: '01-primera-vez.html', salida: '../screenshots/capturas-primera-vez.png', ancho: 1600, alto: 1076 },
  { plantilla: '02-dia-a-dia.html', salida: '../screenshots/capturas-dia-a-dia.png', ancho: 1600, alto: 1076 },
  { plantilla: '03-modo-oscuro.html', salida: '../screenshots/capturas-modo-oscuro.png', ancho: 1600, alto: 1124 },
  { plantilla: '04-app-android.html', salida: '../screenshots/capturas-app-android.png', ancho: 1600, alto: 1076 },
  { plantilla: 'modo-avion.html', salida: '../screenshots/modo-avion.png', ancho: 460, alto: 995 },
];

function buscarNavegador() {
  if (process.env.NAVEGADOR) return process.env.NAVEGADOR;
  const candidatos = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/microsoft-edge',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  const encontrado = candidatos.find((ruta) => existsSync(ruta));
  if (!encontrado) {
    throw new Error('No encontré Edge, Chrome ni Chromium. Indica la ruta con la variable NAVEGADOR.');
  }
  return encontrado;
}

const navegador = buscarNavegador();
// Perfil temporal y vacío: no toca el perfil ni las sesiones del navegador de la persona.
const perfil = mkdtempSync(join(tmpdir(), 'progreso-imagenes-'));

try {
  for (const { plantilla, salida, ancho, alto } of imagenes) {
    const destino = join(aqui, salida);
    execFileSync(navegador, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--force-device-scale-factor=1',
      '--virtual-time-budget=5000', // da tiempo a cargar fuentes e imágenes
      `--user-data-dir=${perfil}`,
      `--window-size=${ancho},${alto}`,
      `--screenshot=${destino}`,
      pathToFileURL(join(aqui, plantilla)).href,
    ], { stdio: 'ignore' });
    console.log(`${plantilla} → ${salida.replace('../', '.github/')} (${ancho}×${alto})`);
  }
} finally {
  rmSync(perfil, { recursive: true, force: true });
}
