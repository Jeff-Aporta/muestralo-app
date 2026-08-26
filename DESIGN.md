# Design

Sistema visual de los sitios públicos de Muéstralo, escrito **desde lo
construido** (molde en `app/molde/`, kit en `app/cdn/`, demo vivo en
`business/demo/`). Los paneles `admin/` y `main/` heredan los mismos tokens.

## Tesis

El **home** es la tienda ya abierta: vitrina con foto, colecciones y piezas
en sala (`msl-vitrina-*` sobre `is-card` / `is-button`). El **catálogo** sigue
siendo el índice completo. El demo existe para oler cómo se ve el comercio
cuando Muéstralo ya está en producción.

## Fuente de los tokens

No hay tokens propios de color en el **molde**. Todo sale de **is-webcomponents**
(`--is-*`), consumido por CDN. El selector usa paletas de `GET /api/config`.
La API **ya no** genera hojas en `GET /tema/{app}/{paleta}.css` (ruta podada).
Claro/oscuro: `<html data-theme>` más `theme-dark` / `theme-light`.

**Excepción:** un clon 1:1 del sitio del cliente (Don Jacobo) escribe hex en
`css/app.css`. No mezclar esa hoja con el molde ni con `business/demo`.

**Regla dura en molde y paneles:** ningún CSS del kit escribe un color
literal. Si hace falta un color, existe un token.

| Rol | Token |
|---|---|
| Fondo, superficie elevada | `--is-bg`, `--is-bg-soft`, `--is-bg-elev` |
| Texto, secundario, tenue | `--is-text`, `--is-text-soft`, `--is-text-dim` |
| Marca y estados de marca | `--is-color-brand*`, `--is-accent`, `--is-brand-soft`, `--is-brand-text` |
| Bordes y controles | `--is-border`, `--is-border-soft`, `--is-control-*` |
| Radio, sombra, tipografía | `--is-radius`, `--is-radius-sm`, `--is-shadow`, `--is-sans` |
| Logo | `--is-logo-bg`, `--is-logo-fg` |

`--is-brand-text` se emite **por tema**: aclarado en oscuro, oscurecido en
claro. Un único valor no contrasta en ambos.

## Tipografía

El comercio declara sus fuentes en `meta.fuentes` (display, cuerpo y la URL de
Google Fonts) y el build las hornea con sus `preconnect`. En el demo: display
Bricolage Grotesque, cuerpo Archivo.

- Display: peso 640–700, `letter-spacing` −0.03 a −0.05em, `text-wrap: balance`.
- Portada: `clamp(3.2rem, 12vw, 6rem)`. Nunca por encima de 6rem.
- Cuerpo: 1–1.075rem, interlínea 1.6, medida máxima 68ch.
- Precios y cifras: `font-variant-numeric: tabular-nums`, siempre.

## Composición

- Canal único: `min(1180px, 100% - 2 * paso)`, con `paso` fluido.
- Cabecera pegajosa con fondo translúcido y `backdrop-filter`; en móvil la
  navegación de departamentos baja a su propia fila.
- **Renglón de índice**: rejilla `1fr auto`; el nombre lleva una guía punteada
  (`::after` con `border-bottom: 1px dotted`) que crece hasta el precio. Bajo
  él, la nota y las fichas de opciones. En móvil la guía desaparece y el precio
  pasa a su propia línea.
- **Departamentos**: renglones del índice mayor (icono, nombre, lema, cifra),
  no una fila de tarjetas.
- **Ficha de producto**: dos columnas desde 60rem, con la imagen cuadrada
  pegajosa; las opciones son fichas seleccionables, no desplegables.
- Ritmo: más espacio encima de un título que debajo; una sección densa gana una
  tranquila.

## Estados y movimiento

- Foco visible siempre: `outline: 2px solid var(--is-focus)` con separación.
- Hover de renglón: fondo `--is-brand-soft` + `translateX` (nunca padding: eso
  provoca reflow).
- Un solo momento de movimiento autorizado: la entrada escalonada de los
  renglones del índice al cargar, con `cubic-bezier(0.16, 1, 0.3, 1)` y
  respetando `prefers-reduced-motion`.
- Sin foto, la marca ocupa el hueco (icono del departamento sobre un lavado de
  `--is-brand-soft`), nunca un rectángulo gris.

## Iconografía

Solo `<is-icon icon="prefijo:nombre">` (Iconify). Prohibidos emoji y glifos
Unicode como iconos. El icono de marca del comercio es un dato (`meta.icono`).

## Componentes

Los `msl-*` traen su propia hoja (`cdn/msl-kit.css`) que carga el loader del
kit. Un front **nunca** redefine el estilo de un componente del kit: si algo
falta, se añade a esa hoja y lo reciben los tres fronts y todos los sitios.

## Qué se rechaza

- Rejillas de tarjetas iguales como **única** estructura de página (el home sí usa mosaico fotográfico; el catálogo sigue siendo índice).
- Etiquetas o «kickers» encima de los títulos.
- Texto con degradado; el énfasis va en peso y tamaño.
- Números de sección salvo que la secuencia informe.
- Cristal y desenfoque como adorno (solo la cabecera pegajosa, que lo necesita).
- Cualquier color literal en CSS.
