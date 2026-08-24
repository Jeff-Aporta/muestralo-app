// Tema del tenant: la marca es dato, el CSS lo genera la API.
//
// No se inventa un sistema de temización: se usa el de is-webcomponents.
//   <html data-palette="X">        paleta de marca  → <is-palette-selector>
//   <html data-theme="dark|light"> claro / oscuro   → <is-theme-toggle>
// Cada paleta del tenant trae su `css` (GET /tema/{app}/{paleta}.css); el
// selector la inyecta bajo demanda, así no se precargan las cinco hojas.
import { MslCliente } from "./msl-cliente.js";

const LS_TEMA = "msl.tema";
const LS_PALETA = "is-palette"; // misma clave que usa is-palette-selector

// Preferencia guardada, si no la del sistema.
export function temaInicial() {
  const guardado = localStorage.getItem(LS_TEMA);
  if (guardado === "dark" || guardado === "light") return guardado;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Escribe el tema donde is-webcomponents lo lee: clase + data-theme.
export function aplicarTemaClaroOscuro(tema) {
  const html = document.documentElement;
  html.classList.toggle("theme-dark", tema === "dark");
  html.classList.toggle("theme-light", tema !== "dark");
  html.dataset.theme = tema;
  localStorage.setItem(LS_TEMA, tema);
  return tema;
}

// Precarga la hoja de la paleta activa para que no haya destello de marca.
function precargarPaleta(paletas, valor) {
  const p = paletas.find((x) => x.value === valor) ?? paletas[0];
  if (!p?.css) return null;
  document.documentElement.dataset.palette = p.value;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.dataset.mslPaleta = p.value;
  link.href = p.css;
  document.head.append(link);
  return p;
}

/**
 * Arranca la identidad: tema claro/oscuro + paleta de marca del tenant.
 * Devuelve la config para que el sitio use nombre, meta y departamentos.
 */
export async function aplicarTema(cfgPrevia = null) {
  aplicarTemaClaroOscuro(temaInicial());
  const cfg = cfgPrevia ?? (await MslCliente.config().catch(() => null));
  if (!cfg) return null;

  // css_vars sueltas: escotilla para ajustes finos del tenant.
  for (const [k, v] of Object.entries(cfg.css_vars || {})) {
    document.documentElement.style.setProperty(k, v);
  }
  const paletas = cfg.paletas || [];
  if (paletas.length) {
    precargarPaleta(paletas, localStorage.getItem(LS_PALETA) || paletas[0].value);
  }
  if (cfg.nombre) document.title = cfg.nombre;
  return cfg;
}

/**
 * Monta los controles nativos del kit en un contenedor.
 * No los envuelve en componentes propios: se usan tal cual.
 */
export function montarControlesTema(contenedor, paletas = []) {
  if (!contenedor) return;
  contenedor.replaceChildren();
  contenedor.classList.add("msl-controles-tema");

  const selector = document.createElement("is-palette-selector");
  selector.setAttribute("aria-label", "Elegir paleta");
  selector.setAttribute("storage-key", LS_PALETA);
  if (paletas.length) selector.setAttribute("palettes", JSON.stringify(paletas));
  const paleta = localStorage.getItem(LS_PALETA);
  if (paleta) selector.setAttribute("value", paleta);
  selector.addEventListener("is-palette-change", (e) => {
    const v = e.detail?.value;
    if (v) document.documentElement.dataset.palette = v;
  });

  const toggle = document.createElement("is-theme-toggle");
  if (document.documentElement.dataset.theme === "dark") toggle.setAttribute("dark", "");
  toggle.addEventListener("is-theme-change", (e) => {
    aplicarTemaClaroOscuro(e.detail.theme);
  });

  contenedor.append(selector, toggle);
}

// Formatea centavos a moneda legible.
export function dinero(centavos, moneda = "COP") {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: moneda, maximumFractionDigits: 0 })
    .format((centavos || 0) / 100);
}
