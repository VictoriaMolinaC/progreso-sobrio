# Decisiones de producto y diseño

Lo que ya está decidido para la app (PWA) y el sitio. Léelo antes de tocar la interfaz, los colores o los textos legales.

- Si dos decisiones chocan, vale la más reciente, que es la que está aquí.
- Si una tarea contradice este archivo, se conversa antes de hacerla y, si cambia algo, se actualiza aquí en el mismo PR.
- Lo marcado como **(pendiente)** está decidido pero todavía no está hecho; el orden está en «Para después».

## 1. Identidad visual

### Sistema

- La app toma el sistema «Diario con bruma» del sitio. La fuente de verdad es el bloque `:root` de `sitio/estilos.css`; los tokens están listados en `diseno/tokens.md` y los componentes en `diseno/componentes.html`.
- En la app, los tokens viven en el `@theme` de `src/index.css`, con nombres en inglés (`base`, `ink`, `primary`…). Cada token que tiene par en el sitio usa el mismo valor.
- **Sin hex sueltos nuevos.** Los colores salen de los tokens. Si hace falta un color que no existe, primero se agrega como token (con su contraste medido) y se anota aquí.

### Paleta

| Token de la app | Sitio | Claro | Oscuro | Uso |
|---|---|---|---|---|
| `base` / `base-dark` | `--crema` | `#faf6f0` | `#221e1a` | Fondo |
| `card` | `--tarjeta` | `#fffcf7` | `ink-dark` al 5 % | Tarjetas |
| `mist` | `--bruma` | `#dae2d8` | `primary` al 25 % | Parte alta del degradado del fondo |
| `line` | `--linea` | `#e6ddd1` | `ink-dark` al 10 % | Bordes finos y separadores |
| `ink` / `ink-dark` | `--tinta` | `#3e3a36` | `#f5efe6` | Texto principal |
| `ink-soft` / `ink-soft-dark` | `--tinta-suave` | `#655d56` | `#b3ada6` | Texto secundario |
| `primary` | `--salvia` | `#5b9279` | | Íconos, bordes, rellenos y gráficas |
| `primary-button` | `--salvia-boton` | `#467a62` | | Botón principal con texto blanco |
| `primary-text` / `primary-text-dark` | `--salvia-texto` | `#3d6a54` | `#8fc1a6` | Enlaces, texto salvia y anillo de foco |
| `primary-soft` | `--salvia-suave` | `#e6eee8` | `primary` al 15 % | Fondos suaves salvia |
| `secondary` | `--terracota` | `#c97c5d` | | Botón flotante, bordes cálidos |
| `secondary-text` / `secondary-text-dark` | `--terracota-texto` | `#8c5339` | `#e0a083` | Cejas y texto terracota |
| `secondary-soft` | `--terracota-suave` | `#f7ebe4` | `secondary` al 15 % | Aviso cálido, tarjeta de la línea 1412 |
| `accent` | `--ambar` | `#e6a756` | | Punto de la manchita, «Ir a Ajustes» |
| `blob-sage`, `blob-peach`, `blob-honey` | `--mancha-*` | `#cbd9cd`, `#f4e2d7`, `#f6e6c9` | `primary`, `secondary` y `accent` al 15 % | Manchas, burbujas y cintas (solo decoración) |
| `success` / `success-text` | | `#7fb069` / `#44702f` | | Logros («Guardado ✓») |
| `warning` / `warning-text` / `warning-button` | | `#d96c5f` / `#a8473b` | | Solo acciones que borran o reemplazan datos |

Reglas de color:

- Los colores base (`primary`, `secondary`, `accent`, `success`, `warning`) no llegan a 4,5:1 como texto: quedan para íconos, bordes y rellenos. Para texto se usan los tokens `-text`.
- Nada de rojo de alarma: lo cálido es terracota. El coral (`warning`) solo marca acciones que borran o reemplazan datos.
- Las manchas nunca van detrás de texto.
- Las gráficas van todas en salvia (`primary`): las series ya se distinguen por su título, y el ámbar no llega a 3:1 sobre el fondo.

### Marca y encabezado

- Ícono: la **manchita** (salvia con un punto ámbar), en la app y en el sitio. **(pendiente** como ícono instalado y favicon: hoy es la llama.**)** Descartados: el favicon actual del sitio y las letras «ps».
- Encabezado de la app: ☰ a la izquierda, la manchita al centro, y el ojo 👁 y el tema 🌙 a la derecha. El encabezado no dice «Progreso Sobrio».
- Cada pantalla muestra su nombre como título: una ceja terracota arriba y el nombre en un título liviano.
- La app instalada se llama **«PS»** y no muestra «Progreso Sobrio». **(pendiente)**

### Estilo

- Fondo: degradado de la bruma a la crema, solo arriba (como el sitio y la puerta de edad).
- Títulos livianos (peso 300, nunca bajo 28 px) con cejas terracota (13 px, peso 600, mayúsculas).
- Tarjetas de papel (`card`) con borde fino (`line`) y sombra suave; algunas con cinta decorativa.
- Botones píldora. El principal es salvia con texto blanco; el secundario, papel con borde salvia.
- Botón flotante de la red de apoyo: terracota con corazón, en todas las pantallas.
- Historial en tarjetas, con lápiz (editar) y basurero (borrar).
- Ningún botón se corta en dos líneas: si el texto no cabe, el botón ocupa todo el ancho.
- Anillo de foco visible: 3 px salvia (`primary-text`) con 3 px de separación, como el sitio.

### Tipografía

- Fuente del sistema: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- Figtree (la del sitio) queda descartada en la app para no tocar la CSP de `vercel.json`. Ver «Para después».

### Textos

- Tuteo chileno en todo (app, sitio, documentos): «puedes», «anota», «revisa». Nunca voseo («podés», «anotá»).
- **«Ansias»** en vez de «craving» en todos los textos visibles, con la guía «1 = nada · 5 = muchas» bajo la escala. Descartado: «Comodidad», porque invierte la escala (5 sería bueno) y los registros guardados y «Qué te ayuda» se leerían al revés.

## 2. Excepciones

Reglas de arriba que se rompen a propósito:

- **«Ir a Ajustes»** (aviso de datos de ejemplo en Inicio): píldora ámbar (`accent`) con texto tinta. Tiene que llamar la atención sin alarmar, porque el aviso pasaba desapercibido. Ni rojo ni coral. El ámbar con texto blanco no pasa contraste; con tinta, sí (5,4:1).
- **Campo `craving`**: el texto visible dice «Ansias», pero el campo de Dexie/IndexedDB, la clave del respaldo `.json` y la columna del `.csv` siguen llamándose `craving`. Cambiarlos rompería los datos guardados y la restauración de respaldos.
- **Línea 1412 de SENDA**: su nombre, número (1412), descripción y los lugares donde aparece (puerta de edad, términos, botón flotante con corazón y tour de bienvenida) no se cambian. Solo toma el estilo del sitio (aviso cálido terracota).
- **Menor de edad**: la pantalla no tiene «Volver». Queda guardado y muestra la tarjeta de la línea 1412.

## 3. Legal (Ley 21.719)

- La ley rige desde el **1 de diciembre de 2026**. La Política de privacidad y los Términos de uso **v1.0** están publicados en progresosobrio.cl.
- **No se cambia el texto legal.** Si algún día cambia de forma importante: se sube la versión en el sitio y en `LEGAL` (`src/lib/constants.ts`), se agrega la fila al historial de versiones, y la app vuelve a pedir que se acepte.
- Aceptación: una casilla («Leí la Política de privacidad y acepto los Términos de uso.») y «Continuar», que se activa solo al marcarla. Se vuelve a pedir si cambia la versión.
- Ajustes → «Privacidad y términos»: muestra la fecha de aceptación y los enlaces. Va entre Android y «Borrar todos mis datos».
- Antes de exportar, la app avisa: «Este archivo va a tener tus datos de salud…».
- Nada de lo planificado obliga a cambiar el texto legal:
  - la manchita y el nombre «PS» no contradicen los términos;
  - «tapar la app al salir» es una preferencia guardada en el dispositivo;
  - los nombres `ps-…` caben, porque la política solo menciona «.json» y «.csv».
- La política **no** menciona el ojo: hacerlo obligaría a pasar a v1.1 y a que todos acepten de nuevo.
- **Nunca** Vercel Analytics ni recursos de terceros (fuentes, scripts, imágenes). La CSP solo permite `'self'`.

## 4. Para después

Orden de trabajo acordado (PWA primero, Android al final):

1. «Ansias» y guardar con al menos un dato.
2. Ojo tachado: tapa toda la app; en Ajustes, opción de taparla al salir.
3. Estilos base: colores, encabezado, fondo bruma, títulos de pantalla.
4. Inicio, Red de apoyo y Términos.
5. Registro.
6. Progreso: historial, calendario, gráficas en salvia y «Qué te ayuda».
7. **Discreción**: la manchita como ícono instalado y favicon (app y sitio); nombre «PS» (`name`, `short_name` y `<title>`); respaldos `ps-AAAA-MM-DD.json` y `ps-AAAA-MM-DD.csv` (el `.json` no lleva el nombre adentro, así que los respaldos viejos se siguen importando).
8. **PIN opcional**, sobre la misma pantalla del ojo, sin librerías: hash con WebCrypto (PBKDF2 con sal), espera tras intentos fallidos; si se olvida, se borra y se restaura un respaldo. Mencionarlo en la política sería la v1.1.
9. **Android 0.2.0**: pantalla nativa «Datos del reloj», `app_name` «PS» e ícono del lanzador, enlace a la política, `FLAG_SECURE` opcional, y probar en el APK el aviso de exportar y los enlaces externos.

Si algún día se quiere Figtree en la app: agregar `font-src 'self'` a la CSP de `vercel.json` y alojar el archivo en la misma app (nunca desde un CDN).

## 5. Principios

- **Seguridad y privacidad primero.** Los datos viven solo en el dispositivo: sin servidor, sin cuentas, sin analítica.
- **Discreción.** Nada en pantalla, en el nombre de la app ni en los nombres de archivo debería delatar de qué se trata a quien mira de reojo.
- **Sin juicios ni diagnósticos.** «Qué te ayuda» describe lo que la persona anotó; no aconseja ni diagnostica.
- **Registrar cuesta poco.** Basta un dato, el que sea, para guardar el día. Descartado: obligar las cuatro escalas o «notas más uno o dos datos».
- **No romper lo guardado.** No se renombran campos de Dexie/IndexedDB, claves del respaldo `.json` ni columnas del `.csv`, y los respaldos antiguos se siguen importando.
- **Accesible.** WCAG AA: 4,5:1 para texto, 3:1 para íconos y gráficas, áreas de toque de 44 px, y axe sin fallas en claro y en oscuro.
- **Protección por capas.** Primero el ojo; el PIN después y opcional. Descartado: PIN obligatorio al entrar.
