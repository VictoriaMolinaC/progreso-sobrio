# Progreso Sobrio

Acompaña el día a día de una persona en proceso de abstinencia de sustancias, sin juzgar, sin dar diagnósticos, un día a la vez.

> Progreso Sobrio es para personas mayores de 18 años y no reemplaza atención médica ni psicológica profesional. Si estás en crisis, comunícate con la línea **1412** de SENDA (Chile), gratuita y confidencial las 24 horas.

**Demo:** [progreso-sobrio.vercel.app](https://progreso-sobrio.vercel.app) — al abrirla por primera vez ves datos de ejemplo, para que puedas explorar la app antes de cargar los tuyos.

## Privacidad primero

- **100% offline** una vez cargada, funciona sin conexión a internet.
- **Sin backend, sin servidor externo.** Todos los datos se guardan solo en tu navegador (IndexedDB).
- **Sin analytics, sin llamadas de red con tus datos.** Nada sale de tu dispositivo.
- Tus datos son tuyos: puedes exportarlos e importarlos cuando quieras.

## Qué hace

- **Tour de bienvenida**, una sola vez, antes de entrar por primera vez: te explica en 4 tarjetas cortas dónde está el registro diario, dónde ver tu progreso, y que tu red de apoyo está siempre a un toque en el ícono de corazón.
- **Racha de sobriedad** por sustancia, lo primero que ves al abrir la app, y puedes tener varias en paralelo.
- **Registro diario en menos de 30 segundos**: LPM (latidos por minuto) en reposo, craving, sueño, actividad física, energía, ánimo, hábitos cumplidos, disparadores y notas.
- **Historial** en tabla y calendario, editable.
- **Gráficas** de LPM en reposo, sueño y actividad a lo largo del tiempo.
- **Panel "Qué te ayuda"**: correlaciones simples en lenguaje llano, nunca un diagnóstico.
- **Rachas de cumplimiento por hábito.**
- **Exportar e importar** todos tus datos en JSON y CSV.
- **Red de apoyo** siempre a un toque: tus propios contactos + la línea 1412 de SENDA.

## Por qué existe

No encontramos una app chilena dedicada a esto. Lo más cercano es la línea/chat 1412 de SENDA y "PlanSobrio", una app de encuentro social para gente sobria en Latinoamérica, pero con otro propósito (no es un tracker diario).

Progreso Sobrio se diferencia por ser open source, una PWA instalable que funciona sin conexión, con profundidad real de correlación entre LPM, sueño, craving y ánimo, soporte para varias sustancias en paralelo, e integración directa con la red de apoyo chilena.

## Capturas

Recorrido de 30 segundos por la app: puerta de edad, paneles, registros y gráficas.

https://github.com/user-attachments/assets/80c0d663-ca59-4575-95fd-866ea09e65de


Lo primero al abrir: confirmar mayoría de edad. A quien declara ser menor de edad se le muestra la línea 1412.

<p align="center">
<img src=".github/screenshots/puerta-edad.png" width="240" alt="Pantalla de confirmación de mayoría de edad, modo claro">
<img src=".github/screenshots/puerta-edad-dark.png" width="240" alt="Pantalla de confirmación de mayoría de edad, modo oscuro">
</p>

Después, un tour de 4 tarjetas explica dónde está cada cosa antes de entrar a la app.

<table>
<tr>
<td><img src=".github/screenshots/tour-bienvenida.png" width="240" alt="Tour de bienvenida, primera tarjeta"></td>
<td><img src=".github/screenshots/tour-registro.png" width="240" alt="Tour de bienvenida, tarjeta de registro diario"></td>
</tr>
<tr>
<td><img src=".github/screenshots/tour-progreso.png" width="240" alt="Tour de bienvenida, tarjeta de progreso"></td>
<td><img src=".github/screenshots/tour-apoyo.png" width="240" alt="Tour de bienvenida, tarjeta de red de apoyo"></td>
</tr>
</table>

<table>
<tr>
<td><img src=".github/screenshots/inicio.png" width="240" alt="Pantalla de inicio con la racha de sobriedad"></td>
<td><img src=".github/screenshots/registro-diario.png" width="240" alt="Formulario de registro diario"></td>
<td><img src=".github/screenshots/graficas.png" width="240" alt="Gráficas de LPM, sueño y actividad"></td>
</tr>
<tr>
<td><img src=".github/screenshots/calendario.png" width="240" alt="Calendario con los días registrados"></td>
<td><img src=".github/screenshots/red-de-apoyo.png" width="240" alt="Panel de red de apoyo con la línea 1412 de SENDA"></td>
<td><img src=".github/screenshots/habitos-dark.png" width="240" alt="Rachas por hábito, modo oscuro"></td>
</tr>
</table>

## Stack técnico

Vite + React + TypeScript, Tailwind CSS, [Dexie.js](https://dexie.org/) sobre IndexedDB para todo el almacenamiento local, y Recharts para las gráficas. Gestor de paquetes: pnpm.

## Correr el proyecto localmente

```bash
git clone https://github.com/VictoriaMolinaC/progreso-sobrio.git
cd progreso-sobrio
pnpm install
pnpm dev
```

## Cómo contribuir

Lee detalladamente el documento [CONTRIBUTING.md](./CONTRIBUTING.md) para el flujo de trabajo y cómo levantar el entorno.

¿Buscas tu primera contribución open source? Revisa los issues con la etiqueta [`good first issue`](https://github.com/VictoriaMolinaC/progreso-sobrio/issues?q=is%3Aopen+label%3A%22good+first+issue%22).

## Apoyar el proyecto

Si Progreso Sobrio te sirve y puedes aportar, ayudas a sostener el proyecto. Basta con dejar una estrella ⭐ o participar en las [Discusiones](https://github.com/VictoriaMolinaC/progreso-sobrio/discussions).

## Cuéntanos tu experiencia

Si Progreso Sobrio te ayudó, puedes contarlo de forma **completamente anónima** (no pedimos nombre ni correo) en [este formulario](https://docs.google.com/forms/d/e/1FAIpQLSc9oG92I_hm_MhiHEwnJEDB-SFooflUpTM7wKmFU1tYlNSeIQ/viewform). Si prefieres escribir directamente, puedes hacerlo a **contacto.progresosobrio@gmail.com**.

## Autora

Proyecto creado por **Victoria Molina**, desarrolladora full stack en Chile.

[LinkedIn](https://www.linkedin.com/in/victoriamolinac) · [GitHub](https://github.com/VictoriaMolinaC)

## Licencia

[MIT](./LICENSE)
