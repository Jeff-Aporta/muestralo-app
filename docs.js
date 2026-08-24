// Visor del kit msl-*: catálogo de componentes con demos vivas por atributos.
// Corre sobre el propio repo: usa la copia local ./cdn (también en Pages).
window.MSL_CDN = "./cdn";
const { cargarKit } = await import("./cdn/msl-loader.js");
const { MslCliente } = await import("./cdn/msl-cliente.js");

await cargarKit();

// La demo de auth apunta al tenant demo real de la API.
MslCliente.configurar({ app: "demo" });

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
  items: [
    { id: 1, nombre: "Taza de cerámica esmaltada", cantidad: 2, personalizacion: { color: "negro" }, subtotal: 3780000 },
  ],
  total: 3780000,
};

const SECCIONES = [
  {
    id: "inicio", grupo: "General", titulo: "Kit msl-* de Muéstralo",
    html: `
      <h1>Kit msl-* de Muéstralo</h1>
      <p>Componentes y módulos del ecosistema Muéstralo. Se consumen por CDN, sin npm ni bundlers:</p>
      <pre>const { cargarKit } = await import(
  "https://cdn.jsdelivr.net/gh/Jeff-Aporta/muestralo-app@main/cdn/msl-loader.js");
await cargarKit();  // registra is-* (kit base) y todos los msl-*</pre>
      <h2>Regla de parámetros</h2>
      <p>Primitivos por <strong>atributos planos</strong> del tag; objetos complejos por
      <strong>atributo JSON</strong>. Todo componente se construye solo con HTML declarativo;
      la asignación por propiedad JS existe como azúcar (escribe el atributo).</p>
      <pre>&lt;msl-metrica-card icono="mdi:cart" valor="42" etiqueta="Pedidos"&gt;&lt;/msl-metrica-card&gt;

&lt;msl-producto-card producto='{"id":1,"nombre":"Taza","precio":1890000}'&gt;&lt;/msl-producto-card&gt;</pre>
      <h2>Módulos</h2>
      <table>
        <tr><th>Módulo</th><th>Qué expone</th></tr>
        <tr><td><code>msl-loader.js</code></td><td><code>cargarKit(tagsExtra)</code>, <code>baseCdn()</code></td></tr>
        <tr><td><code>msl-cliente.js</code></td><td><code>MslCliente</code>: único cliente fetch de la API (QUERY incluido)</td></tr>
        <tr><td><code>msl-tema.js</code></td><td><code>aplicarTema()</code> (css_vars del tenant en :root), <code>dinero(centavos, moneda)</code></td></tr>
        <tr><td><code>msl-core.js</code></td><td><code>esc</code>, <code>attrJson</code>, <code>setJsonAttr</code> (convención de atributos)</td></tr>
      </table>
      <h2>Molde generador</h2>
      <p>La carpeta <code>molde/</code> de este repo genera el sitio estático SEO de cada empresa
      (<code>node scripts/build.mjs</code>). Ver <code>business/README.md</code> del workspace.</p>`,
  },
  {
    id: "msl-producto-card", grupo: "Componentes", titulo: "msl-producto-card",
    html: `
      <h1>msl-producto-card</h1>
      <p>Atributo JSON <code>producto</code>. Eventos: <code>msl-ver</code>, <code>msl-agregar</code>.</p>
      <div class="demo"><msl-producto-card id="demo-producto"></msl-producto-card></div>
      <pre>&lt;msl-producto-card producto='${JSON.stringify(PRODUCTO)}'&gt;&lt;/msl-producto-card&gt;</pre>`,
    montar() { document.getElementById("demo-producto").producto = PRODUCTO; },
  },
  {
    id: "msl-carrito-panel", grupo: "Componentes", titulo: "msl-carrito-panel",
    html: `
      <h1>msl-carrito-panel</h1>
      <p>Atributo JSON <code>carrito</code>. Eventos: <code>msl-cantidad</code>, <code>msl-quitar</code>, <code>msl-congelar</code>.</p>
      <div class="demo"><msl-carrito-panel id="demo-carrito"></msl-carrito-panel></div>
      <pre>&lt;msl-carrito-panel carrito='{"items":[…],"total":3780000}'&gt;&lt;/msl-carrito-panel&gt;</pre>`,
    montar() { document.getElementById("demo-carrito").carrito = CARRITO; },
  },
  {
    id: "msl-pedido-card", grupo: "Componentes", titulo: "msl-pedido-card",
    html: `
      <h1>msl-pedido-card</h1>
      <p>Atributo JSON <code>pedido</code> + atributo plano <code>whatsapp-url</code>.</p>
      <div class="demo"><msl-pedido-card id="demo-pedido" whatsapp-url="https://wa.me/573001112233"></msl-pedido-card></div>
      <pre>&lt;msl-pedido-card pedido='{"codigo":"3k9",…}' whatsapp-url="https://wa.me/…"&gt;&lt;/msl-pedido-card&gt;</pre>`,
    montar() { document.getElementById("demo-pedido").pedido = PEDIDO; },
  },
  {
    id: "msl-metrica-card", grupo: "Componentes", titulo: "msl-metrica-card",
    html: `
      <h1>msl-metrica-card</h1>
      <p>Solo atributos planos: <code>icono</code>, <code>valor</code>, <code>etiqueta</code>.</p>
      <div class="demo">
        <msl-metrica-card icono="mdi:cart" valor="42" etiqueta="Pedidos"></msl-metrica-card>
        <msl-metrica-card icono="mdi:cash" valor="$1.2M" etiqueta="Ingresos"></msl-metrica-card>
      </div>
      <pre>&lt;msl-metrica-card icono="mdi:cart" valor="42" etiqueta="Pedidos"&gt;&lt;/msl-metrica-card&gt;</pre>`,
  },
  {
    id: "msl-auth-form", grupo: "Componentes", titulo: "msl-auth-form",
    html: `
      <h1>msl-auth-form</h1>
      <p>Atributos: <code>titulo</code>, <code>registro="false"</code> para ocultar crear cuenta.
      Evento: <code>msl-login</code> {token, nickname, rol}. Esta demo pega contra el tenant
      <code>demo</code> real de la API.</p>
      <div class="demo"><msl-auth-form titulo="Acceso demo"></msl-auth-form></div>
      <pre>&lt;msl-auth-form titulo="Acceso"&gt;&lt;/msl-auth-form&gt;</pre>`,
  },
];

const lateral = document.getElementById("lateral");
const contenido = document.getElementById("contenido");

let grupoActual = "";
lateral.innerHTML = SECCIONES.map((s) => {
  const grupo = s.grupo !== grupoActual ? `<div class="grupo">${s.grupo}</div>` : "";
  grupoActual = s.grupo;
  return `${grupo}<button data-sec="${s.id}">${s.titulo}</button>`;
}).join("");

function abrir(id) {
  const s = SECCIONES.find((x) => x.id === id) || SECCIONES[0];
  contenido.innerHTML = s.html;
  s.montar?.();
  for (const b of lateral.querySelectorAll("button")) {
    b.setAttribute("aria-pressed", String(b.dataset.sec === s.id));
  }
}

lateral.addEventListener("click", (e) => {
  const b = e.target.closest("button[data-sec]");
  if (b) abrir(b.dataset.sec);
});

abrir("inicio");
