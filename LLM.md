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
| `msl-cliente.js` | `MslCliente`: **único** punto que habla con la API. Además `puede(accion)`, `alcance(accion)`, `cargarPermisos()`, `fijarPermisos()` y la lectura con caché `vivo()`. |
| `msl-cache.js` | Caché de respuestas en IndexedDB: `claveDe`, `leer`, `guardar`, `invalidar`, `vaciar`, `canonico`. |
| `msl-boot.js` | Arranque de tema antes del primer pintado. **Única** definición: el build lo inserta en línea, no lo reescribe. |
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

## Caché de lecturas (IndexedDB)

Toda lectura puede pintarse **al instante** con la última respuesta conocida y
rehacerse **solo si el servidor trae algo distinto**:

```js
await MslCliente.productos.vivo(filtro, (datos, { origen, cambio }) => {
  pintar(datos);   // origen: "cache" | "red"
});
```

- `pintar` se llama **una vez** con lo guardado y **otra solo si cambió**. Si la
  respuesta es idéntica, el componente no se rehace.
- La clave es `app + quién pregunta + método + ruta + cuerpo canónico`. Dos
  filtros distintos son dos entradas; las mismas claves en otro orden son la
  misma. El nickname entra en la clave: nadie ve datos de otra sesión.
- Solo se cachean `GET` y `QUERY`. Cada mutación **invalida** lo que tocó
  (tabla `INVALIDA` en `msl-cliente.js`); al cerrar sesión se vacía todo.
- Si la red falla pero había caché, `vivo()` no lanza: resuelve con lo guardado
  y avisa por `onError`.
- **El caché nunca bloquea el pintado.** Si IndexedDB no contesta en 1,5 s
  (modo privado, cuota, base corrupta) se degrada a memoria por el resto de la
  sesión. Cada entrada caduca a los 7 días.
- La forma sin caché sigue existiendo: `MslCliente.productos(filtro)` devuelve
  una promesa contra la red y también alimenta el caché.
- Contrato verificado en navegador: `cdn/prueba-cache.html`.

Lecturas con variante `.vivo`: `config`, `productos`, `carrito`, `pedidos`,
`pagos`, `archivos`, `metricas`, `tenants`, `permisos`, `definiciones`.

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
módulo**, incluidos los `<script type="module">` embebidos en HTML.
`node --check archivo.js` parsea como CommonJS y da falsos OK: un salto de
línea dentro de un string pasó así a producción y dejó el panel en blanco, y
el mismo fallo en un HTML impide que la página ejecute nada **sin error
visible en consola**. El chequeo corre también en CI
(`.github/workflows/verifica.yml`).

Vista previa con kit local: `node scripts/servir.mjs ../business/demo 8791`.

## Post-mortem: errores cometidos y reglas que los prohíben

Cada uno ocurrió de verdad en este repo. La regla es prohibitiva: si un agente
la rompe, reintroduce el fallo.

### 1. `node --check archivo.js` da falsos OK
**Qué pasó.** Un `.js` con un salto de línea literal dentro de un string pasó
la verificación y llegó a producción: el panel quedó **en blanco** con
`Uncaught SyntaxError` en consola.
**Causa raíz.** `node --check` sobre un `.js` lo parsea como **CommonJS**; el
fichero es ESM y el error solo aparece al parsearlo como módulo.
**Regla.** Verificar SIEMPRE con `node --input-type=module --check < archivo`,
o con `scripts/verifica-js.mjs`. Nunca declarar "sintaxis OK" con `node --check`.

### 2. El mismo salto de línea, ahora en HTML, **sin error visible**
**Qué pasó.** Un `<script type="module">` con el mismo defecto hizo que la
página **no ejecutara nada**, y la consola no mostró el error.
**Causa raíz.** El verificador solo miraba `.js`/`.mjs`.
**Regla.** El verificador cubre también los `<script type="module">` de los
`.html`. Al editar comentarios o strings con herramientas de scripting,
comprobar el fichero **después**: una barra-n mal escapada se convierte en un
salto de línea real dentro del string y rompe el módulo entero. Este mismo
error se cometió tres veces en la sesión, la última **escribiendo esta regla**.

### 3. Atributo inventado en un componente del kit (`variante` en vez de `variant`)
**Qué pasó.** 19 usos de `variante="texto"` en tres repos. El atributo no
existe: `is-button` quedaba con su variante por defecto (`filled`), llenando de
color botones que debían ser discretos.
**Causa raíz.** Se dedujo la API por parecido en lugar de leerla.
**Regla.** Antes de usar un atributo de un `is-*`, leer su `.md` en
`is-webcomponents/src/components/**`. Valores válidos de `variant`: `filled`,
`outlined`, `plain`, `ghost`, `soft`, `text`. `color` por defecto es `brand`.

### 4. Un caché que bloqueaba el render
**Qué pasó.** La primera versión de `msl-cache.js` solo resolvía en
`onsuccess`/`onerror` de IndexedDB. En un contexto donde no dispara ninguno, el
`await` quedaba colgado para siempre y **la vista no pintaba nunca**.
**Causa raíz.** Se asumió que IndexedDB siempre responde.
**Regla.** El caché **jamás** bloquea el pintado. Toda operación de IndexedDB
lleva tope de tiempo y degrada a memoria (modo privado, cuota llena, base
corrupta). Un caché caído debe ser indistinguible de no tener caché.

### 5. Ruta de CDN relativa resuelta contra el módulo, no contra la página
**Qué pasó.** `window.MSL_CDN = "./cdn"` producía `…/app/cdn/cdn/components/…`
(404) y el kit no cargaba.
**Causa raíz.** El `import()` vive dentro de `msl-loader.js`, así que un
especificador relativo se resuelve contra la URL **del módulo**.
**Regla.** `baseCdn()` absolutiza contra `document.baseURI`. Cualquier ruta que
configure un consumidor se interpreta relativa a **la página**.

### 6. jsDelivr sirvió durante horas un archivo ya corregido
**Qué pasó.** Tras arreglar y publicar, el panel seguía roto.
**Causa raíz.** jsDelivr cachea la resolución de `@main` hasta 12 h; purgar el
fichero no basta por sí solo de inmediato.
**Regla.** Tras publicar el kit, purgar
(`https://purge.jsdelivr.net/gh/<repo>@main/<ruta>`) y verificar lo que se
sirve. Para algo que deba llegar ya, servirlo desde GitHub Pages del repo que
lo publica, como hace la página `/admin/` de cada empresa.

### 7. Datos guardados con codificación rota
**Qué pasó.** El tenant demo tenía `Camiseta B�sica` en base de datos, y el
build generaba URLs como `/producto/1-camiseta-b-sica/`.
**Causa raíz.** Se escribieron sin `charset=utf-8` en el `content-type`.
**Regla.** Todo script que escriba en la API manda
`content-type: application/json; charset=utf-8`. Ante un slug con guiones
extraños, revisar el dato en origen antes de tocar el generador de slugs.

## Gobernanza (aplica a los cuatro repos)

- **Commits: autor único `Jeff-Aporta`.** Prohibidos los trailers de coautoría
  (`Co-authored-by:`). El historial refleja autoría individual.
- **Índice de propiedad:** `tests/_propiedad.json` (ignorado por git) lleva
  `author` / `notTouched`. `author` vacío = todo el repo es de Jeff-Aporta.
  Nunca modificar lo listado en `notTouched` sin preguntar primero.
- **Comentarios caveman en español**, una línea, `//`. Prohibidos `/* */` y
  `/** */` multilínea. En CSS los `/* */` también van cortos y sin relleno
  (`/* margen safe-area iOS */`, no una frase explicativa). Regla del corpus
  InSoft `comments-caveman-es`: obligatoria y universal, incluye JSDoc.
- **Cero vestigios legacy:** nada de código comentado ni capas antiguas.
- **Higiene:** lo temporal y de operación vive en carpetas ignoradas
  (`scripts/`, `tests/`, `logs/`).
- **Antes de decidir cómo se hace algo en InSoft, consultar el RAG**
  (`python C:\ContaPyme\RAG\rag.py preguntar "..."`), incluido el dominio
  `guideagents-jeffrey` para preferencias del desarrollador. Citar la ruta que
  devuelva. "No está indexado" es respuesta válida; inventar no lo es.

## Ver también

- `muestralo-api/LLM.md` — endpoints, permisos SEG, temas y archivos.
- `muestralo-main/LLM.md` — módulos comunes de las APIs.
- `is-webcomponents/LLM.md` — API de cada componente base.
