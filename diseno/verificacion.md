# Verificación de la portada · progresosobrio.cl

Revisado el 20 de octubre de 2026 con Chromium (Playwright) sirviendo los archivos desde un servidor local, con la política de seguridad del sitio activa.

## 1. Contraste de cada par texto/fondo

Umbral WCAG AA: 4,5:1 para texto normal. Para el degradado se midió el peor caso, la parte más oscura (`--bruma`, #dae2d8), aunque el texto cae más abajo, donde el fondo ya es más claro.

| Dónde | Texto | Fondo | Contraste | AA |
|---|---|---|---|---|
| Texto general, titulares | `--tinta` #3e3a36 | `--crema` #faf6f0 | 10,47:1 | Pasa |
| Titular y menú arriba, sobre el degradado (peor caso) | `--tinta` #3e3a36 | `--bruma` #dae2d8 | 8,51:1 | Pasa |
| Títulos y texto en tarjetas | `--tinta` #3e3a36 | `--tarjeta` #fffcf7 | 11,01:1 | Pasa |
| Texto en «Qué hace» | `--tinta` #3e3a36 | `--superficie` #f3ede4 | 9,68:1 | Pasa |
| Modo avión, franja de centros | `--tinta` #3e3a36 | `--salvia-suave` #e6eee8 | 9,53:1 | Pasa |
| Aviso de la línea 1412 | `--tinta` #3e3a36 | `--terracota-suave` #f7ebe4 | 9,64:1 | Pasa |
| Bajadas, pie, datos de la portada | `--tinta-suave` #655d56 | `--crema` #faf6f0 | 6,00:1 | Pasa |
| Enlaces del menú y bajada sobre el degradado (peor caso) | `--tinta-suave` #655d56 | `--bruma` #dae2d8 | 4,87:1 | Pasa |
| Texto secundario en tarjetas y aviso suave | `--tinta-suave` #655d56 | `--tarjeta` #fffcf7 | 6,31:1 | Pasa |
| Descripciones de funciones | `--tinta-suave` #655d56 | `--superficie` #f3ede4 | 5,55:1 | Pasa |
| Texto de la tarjeta de contacto sobre la franja | `--tinta-suave` #655d56 | `--salvia-suave` #e6eee8 | 5,46:1 | Pasa |
| Enlaces | `--salvia-texto` #3d6a54 | `--crema` #faf6f0 | 5,76:1 | Pasa |
| Acento del titular (peor caso) | `--salvia-texto` #3d6a54 | `--bruma` #dae2d8 | 4,68:1 | Pasa |
| Botón secundario, enlaces en tarjetas | `--salvia-texto` #3d6a54 | `--tarjeta` #fffcf7 | 6,06:1 | Pasa |
| Íconos de los checks, «Copiado» | `--salvia-texto` #3d6a54 | `--salvia-suave` #e6eee8 | 5,24:1 | Pasa |
| Cejas («Nuestra promesa»…) | `--terracota-texto` #8c5339 | `--crema` #faf6f0 | 5,72:1 | Pasa |
| Ceja de la portada (peor caso) | `--terracota-texto` #8c5339 | `--bruma` #dae2d8 | 4,65:1 | Pasa |
| Ceja de «Qué hace» | `--terracota-texto` #8c5339 | `--superficie` #f3ede4 | 5,29:1 | Pasa |
| Ceja de «Centros y fundaciones» | `--terracota-texto` #8c5339 | `--salvia-suave` #e6eee8 | 5,21:1 | Pasa |
| Etiqueta «Android», número 1412 | `--terracota-texto` #8c5339 | `--terracota-suave` #f7ebe4 | 5,26:1 | Pasa |
| Botón principal | `--blanco` #ffffff | `--salvia-boton` #467a62 | 4,98:1 | Pasa |
| Botón principal al pasar el cursor | `--blanco` #ffffff | `--salvia-texto` #3d6a54 | 6,20:1 | Pasa |
| Enlace «Saltar al contenido» | `--crema` #faf6f0 | `--tinta` #3e3a36 | 10,47:1 | Pasa |

Otros elementos (no son texto, umbral 3:1):
- Anillo de foco `--foco` #3d6a54, 3 px separado del elemento: 5,76:1 sobre crema, 4,68:1 sobre la bruma y 5,24:1 sobre la franja salvia suave.
- Borde del botón secundario `--salvia` #5b9279 sobre crema: 3,34:1.
- Manchas, cintas y burbujas: decoración, sin texto encima.

axe-core (WCAG 2.2 AA y buenas prácticas): **0 errores** en la portada (a 390 y a 1280 px) y en componentes.html. axe marca el contraste «por revisar» solo porque no sabe medir sobre degradados; esos pares están en la tabla de arriba.

## 2. Peso de la página

| Archivo | Tamaño | Transferido (gzip) | Cuándo se carga |
|---|---|---|---|
| index.html | 20,5 KB | 6,4 KB | Al abrir |
| estilos.css | 24,1 KB | 6,2 KB | Al abrir |
| fuentes/figtree.woff2 | 18,4 KB | 18,3 KB | Al abrir (precargada) |
| img/inicio.webp | 19,4 KB | 19,1 KB | Al abrir |
| favicon.svg | 0,7 KB | 0,4 KB | Al abrir |
| img/datos-reloj.webp | 37,7 KB | 37,7 KB | Diferida: al bajar hasta «Qué hace» |
| copiar-correo.js | (tu archivo actual, sin cambios) | | Al abrir, diferido |

- **Primera carga: unos 50 KB transferidos** (83 KB sin comprimir), sin contar copiar-correo.js.
- **Página completa: unos 88 KB transferidos.**
- Las capturas pasan a WebP con la misma resolución (540 px): 19 KB en vez de 39 KB y 38 KB en vez de 73 KB. Los .jpg quedan como respaldo dentro de `<picture>` para navegadores antiguos.
- Una sola fuente variable (300 a 600) en vez de Lora 600: `fuentes/lora-600.woff2` y su licencia ya no se usan y se pueden borrar.
- Sin desenfoques, sin parallax ni animaciones: solo transiciones de 0,15 s al pasar el cursor, que se desactivan con `prefers-reduced-motion`.

## 3. Nada se carga desde afuera

- Peticiones registradas al abrir y recorrer la portada (a 320, 390, 768 y 1280 px): `index.html`, `estilos.css`, `fuentes/figtree.woff2`, `img/inicio.webp`, `img/datos-reloj.webp` y `copiar-correo.js`. **Todas del mismo sitio.**
- Recursos en el código: `favicon.svg`, `fuentes/figtree.woff2`, `estilos.css`, las imágenes de `img/` y `copiar-correo.js`. No hay Google Fonts, CDN, analítica, píxeles, iframes, videos ni mapas.
- **0 atributos `style` y 0 etiquetas `<style>`** en index.html y componentes.html. La consola no mostró ninguna violación de la política de seguridad.
- Los íconos son SVG en línea (un sprite con `<use href="#…">`), sin archivos remotos.
- Los únicos `https://` del HTML son enlaces que la persona decide abrir (app, GitHub, Google Forms, LinkedIn, política de Google) y `og:image`, una etiqueta para redes sociales que el navegador no descarga.

## 4. Accesibilidad y diseño adaptable

- Sin scroll horizontal a 320, 390, 768 y 1280 px.
- Todo lo que se toca mide al menos 44 px de alto: enlaces del menú, «Menú», botones (52 px), tarjeta del correo (64 px), enlaces del pie, el 1412 y los enlaces dentro del texto de «Transparencia» (con relleno invisible, sin mover las líneas).
- Foco visible en todo, enlace «Saltar al contenido», un solo `h1`, secciones con `aria-labelledby`, textos alternativos en las dos capturas e íconos decorativos ocultos para lectores de pantalla.
- En celular el menú es un `<details>`: funciona sin JavaScript y se anuncia como desplegable.
- El peso 300 solo aparece en titulares de 28 px o más. Lo pequeño (13 a 15 px) va en 400 o 600.
- El botón del correo conserva los `id` de antes (`copy-mail`, `mail`, `copy-hint`, `copy-status`) y el atributo `data-done`, así que tu `copiar-correo.js` funciona sin cambios. Se probó con un script equivalente.

## 5. Páginas legales (privacidad.html y terminos.html)

- Cambió solo el marco: cabecera con la manchita (en vez de la llama y el nombre), enlace «Saltar al contenido», precarga de la fuente y pie con el aviso 1412 con ícono, número para tocar y el nombre del proyecto.
- **El texto legal quedó idéntico:** se comparó línea por línea el título, la versión, el índice y todo el artículo contra los archivos originales, sin ninguna diferencia.
- Su política de seguridad no cambió (sigue sin permitir scripts, y estas páginas no tienen ninguno).
- Peticiones al abrirlas: `estilos.css` y `fuentes/figtree.woff2`, nada más. **0 atributos `style`, 0 etiquetas `<style>`, 0 scripts.**
- Sin scroll horizontal a 320, 390, 768 y 1280 px. Todo lo que se toca mide al menos 44 px, incluidos los enlaces del índice y los que van dentro del texto, sin que sus áreas se pisen.
- axe-core (WCAG 2.2 AA y buenas prácticas): **0 errores** en las dos páginas.
- Los colores de texto son los mismos tokens de la tabla de contraste, así que también pasan AA.

## 6. Pendiente

- El favicon sigue siendo el ícono de la app (la llama); no se cambió.
