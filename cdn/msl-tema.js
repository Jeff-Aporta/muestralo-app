// Tema dinámico: inyecta las css_vars del tenant en :root.
// Toda la identidad visual llega de la API; el front estático no pisa colores.
import { MslCliente } from "./msl-cliente.js";

export async function aplicarTema() {
  const cfg = await MslCliente.config().catch(() => null);
  if (!cfg) return null;
  const raiz = document.documentElement;
  for (const [k, v] of Object.entries(cfg.css_vars || {})) raiz.style.setProperty(k, v);
  if (cfg.nombre) document.title = cfg.nombre;
  return cfg;
}

// Formatea centavos a moneda legible.
export function dinero(centavos, moneda = "COP") {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: moneda, maximumFractionDigits: 0 })
    .format((centavos || 0) / 100);
}
