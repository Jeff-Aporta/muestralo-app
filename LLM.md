# LLM.md — muestralo-app

Dos cosas viven aquí: el **kit de componentes `msl-*`** que usa todo el
ecosistema, y el **molde** del que nace el sitio de cada empresa. Antes de
escribir un componente o una vista, revisa si ya existe: se consume por CDN,
no se copia.

## Sistema de front (idéntico en las tres apps)

```
is-webcomponents  (CDN)  → componentes base is-*, tokens --is-*, temización
   ↓
msl-* kit         (CDN)  → componentes de dominio + msl-kit.css + cliente API
   ↓
app / admin / main       → solo composición y vistas propias
```

Nada de npm, bundlers, React ni Svelte. Iconos **solo** con
`<is-icon icon="prefijo:nombre">` (Iconify); jamás emoji ni glifos sueltos.

## El kit (`cdn/`)

| Archivo | Qué expone |
|---|---|
| `msl-loader.js` | `cargarKit(tagsExtra)`: carga los tags `is-*` del CDN, la hoja `msl-kit.css` y los componentes `msl-*`. `baseCdn()` respeta `window.MSL_CDN` para desarrollo local. |
| `msl-cliente.js` | `MslCliente`: **único** punto que habla con la API. Además `puede(accion)`, `alcance(accion)`, `cargarPermisos()`, `fijarPermisos()`. |
| `msl-tema.js` | `aplicarTema()`, `montarControlesTema()`, `temaInicial()`, `dinero()`. |
| `msl-core.js` | `esc()`, `attrJson()`, `setJsonAttr()`: convención de parámetros por atributos. |
| `msl-kit.css` | Estilos de todos los componentes `msl-*`. Solo tokens `--is-*`. |
| `components/msl-producto-card.js` | Tarjeta de producto. Eventos `msl-ver`, `msl-agregar`. |
| `components/msl-carrito-panel.js` | Carrito con totales. Eventos `msl-cantidad`, `msl-quitar`, `msl-congelar`. |
| `components/msl-pedido-card.js` | Pedido congelado: código base36, ítems, total, botón WhatsApp. |
| `components/msl-auth-form.js` | Acceso por nickname (email o móvil). Evento `msl-login`. |
| `components/msl-metrica-card.js` | Cifra con icono y etiqueta. La usan admin y main. |
| `components/msl-imagen-input.js` | Sube imágenes redimensionando en canvas (2048/1024/320, q 0.75) y las manda a R2. Evento `msl-subida`. |

Publicado en `https://cdn.jsdelivr.net/gh/Jeff-Aporta/muestralo-app@main/cdn/`.
**Ojo:** jsDelivr cachea la resolución de `@main` hasta 12 h. Para un arreglo
urgente que deba llegar ya, sirve el archivo desde GitHub Pages del repo que lo
publica (así lo hace la página `/admin/` de cada empresa).

### Añadir un componente

1. `cdn/components/msl-<nombre>.js`, light DOM, parámetros por atributos
   (primitivos) o propiedad JS (objetos), eventos `msl-*` con `bubbles`.
2. Sus estilos van en `cdn/msl-kit.css`, **nunca** en el CSS de un front.
3. Registrarlo en la lista `COMPONENTES` de `msl-loader.js`.
4. Documentarlo en la tabla de arriba.

## Temización camaleónica

No se inventa nada: se usa el sistema de is-webcomponents.

- `<html data-theme="dark|light">` + clases `theme-dark` / `theme-light`
  → `<is-theme-toggle>`.
- `<html data-palette="X">` → `<is-palette-selector>`, alimentado con las
  paletas del tenant (`GET /api/config` → `paletas`), cada una con su `css`
  (`GET /tema/{app}/{paleta}.css`) que el selector inyecta bajo demanda.
- El CSS de cada paleta lo **genera la API** desde el color de marca; nadie
  escribe hojas de color por cliente.
- El molde arranca el tema en un script del `<head>` para que no haya destello.

**Regla dura para cualquier CSS del ecosistema:** ni un color literal. Todo
sale de tokens `--is-*`. Si un componente necesita un color nuevo, se toma del
token que corresponda, no se inventa un hex.

## El molde (`molde/`)

Sitio público de una empresa, MPA estático horneado. Forma: **índice impreso**
—cada departamento es una lista de renglones «nombre · guía de puntos · precio»—
en vez de una rejilla de tarjetas.

| Archivo | Qué hace |
|---|---|
| `empresa.json` | Identidad del despliegue: `app`, `nombre`, `api`, `dominio`. |
| `scripts/build.mjs` | Hornea `dist/`: home, catálogo, una página por producto, sedes, carrito/pedidos/pedido (noindex), `/admin/`, sitemap y robots. Con meta, Open Graph, JSON-LD y preconnects. |
| `scripts/contenido.mjs` | Llena el catálogo: `--textos` (LLM compatible OpenAI) y `--imagenes` (MiniMax → R2). |
| `js/vistas.js` | Arranque: carga el kit, monta controles de tema y despacha por `body[data-vista]`. |
| `js/runtime.js` | Sesión, carrito, buscador/filtros del índice, personalización con total en vivo, pedidos. |
| `css/app.css` | Estilos del sitio. Solo tokens `--is-*`. |

### Escotillas de desarrollo (query string)

- `?cdn=/cdn` — usa un kit local en vez de jsDelivr.
- `?tema=light|dark` y `?paleta=<id>` — fijan la identidad para auditar.

Vista previa local: `node scripts/servir.mjs ../business/demo 8791`, luego
`http://127.0.0.1:8791/?cdn=/cdn`.

### Crear una empresa

```bash
node scripts/nueva-empresa.mjs --app mitienda --nombre "Mi Tienda"
```

El kit **no** se copia al repo de la empresa: llega por CDN. Solo hay que
re-sincronizar `molde/` cuando cambian el build, el runtime o el workflow.

## Calidad

`node scripts/verifica-js.mjs <dir>` chequea la sintaxis de todo el JS **como
módulo**. `node --check archivo.js` parsea como CommonJS y da falsos OK: un
salto de línea dentro de un string pasó así a producción y dejó el panel en
blanco. El chequeo corre también en CI (`.github/workflows/verifica.yml`).

## Ver también

- `muestralo-api/LLM.md` — endpoints, permisos SEG, temas y archivos.
- `muestralo-main/LLM.md` — módulos comunes de las APIs.
- `is-webcomponents/LLM.md` — API de cada componente base.
