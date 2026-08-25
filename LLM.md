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
| `msl-loader.js` | `cargarKit(tagsExtra)`: carga `is-*`, `msl-kit.css` y `msl-*`. Al terminar instala captura global de errores (`web-muestralo` → is-errores). `baseCdn()` respeta `window.MSL_CDN`. |
| `msl-cliente.js` | `MslCliente`: **único** punto que habla con la API. Además `puede(accion)`, `alcance(accion)`, `cargarPermisos()`, `fijarPermisos()` y la lectura con caché `vivo()`. |
| `msl-cache.js` | Fachada IndexedDB sobre kit `helpers/response-cache` (`claveDe`, `leer`, `guardar`, …). |
| `msl-boot.js` | Arranque de tema antes del primer pintado. **Única** definición: el build lo inserta en línea, no lo reescribe. |
| `msl-tema.js` | `aplicarTema()`, `montarControlesTema()`, `temaInicial()`, `dinero()`. |
| `msl-core.js` | `esc()`, `attrJson()`, `setJsonAttr()`: convención de parámetros por atributos. |
| `msl-kit.css` | Estilos de todos los componentes `msl-*`. Solo tokens `--is-*`. |
| `components/msl-producto-card.js` | Tarjeta de producto. Eventos `msl-ver`, `msl-agregar`. |
| `components/msl-vitrina-hero.js` | Portada de tienda (HTML horneado; el tag nombra el bloque). |
| `components/msl-vitrina-producto.js` | Pieza en mosaico de home (`is-card` + foto). |
| `components/msl-vitrina-coleccion.js` | Baldosa de departamento con foto. |
| `components/msl-vitrina-banda.js` | Franja editorial (pedido WhatsApp, sedes). |
| `components/msl-carrito-panel.js` | Carrito con totales. Eventos `msl-cantidad`, `msl-quitar`, `msl-congelar`. |
| `components/msl-pedido-card.js` | Pedido congelado: código base36, ítems, total, botón WhatsApp. |
| `components/msl-auth-form.js` | Acceso por nickname (email, móvil o usuario). Evento `msl-login`. |
| `components/msl-metrica-card.js` | Cifra con icono y etiqueta. La usan admin y main. |
| `msl-juego.js` | Motor: ancla de precio, ventanas, racha, sorteo, cupones. Importable por CDN. |
| `components/msl-juego.js` | Tags `msl-juego-*` (gamificación). Un fichero, 15 elementos. |

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

## Gamificación (`msl-juego-*`)

Un motor (`cdn/msl-juego.js`) y un fichero de tags (`cdn/components/msl-juego.js`).
Las tiendas no copian la lógica: `await cargarKit("gamificacion")` o el perfil
completo. Persistencia en `localStorage` (`msl.juego.*`). Precios en **centavos**.

```js
import { precioAncla, ventanaPromo } from "…/cdn/msl-juego.js";
precioAncla({ centavos: 1940000, modo: "simulada", inflar: 1.55 });
// lista inflada, oferta = precio real
precioAncla({ centavos: 1940000, modo: "real", descuento: 30 });
ventanaPromo({ ciclo: "mes-semana-1" }); // semana 1 de cada mes
```

| Tag | Capa | Atributos |
|---|---|---|
| `msl-juego-precio` | Ancla | `centavos` `modo=simulada\|real\|ninguna` `inflar` `descuento` `moneda` |
| `msl-juego-cuenta` | Urgencia | `ciclo` `hasta` ISO `durante` (`90s`/`2h`) `clave` `rotulo` |
| `msl-juego-escasez` | Urgencia | `sku` `quedan` `min` `max` `tipo=simulado\|real` · `msl-juego-mirada` |
| `msl-juego-barra` | Urgencia | `actual` `umbral` `premio` `moneda` |
| `msl-juego-asintota` | Juegos | `puntos` `premio` |
| `msl-juego-mision` | Juegos | JSON `misiones` · evento `msl-juego-mision` |
| `msl-juego-suerte` | Juegos | `tipo=ruleta\|cofre\|rasca` JSON `premios` · `msl-juego-premio` |
| `msl-juego-feed` | Descubrimiento | JSON `items` |
| `msl-juego-paquete` | Descubrimiento | JSON `items` · `msl-juego-sumar` |
| `msl-juego-cupon` | Ancla | `cuenta` |
| `msl-juego-referido` | Viralidad | `codigo` · `msl-juego-ref` |
| `msl-juego-grupo` | Viralidad | `actual` `meta` |
| `msl-juego-alerta` | Retención | `abierta` `titulo` `cuerpo` |
| `msl-juego-salida` | Retención | intercepta el cursor hacia la pestaña (1 vez/día) |
| `msl-juego-ficha` | Composición | JSON `producto` + `modo` + `ciclo` + `tipo` (pasa a escasez) |

Color: `color` CSS del host (token `--is-*` según el tipo de tag). Hijos
`currentColor`. `variant` en `is-button` es forma (`text`/`ghost`), no tinte.
Tamaño: `font-size` en el host; interiores en `em`.

`msl-juego-escasez tipo="simulado"` (defecto): gente/stock por hash sku+día.
`tipo="real"`: WebSocket `GET /api/miradas/{app}/{sku}`; cada pestaña abierta
en ese sku cuenta y avisa al resto (`{n}`, evento `msl-juego-mirada`).

Catálogo vivo en GitHub Pages del kit (`index.html` / `docs.js`), hashes
`#gamificacion`, `#msl-juego-precio`, etc.

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

## Recomendaciones (opt-in)

La API rastrea sola las vistas (`GET` producto), carrito y pedido. El front
**no tiene** que pintar nada: si quiere, pide `MslCliente.recomendaciones()` y
mete el `results` en un `msl-carrusel` (o ignóralo y deja productos fijos).
Tiempo en ficha: `MslCliente.permanencia(id, ms)` al salir de la página.
El dueño puede fijar ids en `config.meta.recomendaciones.fijos` y el QUERY
devuelve esos, sin embeddings.

```js
const { results } = await MslCliente.recomendaciones({ limite: 10 });
```
## Temización camaleónica

No se inventa nada: se usa el sistema de is-webcomponents.

- `<html data-theme="dark|light">` + clases `theme-dark` / `theme-light`
  → `<is-theme-toggle>`.
- `<html data-palette="X">` → `<is-palette-selector>`, alimentado con las
  paletas del tenant (`GET /api/config` → `paletas`). El CSS de paleta es
  **local de cada app** (hoja horneada o `css/app.css`). La API **ya no**
  sirve `GET /tema/{app}/{paleta}.css`: no reintroducir esa ruta.
- El molde arranca el tema en un script del `<head>` para que no haya destello.

**Regla dura para el molde y los paneles:** ni un color literal. Todo sale de
tokens `--is-*`. **Excepción:** un clon visual (Don Jacobo) escribe hex en su
`css/app.css` para copiar el original; no mezclar ese CSS con el molde.

## El molde (`molde/`)

Sitio público de una empresa, MPA estático horneado. Forma: **índice impreso**
—cada departamento es una lista de renglones «nombre · guía de puntos · precio»—
en vez de una rejilla de tarjetas. El pie lleva crédito Muéstralo como
watermark (`.pie-credito` en `msl-kit.css`: ~0.6rem, opacity baja); no es
segunda marca.

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

### Clon Don Jacobo (excepción al índice impreso)

`business/don-jacobo-clon/` no usa la forma “índice impreso” ni paletas de API.
Original: https://donjacobo.com.co/

**Arquitectura (2026-08-25):** árbol `src/` al estilo isc-swagger; web components
propios `dj-*` publicados en `dist/cdn/` (`all.min.js` + módulos hermanos).
**No** copia el kit `msl-*` de este `app/cdn` al dist del clon. Consume `is-*`
por loader. JSON en `src/json/` con clave **`brand`** (no `marca`); imágenes en
`src/assets/imgs/brand/`. Guía completa: [`business/don-jacobo-clon/LLM.md`](../business/don-jacobo-clon/LLM.md).

Otras empresas del molde siguen consumiendo `msl-*` por CDN de este repo.

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

### 8. `Number(getAttribute(…))` trata ausencia como 0
**Qué pasó.** `msl-juego-escasez` pintaba «Quedan 0» aunque no hubiera `quedan`.
**Causa raíz.** `getAttribute` sin attr es `null`; `Number(null) === 0`.
**Regla.** Atributo numérico ausente o vacío = default del tag. `n(nombre, def)`
no convierte `null` a 0.

### 9. Primer `abrir("inicio")` pisa el hash del catálogo
**Qué pasó.** Entrar a `#gamificacion` acababa en inicio porque el boot
llamaba `abrir("inicio")` después de leer el hash.
**Causa raíz.** Orden: kit carga → abrir inicio → hash se pierde.
**Regla.** Tras `cargarKit`, abrir solo el hash (`location.hash`) o inicio si
no hay hash. No reabrir inicio siempre.

### 10. `Promise.all` del loader tumba el catálogo entero
**Qué pasó.** Un componente 404 dejó la página en blanco.
**Causa raíz.** Un rechazo aborta todos los tags.
**Regla.** Un tag que falle no debe impedir el resto. Aislar cargas; no
asumir que todos los paths existen.

### 11. Crédito del pie robaba la marca
**Qué pasó.** «Ronda · catálogo con Muéstralo» parecía una fila de marca.
**Causa raíz.** `.msl-pie-capa { gap: 2rem }` más padding, no solo el
`font-size` de `.pie-credito`.
**Regla.** Watermark: ~0.6rem, opacity ~0.38, casi sin padding. El hueco
vertical del grid es el ladrón; bájalo. No copies el kit a `business/*/dist`
como fuente: el tenant consume CDN.

### 12. Python `http.server` reset en Windows
**Qué pasó.** Servir el catálogo con `python -m http.server` cortaba conexiones
(ruta unicode / Muéstralo).
**Causa raíz.** Entorno local, no el HTML.
**Regla.** QA del catálogo: servidor estático Node, no `http.server`.

### 13. PowerShell no acepta `&&`
**Regla.** Encadenar con `;`.

### 14. `MSL_CDN` relativo con `admin.js` en GitHub Pages
**Qué pasó.** `window.MSL_CDN = "../cdn"` en `/admin/index.html` dejó el panel
en blanco: `import(\`${KIT}/msl-loader.js\`)` resolvió contra
`jeff-aporta.github.io/muestralo-admin/`, no contra la tienda.
**Causa raíz.** Un `import()` dinámico con ruta relativa usa la URL **del
módulo** (`admin.js` en Pages), no `document.baseURI`.
**Regla.** Si el panel se carga desde Pages y el kit es local, `MSL_CDN` debe
ser **absoluto** (`new URL("../cdn/", location.href)`). Nunca un string
relativo. `htmlPaginaAdmin` en `marco.mjs` ya lo hornea así.

### 15. Reportero is-errores: slug sin prefijo `web-`/`android-`
**Qué pasó.** `crearReportero({ app: "don-jacobo-clon" })` lanza: el registro
exige `^(android|web)-[a-z0-9][a-z0-9-]{0,40}$`.
**Causa raíz.** El slug del tenant Muéstralo no es id de plataforma.
**Regla.** Fronts: app fija `web-muestralo`, tenant en `contexto`. API:
`web-muestralo-api`. Instalar solo en `cargarKit` (`instalarReportero`). CORS
en is-errores (POST `/v1/errores` y GET `/v1/cliente.js`) es obligatorio para
el navegador.

### 16. Enlace Admin y sesión de desarrollador
**Contrato.** Toda tienda hornea `/admin/` (`htmlPaginaAdmin`) y un enlace
Admin en el pie (molde: Sitio; clon Don Jacobo: `.msl-pie-sello`). Login
`jagudeloe` / cuenta en tenant `matriz` rol `DESARROLLADOR` (`*`). El login
prueba el tenant y cae a matriz. No crear usuarios espejo por tienda.

### 17. `css_vars` desde config en `aplicarTema`
**Qué pasó.** Se inyectaban variables CSS de `GET /api/config` en `:root`.
**Regla.** No. Marca = CSS local de la app. Sin paletas del tenant, no montar
`is-palette-selector`. Ver `muestralo-api/LLM.md` §17.

### 18. Fuente del clon fuera de `src/`
**Qué pasó.** Don Jacobo tenía `css/`, `js/`, `media/marca/` y JSON en la raíz;
el build copiaba todo `app/cdn` (msl-*) a `dist/cdn`.
**Causa raíz.** Tratar el clon como molde business plano en vez de app WC con CDN propio.
**Regla.** Clones con layout `src/` (Don Jacobo): no recrear `css/` ni `media/`
ni `marca/` en la raíz. Build lee `src/`. Prefijo dominio `dj-*`; no `cp` del
kit msl al dist del clon. Clave JSON/assets: **`brand`**.

### 19. `rm -rf dist` tras escribir CDN (Windows)
**Qué pasó.** `build.mjs` borraba `dist/` entero (incluido CDN recién compilado)
y restauraba con tmp → crash nativo / buffer overrun en path con tilde.
**Regla.** Al re-hornear sitio: limpiar entradas de `dist/` **excepto** `cdn/`.

### 20. Dominio RAG `guideagents-jeff-aporta`
**Qué pasó.** Consulta sin resultados.
**Regla.** Preferencias Jeff: dominio **`guideagents-jeffrey`**.

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
