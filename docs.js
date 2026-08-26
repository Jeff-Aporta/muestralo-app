// Visor del kit msl-*: demos vivos (is-demo) + fuente (is-code) en is-split-panel.
window.MSL_CDN = "./cdn";

const PRODUCTO = {
  id: 1, nombre: "Taza de cerámica esmaltada", precio: 1890000, moneda: "COP",
  stock: 12, imagenes: ["https://picsum.photos/seed/taza/400"],
  variaciones: { color: ["blanco", "negro"], adicionales: [{ nombre: "Caja regalo", precio: 500000 }] },
};
const PEDIDO = {
  codigo: "3k9", estado: "pendiente_pago", moneda: "COP", creado_en: "2026-08-24T12:00:00Z",
  items: [
    { producto_id: 1, nombre: "Taza de cerámica esmaltada", cantidad: 2, personalizacion: { color: "negro", adicionales: ["Caja regalo"] }, precio_unitario: 2390000, subtotal: 4780000 },
  ],
  total: 4780000,
};
const CARRITO = {
  items: [{ id: 1, nombre: "Taza de cerámica esmaltada", cantidad: 2, personalizacion: { color: "negro" }, subtotal: 3780000 }],
  total: 3780000,
};

const FICHA_DEMO = { id: 1, nombre: PRODUCTO.nombre, precio: PRODUCTO.precio, moneda: "COP", img: PRODUCTO.imagenes[0], inflar: 1.5 };

function ed(lang = "html") {
  return `<is-code lang="${lang}" readonly compact wrap line-numbers="false"></is-code>`;
}
function marco(vivo, heading = "Vivo") {
  return `<is-split-panel class="doc-split" position="58">
    <div slot="start" class="doc-vivo">
      <is-demo class="demo" heading="${heading}" data-no-code data-no-sources data-no-file-meta>${vivo}</is-demo>
    </div>
    <div slot="end" class="doc-fuente">${ed("html")}</div>
  </is-split-panel>`;
}
function sembrar(root, textos) {
  [...root.querySelectorAll("is-code")].forEach((el, i) => { if (textos[i] != null) el.value = textos[i]; });
}
function ajustarSplits(root) {
  requestAnimationFrame(() => {
    root.querySelectorAll("is-split-panel.doc-split").forEach((sp) => {
      const pct = Number(sp.getAttribute("position")) || 58;
      const total = sp.orientation === "vertical" ? sp.offsetHeight : sp.offsetWidth;
      if (total > 40) sp.positionInPixels = Math.round(total * (pct / 100));
    });
  });
}

const SECCIONES = [
  {
    id: "inicio", grupo: "General", titulo: "Kit msl-* de Muéstralo",
    html: `
      <h1>Kit msl-* de Muéstralo</h1>
      <p>Componentes por CDN, sin npm ni bundlers. El markup de ejemplo vive en
      <code>is-code</code>; los tags <code>msl-*</code> solo se montan en
      <code>is-demo</code> (nunca dentro de un <code>&lt;pre&gt;</code>).</p>
      ${ed("javascript")}
      <h2>Regla de parámetros</h2>
      <p>Primitivos por atributos planos; objetos por atributo JSON.</p>
      ${ed("html")}
      <h2>Módulos</h2>
      <table>
        <tr><th>Módulo</th><th>Qué expone</th></tr>
        <tr><td><code>msl-loader.js</code></td><td><code>cargarKit()</code>, <code>baseCdn()</code></td></tr>
        <tr><td><code>msl-cliente.js</code></td><td><code>MslCliente</code> (QUERY incluido)</td></tr>
        <tr><td><code>msl-tema.js</code></td><td><code>aplicarTema()</code>, <code>dinero(centavos)</code></td></tr>
        <tr><td><code>msl-juego.js</code></td><td>Motor + tags <code>msl-juego-*</code></td></tr>
      </table>
      <is-callout>Color: CSS <code>color</code> / <code>currentColor</code> según el tipo de tag.
      Tamaño: <code>font-size</code> del host. Layout de este visor: <code>is-main</code>,
      <code>is-demo</code>, <code>is-split-panel</code>, <code>is-code</code>.</is-callout>`,
    codigos: [
      `const { cargarKit } = await import("https://cdn.jsdelivr.net/gh/Jeff-Aporta/muestralo-app@main/cdn/msl-loader.js");
await cargarKit();`,
      `<msl-metrica-card icono="mdi:cart" valor="42" etiqueta="Pedidos"></msl-metrica-card>
<msl-producto-card producto='{"id":1,"nombre":"Taza","precio":1890000}'></msl-producto-card>`,
    ],
  },
  {
    id: "msl-producto-card", grupo: "Componentes", titulo: "msl-producto-card",
    html: `
      <h1>msl-producto-card</h1>
      <p>JSON <code>producto</code>. Eventos <code>msl-ver</code>, <code>msl-agregar</code>.</p>
      ${marco(`<msl-producto-card id="demo-producto"></msl-producto-card>`)}`,
    codigos: [`<msl-producto-card producto='${JSON.stringify(PRODUCTO)}'></msl-producto-card>`],
    montar() { document.getElementById("demo-producto").producto = PRODUCTO; },
  },
  {
    id: "msl-carrito-panel", grupo: "Componentes", titulo: "msl-carrito-panel",
    html: `
      <h1>msl-carrito-panel</h1>
      <p>JSON <code>carrito</code>. Eventos <code>msl-cantidad</code>, <code>msl-quitar</code>, <code>msl-congelar</code>.</p>
      ${marco(`<msl-carrito-panel id="demo-carrito"></msl-carrito-panel>`)}`,
    codigos: [`<msl-carrito-panel carrito='${JSON.stringify(CARRITO)}'></msl-carrito-panel>`],
    montar() { document.getElementById("demo-carrito").carrito = CARRITO; },
  },
  {
    id: "msl-pedido-card", grupo: "Componentes", titulo: "msl-pedido-card",
    html: `
      <h1>msl-pedido-card</h1>
      <p>JSON <code>pedido</code> + <code>whatsapp-url</code>.</p>
      ${marco(`<msl-pedido-card id="demo-pedido" whatsapp-url="https://wa.me/573001112233"></msl-pedido-card>`)}`,
    codigos: [`<msl-pedido-card whatsapp-url="https://wa.me/573001112233" pedido='${JSON.stringify(PEDIDO)}'></msl-pedido-card>`],
    montar() { document.getElementById("demo-pedido").pedido = PEDIDO; },
  },
  {
    id: "msl-metrica-card", grupo: "Componentes", titulo: "msl-metrica-card",
    html: `
      <h1>msl-metrica-card</h1>
      <p>Atributos planos: <code>icono</code>, <code>valor</code>, <code>etiqueta</code>.</p>
      ${marco(`<is-grid-layout cells="2" gap="0.75rem">
        <msl-metrica-card icono="mdi:cart" valor="42" etiqueta="Pedidos"></msl-metrica-card>
        <msl-metrica-card icono="mdi:cash" valor="$1.2M" etiqueta="Ingresos"></msl-metrica-card>
      </is-grid-layout>`)}`,
    codigos: [`<msl-metrica-card icono="mdi:cart" valor="42" etiqueta="Pedidos"></msl-metrica-card>`],
  },
  {
    id: "msl-auth-form", grupo: "Componentes", titulo: "msl-auth-form",
    html: `
      <h1>msl-auth-form</h1>
      <is-callout>Evento <code>msl-login</code>. Esta demo pega al tenant <code>demo</code>.</is-callout>
      ${marco(`<msl-auth-form titulo="Acceso demo"></msl-auth-form>`)}`,
    codigos: [`<msl-auth-form titulo="Acceso"></msl-auth-form>`],
  },
  {
    id: "msl-imagen-input", grupo: "Componentes", titulo: "msl-imagen-input",
    html: `
      <h1>msl-imagen-input</h1>
      <p>Tres variantes en el navegador (2048 / 1024 / 320). El Worker no procesa imágenes.</p>
      <is-callout>La demo no sube: hace falta sesión con <code>POST:/api/archivos</code>.</is-callout>
      ${marco(`<msl-imagen-input label="Fotos del producto" multiple entidad="producto"></msl-imagen-input>`)}`,
    codigos: [`<msl-imagen-input label="Imágenes" multiple entidad="producto" entidad-id="7"></msl-imagen-input>`],
  },
  {
    id: "gamificacion", grupo: "Gamificación", titulo: "Capas Temu (kit)",
    html: `
      <h1>Gamificación por CDN</h1>
      <p>Seis motores en <code>msl-juego.js</code>. <code>cargarKit("gamificacion")</code>.</p>
      ${ed("javascript")}
      <table>
        <tr><th>Capa</th><th>Tags</th></tr>
        <tr><td>1 Juegos</td><td><code>msl-juego-suerte</code> <code>msl-juego-asintota</code> <code>msl-juego-mision</code></td></tr>
        <tr><td>2 Urgencia</td><td><code>msl-juego-cuenta</code> <code>msl-juego-escasez</code> <code>msl-juego-barra</code></td></tr>
        <tr><td>3 Descubrimiento</td><td><code>msl-juego-feed</code> <code>msl-juego-paquete</code></td></tr>
        <tr><td>4 Precio ancla</td><td><code>msl-juego-precio</code> <code>msl-juego-cupon</code></td></tr>
        <tr><td>5 Referidos</td><td><code>msl-juego-referido</code> <code>msl-juego-grupo</code></td></tr>
        <tr><td>6 Retención</td><td><code>msl-juego-alerta</code> <code>msl-juego-salida</code></td></tr>
      </table>
      ${marco(`
        <msl-juego-salida></msl-juego-salida>
        <is-grid-layout cells="2" gap="0.75rem">
          <msl-juego-ficha id="lab-ficha-fake" modo="simulada" ciclo="diario"></msl-juego-ficha>
          <msl-juego-ficha id="lab-ficha-real" modo="real" ciclo="mes-semana-1"></msl-juego-ficha>
        </is-grid-layout>
        <msl-juego-barra id="lab-barra" actual="4200000" umbral="5000000" premio="envío gratis"></msl-juego-barra>
        <msl-juego-asintota puntos="48" premio="Caja del mes"></msl-juego-asintota>
        <msl-juego-mision></msl-juego-mision>
        <msl-juego-suerte tipo="ruleta"></msl-juego-suerte>
        <msl-juego-cupon cuenta="anon"></msl-juego-cupon>
        <msl-juego-cuenta durante="90s" clave="lab-sesion" rotulo="Oferta relámpago"></msl-juego-cuenta>
        <msl-juego-feed id="lab-feed"></msl-juego-feed>
        <msl-juego-paquete id="lab-paquete"></msl-juego-paquete>
        <msl-juego-referido codigo="demo"></msl-juego-referido>
        <msl-juego-grupo actual="2" meta="5"></msl-juego-grupo>
        <is-button id="lab-alerta-btn" variant="text">Probar alerta in-app</is-button>
        <msl-juego-alerta id="lab-alerta" titulo="Cupón a punto de vencer" cuerpo="Te quedan minutos."></msl-juego-alerta>
      `, "Laboratorio")}`,
    codigos: [
      `const { cargarKit } = await import("…/cdn/msl-loader.js");
await cargarKit("gamificacion");`,
      `<msl-juego-ficha modo="simulada" ciclo="diario" producto='{"nombre":"Genovesa","precio":1940000}'></msl-juego-ficha>`,
    ],
    montar() {
      const fake = { id: "g1", nombre: "Genovesa clásica", precio: 1940000, inflar: 1.6, moneda: "COP", img: "https://picsum.photos/seed/genovesa/400" };
      const real = { id: "g2", nombre: "Combo fiesta", precio: 9000000, descuento: 25, moneda: "COP", img: "https://picsum.photos/seed/combo/400" };
      document.getElementById("lab-ficha-fake")?.setAttribute("producto", JSON.stringify(fake));
      document.getElementById("lab-ficha-real")?.setAttribute("producto", JSON.stringify(real));
      document.getElementById("lab-feed")?.setAttribute("items", JSON.stringify([
        { nombre: "Mini genovesa", precio: 800000, img: "https://picsum.photos/seed/mini/200", modo: "simulada", inflar: 1.4 },
        { nombre: "Palitroquis", precio: 1000000, img: "https://picsum.photos/seed/pali/200", modo: "real", descuento: 10 },
        { nombre: "Cobito", precio: 1200000, img: "https://picsum.photos/seed/cobito/200", modo: "simulada", inflar: 1.7 },
      ]));
      document.getElementById("lab-paquete")?.setAttribute("items", JSON.stringify([
        { id: "vela", nombre: "Velita", precio: 400000 },
        { id: "agua", nombre: "Agua", precio: 390000 },
      ]));
      const btn = document.getElementById("lab-alerta-btn");
      if (btn) btn.onclick = () => document.getElementById("lab-alerta")?.setAttribute("abierta", "");
    },
  },
  {
    id: "msl-juego-precio", grupo: "Gamificación", titulo: "msl-juego-precio",
    html: `
      <h1>msl-juego-precio</h1>
      <is-callout>Color del host (<code>color</code> CSS); hijos <code>currentColor</code>.
      Tamaño: <code>font-size</code>. Centavos.</is-callout>
      ${marco(`
        <p>Simulada (paga $19.400)</p>
        <msl-juego-precio centavos="1940000" modo="simulada" inflar="1.55"></msl-juego-precio>
        <p>Real −30% · font-size 1.35em</p>
        <msl-juego-precio style="font-size:1.35em" centavos="1940000" modo="real" descuento="30"></msl-juego-precio>
      `)}`,
    codigos: [`<msl-juego-precio centavos="1940000" modo="simulada" inflar="1.55"></msl-juego-precio>
<msl-juego-precio style="font-size:1.35em" centavos="1940000" modo="real" descuento="30"></msl-juego-precio>`],
  },
  {
    id: "msl-juego-cuenta", grupo: "Gamificación", titulo: "msl-juego-cuenta",
    html: `
      <h1>msl-juego-cuenta</h1>
      <p>Ciclos: <code>diario</code>, <code>semanal</code>, <code>mes-semana-1</code>, <code>hasta</code> ISO, <code>durante="2h"</code>.</p>
      ${marco(`
        <msl-juego-cuenta ciclo="diario" rotulo="Hoy termina"></msl-juego-cuenta>
        <msl-juego-cuenta ciclo="mes-semana-1" rotulo="Semana 1 del mes"></msl-juego-cuenta>
      `)}`,
    codigos: [`<msl-juego-cuenta ciclo="mes-semana-1" rotulo="Promo válida hasta"></msl-juego-cuenta>`],
  },
  {
    id: "msl-juego-ficha", grupo: "Gamificación", titulo: "msl-juego-ficha",
    html: `
      <h1>msl-juego-ficha</h1>
      <p>Card Temu: ancla + timer + escasez. JSON <code>producto</code>.</p>
      ${marco(`<msl-juego-ficha id="demo-ficha" modo="simulada" ciclo="diario"></msl-juego-ficha>`)}`,
    codigos: [`<msl-juego-ficha modo="simulada" ciclo="diario" producto='${JSON.stringify({ nombre: "Taza", precio: 1890000 })}'></msl-juego-ficha>`],
    montar() { document.getElementById("demo-ficha")?.setAttribute("producto", JSON.stringify(FICHA_DEMO)); },
  },
  {
    id: "msl-juego-escasez", grupo: "Gamificación", titulo: "msl-juego-escasez",
    html: `
      <h1>msl-juego-escasez</h1>
      <is-callout><code>tipo="simulado"</code>: hash sku+día.
      <code>tipo="real"</code>: WebSocket <code>/api/miradas/{app}/{sku}</code>.</is-callout>
      ${marco(`
        <msl-juego-escasez sku="taza-1" tipo="simulado"></msl-juego-escasez>
        <msl-juego-escasez sku="taza-1" tipo="real" style="font-size:1.15em"></msl-juego-escasez>
      `)}`,
    codigos: [`<msl-juego-escasez sku="taza-1" tipo="simulado"></msl-juego-escasez>
<msl-juego-escasez sku="taza-1" tipo="real" style="font-size:1.15em"></msl-juego-escasez>`],
  },
  {
    id: "msl-juego-barra", grupo: "Gamificación", titulo: "msl-juego-barra",
    html: `
      <h1>msl-juego-barra</h1>
      <p>Hueco hasta umbral. Centavos en <code>actual</code> / <code>umbral</code>.</p>
      ${marco(`<msl-juego-barra actual="3200000" umbral="5000000" premio="envío gratis"></msl-juego-barra>`)}`,
    codigos: [`<msl-juego-barra actual="3200000" umbral="5000000" premio="envío gratis"></msl-juego-barra>`],
  },
  {
    id: "msl-juego-asintota", grupo: "Gamificación", titulo: "msl-juego-asintota",
    html: `
      <h1>msl-juego-asintota</h1>
      <p>Sube rápido al ~99% y se frena. El último 1% pide racha o compra.</p>
      ${marco(`<msl-juego-asintota puntos="48" premio="Caja del mes"></msl-juego-asintota>`)}`,
    codigos: [`<msl-juego-asintota puntos="48" premio="Caja del mes"></msl-juego-asintota>`],
  },
  {
    id: "msl-juego-mision", grupo: "Gamificación", titulo: "msl-juego-mision",
    html: `
      <h1>msl-juego-mision</h1>
      <p>Racha diaria + tareas. Evento <code>msl-juego-mision</code>.</p>
      ${marco(`<msl-juego-mision></msl-juego-mision>`)}`,
    codigos: [`<msl-juego-mision></msl-juego-mision>`],
  },
  {
    id: "msl-juego-suerte", grupo: "Gamificación", titulo: "msl-juego-suerte",
    html: `
      <h1>msl-juego-suerte</h1>
      <p><code>tipo</code>: ruleta, cofre, rasca. Un giro por día. Evento <code>msl-juego-premio</code>.</p>
      ${marco(`<msl-juego-suerte tipo="ruleta"></msl-juego-suerte>`)}`,
    codigos: [`<msl-juego-suerte tipo="ruleta"></msl-juego-suerte>`],
  },
  {
    id: "msl-juego-feed", grupo: "Gamificación", titulo: "msl-juego-feed",
    html: `
      <h1>msl-juego-feed</h1>
      <p>JSON <code>items</code> con modo simulada/real.</p>
      ${marco(`<msl-juego-feed id="demo-feed"></msl-juego-feed>`)}`,
    codigos: [`<msl-juego-feed items='[{"nombre":"Mini","precio":800000,"modo":"simulada"}]'></msl-juego-feed>`],
    montar() {
      document.getElementById("demo-feed")?.setAttribute("items", JSON.stringify([
        { nombre: "Mini", precio: 800000, modo: "simulada", inflar: 1.4, img: "https://picsum.photos/seed/mini2/200" },
        { nombre: "Combo", precio: 5000000, modo: "real", descuento: 20, img: "https://picsum.photos/seed/combo2/200" },
      ]));
    },
  },
  {
    id: "msl-juego-paquete", grupo: "Gamificación", titulo: "msl-juego-paquete",
    html: `
      <h1>msl-juego-paquete</h1>
      <p>Cross-sell. Evento <code>msl-juego-sumar</code>.</p>
      ${marco(`<msl-juego-paquete id="demo-paquete"></msl-juego-paquete>`)}`,
    codigos: [`<msl-juego-paquete items='[{"id":"vela","nombre":"Velita","precio":400000}]'></msl-juego-paquete>`],
    montar() {
      document.getElementById("demo-paquete")?.setAttribute("items", JSON.stringify([
        { id: "vela", nombre: "Velita", precio: 400000 },
        { id: "agua", nombre: "Agua", precio: 390000 },
      ]));
    },
  },
  {
    id: "msl-juego-cupon", grupo: "Gamificación", titulo: "msl-juego-cupon",
    html: `
      <h1>msl-juego-cupon</h1>
      <p>Cupones en localStorage. Caducidad con <code>msl-juego-cuenta</code>.</p>
      ${marco(`<msl-juego-cupon cuenta="anon"></msl-juego-cupon>`)}`,
    codigos: [`<msl-juego-cupon cuenta="anon"></msl-juego-cupon>`],
  },
  {
    id: "msl-juego-referido", grupo: "Gamificación", titulo: "msl-juego-referido",
    html: `
      <h1>msl-juego-referido</h1>
      <p>Enlace <code>?ref=</code>. Evento <code>msl-juego-ref</code>.</p>
      ${marco(`<msl-juego-referido codigo="demo"></msl-juego-referido>`)}`,
    codigos: [`<msl-juego-referido codigo="demo"></msl-juego-referido>`],
  },
  {
    id: "msl-juego-grupo", grupo: "Gamificación", titulo: "msl-juego-grupo",
    html: `
      <h1>msl-juego-grupo</h1>
      <p>Compra colectiva: <code>actual</code> / <code>meta</code>.</p>
      ${marco(`<msl-juego-grupo actual="2" meta="5"></msl-juego-grupo>`)}`,
    codigos: [`<msl-juego-grupo actual="2" meta="5"></msl-juego-grupo>`],
  },
  {
    id: "msl-juego-alerta", grupo: "Gamificación", titulo: "msl-juego-alerta",
    html: `
      <h1>msl-juego-alerta</h1>
      <p>Popup in-app. Booleano <code>abierta</code>.</p>
      ${marco(`
        <is-button id="demo-alerta-btn" variant="text">Abrir alerta</is-button>
        <msl-juego-alerta id="demo-alerta" titulo="El cupón vence" cuerpo="Úsalo antes de que se apague el timer."></msl-juego-alerta>
      `)}`,
    codigos: [`<msl-juego-alerta abierta titulo="Aviso" cuerpo="Texto"></msl-juego-alerta>`],
    montar() {
      const b = document.getElementById("demo-alerta-btn");
      if (b) b.onclick = () => document.getElementById("demo-alerta")?.setAttribute("abierta", "");
    },
  },
  {
    id: "msl-juego-salida", grupo: "Gamificación", titulo: "msl-juego-salida",
    html: `
      <h1>msl-juego-salida</h1>
      <p>Intercepta el mouse hacia la pestaña (una vez al día) y abre un giro extra.</p>
      ${marco(`<msl-juego-salida></msl-juego-salida><p>Sube el cursor hacia la pestaña del navegador.</p>`)}`,
    codigos: [`<msl-juego-salida></msl-juego-salida>`],
  },
  {
    id: "temizacion", grupo: "Sistema", titulo: "Temización camaleónica",
    html: `
      <h1>Temización camaleónica</h1>
      <p>Tema del kit is-webcomponents: <code>data-theme</code> y <code>data-palette</code>.</p>
      <table>
        <tr><th>Pieza</th><th>Quién la pone</th></tr>
        <tr><td><code>is-theme-toggle</code></td><td>Claro/oscuro</td></tr>
        <tr><td><code>is-palette-selector</code></td><td>Paletas del tenant</td></tr>
        <tr><td><code>GET /tema/{app}/{paleta}.css</code></td><td>API desde el color de marca</td></tr>
      </table>
      <is-callout>Ningún CSS del ecosistema escribe un color literal. Todo sale de <code>--is-*</code>.</is-callout>
      ${ed("javascript")}`,
    codigos: [`import { montarControlesTema } from ".../cdn/msl-tema.js";
montarControlesTema(document.getElementById("controles"), cfg.paletas);`],
  },
];

const lateral = document.getElementById("lateral");
const contenido = document.getElementById("contenido");

let grupoActual = "";
lateral.innerHTML = SECCIONES.map((s) => {
  const grupo = s.grupo !== grupoActual ? `<div class="grupo">${s.grupo}</div>` : "";
  grupoActual = s.grupo;
  return `${grupo}<is-button variant="ghost" color="neutral" data-sec="${s.id}">${s.titulo}</is-button>`;
}).join("");

function abrir(id) {
  const s = SECCIONES.find((x) => x.id === id) || SECCIONES[0];
  contenido.innerHTML = s.html;
  sembrar(contenido, s.codigos || []);
  s.montar?.();
  ajustarSplits(contenido);
  for (const b of lateral.querySelectorAll("[data-sec]")) {
    const on = b.dataset.sec === s.id;
    b.setAttribute("aria-pressed", String(on));
    b.setAttribute("variant", on ? "soft" : "ghost");
    b.setAttribute("color", on ? "brand" : "neutral");
  }
  if (location.hash.slice(1) !== s.id) history.replaceState(null, "", "#" + s.id);
}

lateral.addEventListener("click", (e) => {
  const b = e.target.closest("[data-sec]");
  if (b) abrir(b.dataset.sec);
});

const { cargarKit } = await import("./cdn/msl-loader.js");
const { MslCliente } = await import("./cdn/msl-cliente.js");
const { aplicarTemaClaroOscuro, temaInicial, montarControlesTema } = await import("./cdn/msl-tema.js");
await cargarKit();
aplicarTemaClaroOscuro(temaInicial());
montarControlesTema(document.getElementById("doc-tema"), []);
MslCliente.configurar({ app: "demo" });
window.addEventListener("hashchange", () => abrir(location.hash.slice(1)));
abrir(location.hash.slice(1) || "inicio");
