// Cargador del kit Muéstralo: IS Web Components por CDN + componentes msl-*.
// Una sola definición; los fronts y empresas la consumen por jsDelivr.
// Publicado: https://cdn.jsdelivr.net/gh/Jeff-Aporta/muestralo-app@main/cdn/

const CDN_IS = "https://cdn.jsdelivr.net/gh/Jeff-Aporta/is-webcomponents@main/dist/cdn";
const CDN_MSL = "https://cdn.jsdelivr.net/gh/Jeff-Aporta/muestralo-app@main/cdn";

// Tags is-* que usa el ecosistema. Pedir fichero a fichero, no all.min.js.
const TAGS_IS = [
  "is-icon", "is-button", "is-input", "is-card", "is-dialog",
  "is-tab-group", "is-badge", "is-spinner", "is-toast", "is-select",
  // Temización nativa del kit: no se reimplementa nada de esto.
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
  // Fallback local: /is-webcomponents:local si jsDelivr no responde.
  let loaderUrl = `${CDN_IS}/loader.min.js`;
  try {
    const r = await fetch(loaderUrl, { method: "HEAD" });
    if (!r.ok) throw new Error("cdn");
  } catch {
    loaderUrl = "/is-webcomponents:local/loader.min.js";
  }
  const { ISWebComponentsLoader: L } = await import(loaderUrl);
  await L.load(...new Set([...TAGS_IS, ...tagsExtra]));
  const base = baseCdn();
  cargarHojaKit(base);
  for (const nombre of COMPONENTES) {
    await import(`${base}/components/${nombre}.js`);
  }
}
