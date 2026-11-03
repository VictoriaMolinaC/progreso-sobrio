# Plan de Pruebas y Estrategia de Automatización QA

**Proyecto:** Progreso Sobrio
**Repositorio:** [VictoriaMolinaC/progreso-sobrio](https://github.com/VictoriaMolinaC/progreso-sobrio)
**Versión del documento:** 1.1.0
**Fecha de creación:** Octubre 2026
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
```

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

---

## 4. Estrategia CI/CD y Gobernanza del Código

### 4.1 Pipeline de GitHub Actions

```yaml
# .github/workflows/ci.yml
name: Progreso Sobrio CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  qa-pipeline:
    name: Lint, Type Check & Unit Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4

      - name: Instalar pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 12

      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24.x'
          cache: 'pnpm'

      - name: Instalar dependencias
        run: pnpm install --frozen-lockfile

      - name: Ejecutar Linter (oxlint)
        run: pnpm lint

      - name: Verificar tipos TypeScript
        run: pnpm exec tsc -b

      - name: Ejecutar tests unitarios con Vitest
        run: pnpm test
```

### 4.2 Gobernanza y Privacidad en el Repositorio

- **Cero Secretos:** Al no haber backend ni credenciales de base de datos en la PWA, se elimina el riesgo de filtración de API keys en el código fuente.
- **Control de Recursos de Terceros:** Cualquier PR que intente introducir un enlace a CDNs externas o fuentes de Google será rechazado por la política de revisión y verificado por las reglas de CSP en `vercel.json`.
- **Commits y Coautoría:** Mantener el estándar indicado en `CONTRIBUTING.md`, respetando el formato de coautoría si se trabaja en conjunto.
