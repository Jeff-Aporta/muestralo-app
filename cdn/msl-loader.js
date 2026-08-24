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
];

// Componentes msl-* propios del ecosistema.
const COMPONENTES = [
  "msl-producto-card", "msl-carrito-panel", "msl-auth-form",
  "msl-pedido-card", "msl-metrica-card", "msl-imagen-input",
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

export async function cargarKit(tagsExtra = []) {
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
  await L.load(...new Set([...TAGS_IS, ...tagsExtra]));
  const base = baseCdn();
  cargarHojaKit(base);
  await Promise.all(COMPONENTES.map((nombre) => import(`${base}/components/${nombre}.js`)));
}
