// Cache de respuestas en IndexedDB — fachada sobre is-webcomponents.
// Pinta al instante lo ultimo conocido. Rehace solo si servidor difiere.
const base = (typeof globalThis.IS_CDN === "string" && globalThis.IS_CDN)
  ? String(globalThis.IS_CDN).replace(/\/$/, "")
  : "https://cdn.jsdelivr.net/gh/Jeff-Aporta/is-webcomponents@main/dist/cdn";

const { createResponseCache, canonico: canonicoKit } = await import(
  `${base}/helpers/response-cache.min.js`
);

const cache = createResponseCache({
  dbName: "muestralo",
  storeName: "respuestas",
  ttlMs: 7 * 24 * 60 * 60 * 1000,
});

export const canonico = canonicoKit;
export const claveDe = (opts) => cache.claveDe(opts);
export const leer = (clave) => cache.leer(clave);
export const guardar = (clave, datos) => cache.guardar(clave, datos);
export const borrar = (clave) => cache.borrar(clave);
export const invalidar = (coincide) => cache.invalidar(coincide);
export const vaciar = () => cache.vaciar();
