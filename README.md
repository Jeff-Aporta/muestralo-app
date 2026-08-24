# muestralo-app — molde generador de sitios

Plantilla oficial de **Muéstralo** para sitios públicos de empresas. No es una app para desplegar tal cual: es el **molde** del que nace el repo independiente de cada empresa cliente.

## Filosofía

- Cada empresa = repo propio + sitio estático propio (GitHub Pages siempre, Cloudflare Pages opcional con DNS personalizado).
- El sitio se **hornea** (MPA estático): cada producto, el catálogo, el home y las sedes salen en HTML con meta, Open Graph, JSON-LD y sitemap — indexación directa en Google/Bing/Yahoo sin interfaz puente.
- La identidad de marca viene de la API (`css_vars` del tenant) y queda horneada en `tema.css`: primer pintado con la marca, sin esperar JS.
- La interactividad (sesión, carrito, congelar pedido, WhatsApp) la da el runtime JS sobre el HTML horneado.

## Estructura

- `molde/` — todo lo que se copia a la empresa: `empresa.json`, `css/`, `js/`, `scripts/build.mjs`, `scripts/contenido.mjs`, workflow de Pages, `.gitignore`, `README.md`.
- `cdn/` — kit de componentes `msl-*` (fuente única; también consumido por `muestralo-admin` y `muestralo-main` vía jsDelivr).
- `scripts/nueva-empresa.mjs` — genera `business/<app>/` a partir del molde.

## Crear una empresa

```bash
node scripts/nueva-empresa.mjs --app mitienda --nombre "Mi Tienda"
```

Ver `../business/README.md` para el flujo completo de publicación.

## Generador de contenido (LLM + imágenes)

`molde/scripts/contenido.mjs` llena el catálogo del tenant sin tocar la BD a mano:

```bash
MSL_NICKNAME=duena@tienda.co MSL_PASSWORD=… GROQ_API_KEY=… MINIMAX_API_KEY=… node scripts/contenido.mjs --todo
```

- `--textos`: eslogan y meta del home + descripción, meta-descripción y palabras clave por producto (LLM compatible OpenAI; Groq por defecto, `LLM_BASE_URL`/`LLM_MODEL` para otro).
- `--imagenes`: genera con MiniMax `image-01` la foto de cada producto sin imagen, la sube a R2 vía `POST /api/archivos` y la enlaza al producto.

Luego `node scripts/build.mjs` hornea el sitio con ese contenido ya dentro.

## Página de administración de la empresa

El build genera también `/admin/` (noindex) en el propio dominio de la empresa:
carga el panel desde el CDN de `muestralo-admin` con el tenant y la API ya
fijados. La dueña entra con su nickname; los permisos SEG deciden qué ve.

## Regenerar tras cambios del kit

El kit `cdn/` se consume por jsDelivr, así que las empresas se actualizan solas
al publicar aquí. Solo hay que re-generar (o copiar `molde/`) cuando cambian el
build, el runtime o el workflow.
