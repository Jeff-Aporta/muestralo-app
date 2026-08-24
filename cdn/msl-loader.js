// Cargador del kit Muéstralo: IS Web Components por CDN + componentes msl-*.
// Una sola definición aquí; app/, admin/ y main/ llaman cargarKit() y ya.
//
// Publicado: https://cdn.jsdelivr.net/gh/Jeff-Aporta/muestralo-app@main/cdn/
// Local (dev): cada front fija window.MSL_CDN a la ruta relativa del kit.

const CDN_IS = "https://cdn.jsdelivr.net/gh/Jeff-Aporta/is-webcomponents@main/dist/cdn";

// Tags is-* que usa el ecosistema. Pedir fichero a fichero, no all.min.js.
const TAGS_IS = [
  "is-icon", "is-button", "is-input", "is-card", "is-dialog",
  "is-tab-group", "is-badge", "is-spinner", "is-toast", "is-select",
];

// Componentes msl-* propios del ecosistema.
const COMPONENTES = [
  "msl-producto-card", "msl-carrito-panel", "msl-auth-form",
  "msl-pedido-card", "msl-metrica-card",
];

export function baseCdn() {
  // window.MSL_CDN lo fija el front; sin él, jsDelivr publicado.
  return (window.MSL_CDN || "https://cdn.jsdelivr.net/gh/Jeff-Aporta/muestralo-app@main/cdn").replace(/\/+$/, "");
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
  for (const nombre of COMPONENTES) {
    await import(`${base}/components/${nombre}.js`);
  }
}
