// Núcleo del kit msl-*: convención de parámetros por atributos.
// Primitivos van como atributos planos; objetos complejos como atributo JSON.

// Escapa HTML de datos externos.
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Lee atributo JSON con fallback defensivo.
export function attrJson(el, nombre, fallback = null) {
  const crudo = el.getAttribute(nombre);
  if (crudo == null || crudo === "") return fallback;
  try { return JSON.parse(crudo); } catch { return fallback; }
}

// Escribe un objeto como atributo JSON (dispara attributeChangedCallback).
export function setJsonAttr(el, nombre, valor) {
  el.setAttribute(nombre, JSON.stringify(valor ?? null));
}
