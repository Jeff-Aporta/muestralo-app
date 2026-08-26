// Cargador del kit Muéstralo: IS Web Components por CDN + componentes msl-*.
// Una sola definición; los fronts y empresas la consumen por jsDelivr.
// Publicado: https://cdn.jsdelivr.net/gh/Jeff-Aporta/muestralo-app@main/cdn/

const CDN_IS = "https://cdn.jsdelivr.net/gh/Jeff-Aporta/is-webcomponents@main/dist/cdn";
const CDN_MSL = "https://cdn.jsdelivr.net/gh/Jeff-Aporta/muestralo-app@main/cdn";

function esLocal() {
  const h = location.hostname;
  return h === "127.0.0.1" || h === "localhost";
}

export function baseIsCdn() {
  if (window.IS_CDN) return String(window.IS_CDN).replace(/\/+$/, "");
  if (esLocal()) return `${location.origin}/apps/is-webcomponents/dist/cdn`;
  return CDN_IS;
}

// Tags is-* que usa el ecosistema. Pedir fichero a fichero, no all.min.js.
const TAGS_IS = [
  "is-icon", "is-button", "is-input", "is-card", "is-dialog",
  "is-badge", "is-spinner", "is-toast", "is-select", "is-option", "is-checkbox",
  "is-textarea",
  "is-check-icon-button", "is-stat", "is-file-input", "is-tab-group",
  "is-theme-toggle", "is-palette-selector",
  "is-demo", "is-code", "is-split-panel", "is-main", "is-callout",
  "is-grid-layout", "is-copy-button",
];

// Componentes msl-* propios del ecosistema.
const COMPONENTES = [
  "msl-producto-card", "msl-carrito-panel", "msl-auth-form",
  "msl-pedido-card", "msl-metrica-card", "msl-imagen-input",
  "msl-vitrina-hero", "msl-vitrina-producto", "msl-vitrina-coleccion", "msl-vitrina-banda",
  "msl-topbar", "msl-pie", "msl-carrusel", "msl-juego",
];

// window.MSL_CDN lo fija el consumidor (dev local o Pages); sin él, jsDelivr.
// Se absolutiza contra la PÁGINA: un valor relativo como "./cdn" resolvería
// contra la URL de este módulo y saldría duplicado (…/cdn/cdn/components/…).
export function baseCdn() {
  const crudo = (window.MSL_CDN || CDN_MSL).replace(/\/+$/, "");
  return new URL(crudo, document.baseURI).href.replace(/\/+$/, "");
}

// Hoja de los componentes msl-*: viaja con el kit, no se copia en cada front.
function cargarHojaKit(base) {
  if (document.querySelector('link[data-msl-kit]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.dataset.mslKit = "";
  link.href = `${base}/msl-kit.css`;
  document.head.append(link);
}

const TAGS_IS_TIENDA = [
  "is-icon", "is-button", "is-input", "is-card", "is-dialog",
  "is-badge", "is-spinner", "is-theme-toggle", "is-palette-selector",
];
const MSL_TIENDA = [
  "msl-producto-card", "msl-carrito-panel", "msl-auth-form", "msl-pedido-card",
  "msl-vitrina-hero", "msl-vitrina-producto", "msl-vitrina-coleccion", "msl-vitrina-banda",
  "msl-topbar", "msl-pie", "msl-carrusel", "msl-juego",
];

export async function cargarKit(arg = "completo") {
  const extra = Array.isArray(arg) ? arg : [];
  const perfil = typeof arg === "string" ? arg : "completo";
  const tagsIs = perfil === "tienda" || perfil === "gamificacion" ? TAGS_IS_TIENDA : TAGS_IS;
  const msl = perfil === "gamificacion" ? ["msl-juego"] : perfil === "tienda" ? MSL_TIENDA : COMPONENTES;
  const candidatos = [...new Set([baseIsCdn(), CDN_IS])];
  let L;
  let ultimo;
  for (const isCdn of candidatos) {
    try {
      ({ ISWebComponentsLoader: L } = await import(`${isCdn}/loader.min.js`));
      window.IS_CDN = isCdn;
      break;
    } catch (e) { ultimo = e; }
  }
  if (!L) throw ultimo;
  await L.load(...new Set([...tagsIs, ...extra]));
  const base = baseCdn();
  cargarHojaKit(base);
  await Promise.all(msl.map((nombre) => import(`${base}/components/${nombre}.js`)));
  instalarReportero();
}

// Captura global → is-errores. Si el registro falla, se traga.
function instalarReportero() {
  if (window.MSL_ERRORES) return;
  const tenant = String(window.MSL?.app || window.MSL_BOOT?.app || localStorage.getItem("msl.app") || "app")
    .toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 32);
  import("https://is-errores.jeffaporta.workers.dev/v1/cliente.js").then(({ crearReportero }) => {
    const errores = crearReportero({
      app: "web-muestralo",
      servidor: "https://is-errores.jeffaporta.workers.dev",
      contextoBase: { tenant, ruta: location.pathname, href: location.href },
    });
    errores.instalarCapturaGlobal();
    window.MSL_ERRORES = errores;
  }).catch(() => {});
}
