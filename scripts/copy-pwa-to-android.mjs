// Copia la PWA compilada para Android (dist-android/) a los assets del APK
// y escribe version.json. Node puro, sin dependencias: corre igual en Windows y Linux.
//
// Uso, desde la raíz del repo: pnpm build:android && pnpm copy:android

import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Rutas calculadas desde este archivo, no desde la carpeta donde se ejecuta.
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'dist-android')
const target = join(root, 'android', 'app', 'src', 'main', 'assets', 'www')

if (!existsSync(join(source, 'index.html'))) {
  console.error('Falta dist-android/index.html. Corre primero: pnpm build:android')
  process.exit(1)
}

// Se borra la copia anterior para no dejar archivos viejos dentro del APK.
rmSync(target, { recursive: true, force: true })
mkdirSync(target, { recursive: true })
cpSync(source, target, { recursive: true })

// Commit del que salió el build: "-dirty" si había cambios sin commitear; "unknown" si no hay git.
function gitCommit() {
  try {
    const run = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
    const hash = run(['rev-parse', '--short', 'HEAD'])
    const dirty = run(['status', '--porcelain']) !== ''
    return dirty ? `${hash}-dirty` : hash
  } catch {
    return 'unknown'
  }
}

const version = { commit: gitCommit(), builtAt: new Date().toISOString() }
writeFileSync(join(target, 'version.json'), JSON.stringify(version, null, 2) + '\n')

console.log(`PWA copiada a android/app/src/main/assets/www (commit ${version.commit})`)
