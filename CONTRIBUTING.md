# Contribuir a Progreso Sobrio

Gracias por querer aportar. Esta guía es simple a propósito: si algo no está cubierto aquí, abre un issue y lo conversamos.

## Qué puedes aportar

No hace falta escribir código para contribuir. Toda ayuda suma:

- **Código:** corregir errores, agregar funciones, mejorar el rendimiento.
- **Documentación:** aclarar el README, mejorar esta guía, corregir textos.
- **Accesibilidad:** hacer la app usable para más personas (contraste, teclado, lectores de pantalla).
- **UX y diseño:** proponer mejoras de interfaz o de la experiencia de uso.
- **Reportar problemas:** abrir un issue contando un error o una idea también es contribuir.

Elijas lo que elijas, el flujo es el mismo: trabajas sobre una rama y abres un Pull Request.

## Flujo de trabajo

1. Haz un fork del repo y crea una rama para tu cambio.
2. Haz el cambio, con commits claros que expliquen el porqué, no solo el qué.
   Si tu cambio agrega un archivo nuevo, usa `git add <archivo>` (o `git add -A`)
   antes de commitear — `git commit -am` solo incluye cambios en archivos que
   git ya venía rastreando, y se salta en silencio los archivos nuevos.
3. Antes de abrir el PR, corre localmente:
   ```bash
   pnpm lint
   pnpm build
   ```
4. Abre el Pull Request describiendo qué cambia y por qué.
5. **Todo PR se revisa antes de mergear.** Ningún cambio entra a `main` sin que la mantenedora del proyecto lo apruebe, incluso si eres colaborador con acceso de escritura, el review es parte del proceso, no un trámite.

> **Nota sobre coautoría:** si dos personas trabajaron juntas en un mismo cambio,
> incluyan una línea `Co-authored-by: Nombre <email>` al final del mensaje del
> commit para dar crédito a ambas. GitHub reconoce así la contribución conjunta.
>
> Dos detalles que importan en la práctica:
> - El mail tiene que estar vinculado a la cuenta de GitHub de esa persona (el
>   de su perfil, o su alias `ID+usuario@users.noreply.github.com`). Con
>   cualquier otro mail, GitHub no puede asociar el commit a esa cuenta.
> - Si te pasan esa línea por WhatsApp, Discord o algo así, **verifica que los
>   símbolos `<` y `>` sigan ahí** antes de commitear — algunas apps de chat
>   los borran al interpretarlos como una etiqueta HTML.

## Correr el proyecto localmente

```bash
git clone https://github.com/VictoriaMolinaC/progreso-sobrio.git
cd progreso-sobrio
pnpm install
pnpm dev
```

## Cosas a tener en cuenta

- Todo el texto de cara al usuario (labels, botones, mensajes) va en español, es una app para Chile.
- No hay backend ni llamadas de red con datos personales, si tu cambio necesita eso, probablemente no encaje con el proyecto. Abre un issue primero para discutirlo.
- Todavía no hay suite de tests automatizada, prueba tu cambio manualmente en el navegador (`pnpm dev`) antes de abrir el PR.
