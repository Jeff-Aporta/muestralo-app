# muestralo-app — molde generador de sitios

Plantilla oficial de **Muéstralo** para sitios públicos de empresas. No es una app para desplegar tal cual: es el **molde** del que nace el repo independiente de cada empresa cliente.

## Filosofía

- Cada empresa = repo propio + sitio estático propio (GitHub Pages siempre, Cloudflare Pages opcional con DNS personalizado).
- El sitio se **hornea** (MPA estático): cada producto, el catálogo, el home y las sedes salen en HTML con meta, Open Graph, JSON-LD y sitemap — indexación directa en Google/Bing/Yahoo sin interfaz puente.
- La identidad de marca viene de la API (`css_vars` del tenant) y queda horneada en `tema.css`: primer pintado con la marca, sin esperar JS.
- La interactividad (sesión, carrito, congelar pedido, WhatsApp) la da el runtime JS sobre el HTML horneado.

## Estructura

- `molde/` — todo lo que se copia a la empresa: `empresa.json`, `css/`, `js/`, `scripts/build.mjs`, workflow de Pages, `.gitignore`, `README.md`.
- `cdn/` — kit de componentes `msl-*` (fuente única; también consumido por `muestralo-admin` y `muestralo-main` vía jsDelivr).
- `scripts/nueva-empresa.mjs` — genera `business/<app>/` a partir del molde.

## Crear una empresa

```bash
node scripts/nueva-empresa.mjs --app mitienda --nombre "Mi Tienda"
```

Ver `../business/README.md` para el flujo completo de publicación.

## Regenerar tras cambios del kit

Si `cdn/` se actualiza, copiarlo de nuevo a cada empresa (`cp -r cdn ../business/<app>/cdn`) o re-generar la empresa.
