# Tokens de Progreso Sobrio · sistema «Diario con bruma»

La fuente de verdad es el bloque `:root` de `estilos.css`. Esta lista sirve para llevar los mismos valores a la app (PWA con Tailwind y app Android con Compose).

## Color

| Token | Hex | Uso |
|---|---|---|
| `--crema` | `#faf6f0` | Fondo general |
| `--tarjeta` | `#fffcf7` | Tarjetas, aviso suave, botón secundario |
| `--superficie` | `#f3ede4` | Franja «Qué hace», fichas de las páginas legales |
| `--bruma` | `#dae2d8` | Parte alta del degradado (`--bruma` → `--crema` en 36rem), como la puerta de edad de la app |
| `--linea` | `#e6ddd1` | Bordes finos y separadores |
| `--tinta` | `#3e3a36` | Texto principal y titulares |
| `--tinta-suave` | `#655d56` | Texto secundario (antes `#6e665e`) |
| `--salvia-texto` | `#3d6a54` | Enlaces, acentos de texto y anillo de foco (antes `#42725b`) |
| `--terracota-texto` | `#8c5339` | Cejas y etiquetas (antes `#965a40`) |
| `--salvia` | `#5b9279` | Íconos, bordes y rellenos decorativos |
| `--salvia-boton` | `#467a62` | Botón principal con texto blanco (antes `#4a7f66`) |
| `--salvia-suave` | `#e6eee8` | Modo avión, franja de centros, «En corto» |
| `--terracota` | `#c97c5d` | Borde del aviso cálido |
| `--terracota-suave` | `#f7ebe4` | Aviso cálido, línea 1412, etiqueta «Android» |
| `--ambar` | `#e6a756` | Punto de la manchita |
| `--mancha-salvia` | `#cbd9cd` | Manchas, burbujas y cintas (solo decoración) |
| `--mancha-durazno` | `#f4e2d7` | Manchas, burbujas y cintas (solo decoración) |
| `--mancha-miel` | `#f6e6c9` | Manchas, burbujas y cintas (solo decoración) |
| `--foco` | `#3d6a54` | Contorno de foco de 3 px con 3 px de separación |

Reglas:
- Los cuatro colores de texto (`--tinta`, `--tinta-suave`, `--salvia-texto`, `--terracota-texto`) pasan 4,5:1 sobre todos los fondos de la tabla, incluso sobre `--bruma`.
- Las manchas nunca van detrás de texto.
- Nada de rojo de alarma: lo cálido es terracota.

## Tipografía

- Familia: **Figtree** (SIL OFL 1.1), un solo archivo variable `fuentes/figtree.woff2` con pesos 300 a 600 (18 KB, solo caracteres latinos, incluye tildes, ñ, ¿ y ¡).
- Respaldo: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`, con `font-display: swap`.
- Pesos: 300 para titulares, 400 para texto, 600 para subtítulos, botones y énfasis.
- Regla: **el peso 300 nunca baja de 28 px.**

| Token | Tamaño | Peso | Uso |
|---|---|---|---|
| `--t-portada` | `clamp(2.125rem, 1.6rem + 2.2vw, 3rem)` · 34 → 48 px | 300 | Titular de la portada |
| `--t-titulo` | `clamp(1.75rem, 1.5rem + 1.1vw, 2.375rem)` · 28 → 38 px | 300 | Títulos de sección |
| `--t-subtitulo` | `1.125rem` · 18 px | 600 | Títulos de tarjeta |
| `--t-bajada` | `clamp(1.0625rem, 1rem + .3vw, 1.1875rem)` · 17 → 19 px | 400 | Bajadas |
| `--t-texto` | `1rem` · 16 px | 400 | Texto corrido |
| `--t-chico` | `.9375rem` · 15 px | 400 | Descripciones, pie |
| `--t-mini` | `.8125rem` · 13 px | 600 | Cejas y etiquetas (siempre en 600 y mayúsculas) |
| `--interlineado` | `1.65` | | Texto corrido; titulares a 1.2 |

## Espacios (escala de 4 px)

| Token | Valor |
|---|---|
| `--e-1` | 0.25rem · 4 px |
| `--e-2` | 0.5rem · 8 px |
| `--e-3` | 0.75rem · 12 px |
| `--e-4` | 1rem · 16 px |
| `--e-5` | 1.5rem · 24 px |
| `--e-6` | 2rem · 32 px |
| `--e-7` | 3rem · 48 px |
| `--e-8` | 4rem · 64 px |
| `--e-9` | 6rem · 96 px |

Además: `--toque: 44px` (alto mínimo de todo lo que se toca) y `--ancho: 68rem` (ancho máximo del contenido). Secciones: `clamp(3.5rem, 2.5rem + 4vw, 6rem)` arriba y abajo.

## Radios

| Token | Valor | Uso |
|---|---|---|
| `--r-chico` | 10px | Enlaces del menú, chips |
| `--r` | 16px | Tarjetas y franjas |
| `--r-grande` | 24px | Reservado para bloques grandes |
| `--r-pastilla` | 999px | Botones y etiquetas |
| `--r-cinta` | `4px 16px 16px 4px` | Aviso suave con borde de cinta a la izquierda |
| `--r-mancha` | `46% 54% 52% 48% / 52% 46% 54% 48%` | Burbujas de íconos con forma de manchita |

## Sombras

| Token | Valor |
|---|---|
| `--sombra` | `0 1px 2px rgba(62,58,54,.04), 0 4px 16px rgba(62,58,54,.06)` |
| `--sombra-alta` | `0 2px 4px rgba(62,58,54,.05), 0 12px 32px rgba(62,58,54,.10)` |
| `--sombra-telefono` | `0 20px 40px rgba(62,58,54,.16)` |

## Para la PWA (Tailwind)

Tailwind 4, en el CSS principal:

```css
@theme {
  --color-crema: #faf6f0;
  --color-tarjeta: #fffcf7;
  --color-superficie: #f3ede4;
  --color-bruma: #dae2d8;
  --color-linea: #e6ddd1;
  --color-tinta: #3e3a36;
  --color-tinta-suave: #655d56;
  --color-salvia-texto: #3d6a54;
  --color-terracota-texto: #8c5339;
  --color-salvia: #5b9279;
  --color-salvia-boton: #467a62;
  --color-salvia-suave: #e6eee8;
  --color-terracota: #c97c5d;
  --color-terracota-suave: #f7ebe4;
  --color-ambar: #e6a756;
  --font-sans: "Figtree", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius-tarjeta: 16px;
  --shadow-suave: 0 1px 2px rgba(62,58,54,.04), 0 4px 16px rgba(62,58,54,.06);
}
```

Tailwind 3, en `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      crema: '#faf6f0', tarjeta: '#fffcf7', superficie: '#f3ede4', bruma: '#dae2d8', linea: '#e6ddd1',
      tinta: { DEFAULT: '#3e3a36', suave: '#655d56' },
      salvia: { DEFAULT: '#5b9279', texto: '#3d6a54', boton: '#467a62', suave: '#e6eee8' },
      terracota: { DEFAULT: '#c97c5d', texto: '#8c5339', suave: '#f7ebe4' },
      ambar: '#e6a756',
    },
    fontFamily: { sans: ['Figtree', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'] },
    borderRadius: { tarjeta: '16px' },
    boxShadow: { suave: '0 1px 2px rgba(62,58,54,.04), 0 4px 16px rgba(62,58,54,.06)' },
  },
},
```

## Para la app Android (Jetpack Compose)

```kotlin
object PsColor {
    val Crema = Color(0xFFFAF6F0)
    val Tarjeta = Color(0xFFFFFCF7)
    val Superficie = Color(0xFFF3EDE4)
    val Bruma = Color(0xFFDAE2D8)
    val Linea = Color(0xFFE6DDD1)
    val Tinta = Color(0xFF3E3A36)
    val TintaSuave = Color(0xFF655D56)
    val SalviaTexto = Color(0xFF3D6A54)
    val TerracotaTexto = Color(0xFF8C5339)
    val Salvia = Color(0xFF5B9279)
    val SalviaBoton = Color(0xFF467A62)
    val SalviaSuave = Color(0xFFE6EEE8)
    val Terracota = Color(0xFFC97C5D)
    val TerracotaSuave = Color(0xFFF7EBE4)
    val Ambar = Color(0xFFE6A756)
}
```

Android no lee woff2: para usar Figtree en la app hay que agregar el archivo .ttf variable de Figtree (misma licencia OFL) en `res/font`.
