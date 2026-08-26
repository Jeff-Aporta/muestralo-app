// Chrome de la tienda: una sola plantilla para todas las vistas y todos los tenants.
// El HTML se hornea (SEO + primer pintado). Los tags msl-* solo nombran el bloque.

function paginasSitio(base) {
  return [
    { id: "inicio", href: base, nombre: "Inicio" },
    { id: "menu", href: `${base}menu/`, nombre: "Menú" },
    { id: "promociones", href: `${base}promociones/`, nombre: "Promociones" },
    { id: "sedes", href: `${base}sedes/`, nombre: "Sedes" },
  ];
}

export function htmlTopbar({
  esc, nombre, icono, prefijo, departamentos, actual, vista, paletas = [], paletaKey = "is-palette",
  paginas, logo, sinDeptos = false, sinTema = false, sinSesion = false, conBuscar = false,
}) {
  const base = prefijo || "./";
  const sit = (paginas || paginasSitio(base)).map((p) =>
    `<a href="${p.href}"${vista === p.id ? ' aria-current="page"' : ""}>${esc(p.nombre)}</a>`).join("");
  const nav = departamentos.map((d) =>
    `<a href="${base}menu/#${esc(d.id)}"${actual === d.id ? ' aria-current="page"' : ""}>${esc(d.nombre)}</a>`).join("");
  const paletasAttr = paletas.length
    ? ` palettes="${esc(JSON.stringify(paletas.map(({ value, label, accent }) => ({ value, label, accent }))))}"`
    : "";
  const chip = logo
    ? `<img class="marca-logo" src="${esc(logo)}" alt="${esc(nombre)}" height="52">`
    : `<span class="marca-chip"><is-icon icon="${esc(icono)}"></is-icon></span>${esc(nombre)}`;
  return `<msl-topbar>
  <div class="msl-topbar-capa">
    <a id="marca" href="${base}">${chip}</a>
    <nav class="sitio" aria-label="Sitio">${sit}</nav>
    <div class="topbar-fin">
      ${sinTema ? "" : `<div id="controles-tema" class="msl-controles-tema">
        <is-palette-selector aria-label="Paleta" storage-key="${esc(paletaKey)}"${paletasAttr}></is-palette-selector>
        <is-theme-toggle></is-theme-toggle>
      </div>`}
      ${conBuscar ? `<a class="msl-ico" href="#" aria-label="Buscar"><is-icon icon="mdi:magnify"></is-icon></a>` : ""}
      <a href="${base}pedidos/" id="enlace-pedidos" hidden title="Mis pedidos"><is-icon icon="mdi:receipt-text-outline"></is-icon></a>
      <a href="${base}carrito/" title="Carrito"><is-icon icon="mdi:cart-outline"></is-icon><span id="carrito-n"></span></a>
      ${sinSesion ? "" : `<is-button id="btn-sesion" variant="text" color="neutral" title="Cuenta"><is-icon icon="mdi:account-outline"></is-icon></is-button>`}
    </div>
  </div>
  ${sinDeptos ? "" : `<nav class="deptos" aria-label="Departamentos">${nav}</nav>`}
</msl-topbar>`;
}

export function htmlPaginaAdmin({ esc, idioma, nombre, api, app, kitIs, kitCdn, adminLocal }) {
  const CDN_ADMIN = "https://jeff-aporta.github.io/muestralo-admin";
  const localRel = `${adminLocal || "../../../../admin"}/`;
  return `<!doctype html>
<html lang="${esc(idioma)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Admin — ${esc(nombre)}</title>
<meta name="robots" content="noindex,nofollow">
<link rel="preconnect" href="${esc(api)}" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${esc(kitIs)}/is-base.min.css">
<link id="adm-css" rel="stylesheet" href="${CDN_ADMIN}/css/admin.css">
<script>
  (function () {
    var local = /^(127\\.0\\.0\\.1|localhost)$/.test(location.hostname);
    var admin = local
      ? new URL(${JSON.stringify(localRel)}, location.href).href.replace(/\\/+$/, "")
      : ${JSON.stringify(CDN_ADMIN)};
    document.getElementById("adm-css").href = admin + "/css/admin.css";
    window.__MSL_ADMIN_JS = admin + "/js/admin.js";
  })();
</script>
</head>
<body>
<div id="raiz"></div>
<script>
  localStorage.setItem("msl.app", ${JSON.stringify(app)});
  localStorage.setItem("msl.api", ${JSON.stringify(api)});
  ${kitCdn ? `window.MSL_CDN = new URL(${JSON.stringify(kitCdn)}, location.href).href.replace(/\\/+$/, "");` : ""}
</script>
<script type="module">import(window.__MSL_ADMIN_JS);</script>
</body>
</html>
`;
}

export function htmlPie({ esc, nombre, meta, prefijo, departamentos, bloques, sinCredito = false }) {
  if (bloques) return `<msl-pie>${bloques}</msl-pie>`;
  const base = prefijo || "./";
  const sedes = (meta.sedes || []).map((s) => `<li>${esc(s.nombre)} — ${esc(s.direccion || "")}</li>`).join("")
    || "<li>Solo en línea</li>";
  return `<msl-pie>
  <div class="msl-pie-capa">
    <div>
      <h3><a href="${base}">${esc(nombre)}</a></h3>
      <p>${esc(meta.descripcion || meta.eslogan || "")}</p>
    </div>
    <div>
      <h3>Sitio</h3>
      <ul>
        <li><a href="${base}">Inicio</a></li>
        <li><a href="${base}menu/">Menú</a></li>
        <li><a href="${base}promociones/">Promociones</a></li>
        <li><a href="${base}sedes/">Sedes</a></li>
        <li><a href="${base}admin/">Admin</a></li>
      </ul>
    </div>
    <div>
      <h3>Departamentos</h3>
      <ul>${departamentos.map((d) => `<li><a href="${base}menu/#${esc(d.id)}">${esc(d.nombre)}</a></li>`).join("")}</ul>
    </div>
    <div>
      <h3>Dónde estamos</h3>
      <ul>${sedes}</ul>
    </div>
    ${sinCredito ? "" : `<p class="pie-credito">${esc(nombre)} · catálogo con <a href="https://github.com/Jeff-Aporta/muestralo-app" rel="noopener">Muéstralo</a></p>`}
  </div>
</msl-pie>`;
}

export function htmlDialogoSesion() {
  return `<dialog id="dlg-sesion"><msl-auth-form></msl-auth-form></dialog>`;
}
