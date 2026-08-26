// Tema del tenant: claro/oscuro + paleta is-* si el tenant las declara.
// Sin paletas: no se pinta el selector (evita chip huérfano tipo contapyme).
import { MslCliente } from "./msl-cliente.js";

const LS_TEMA = "msl.tema";
const clavePaleta = () => window.MSL_BOOT?.paletaKey || "is-palette";

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

// Arranca identidad: claro/oscuro + paleta de marca del tenant.
// Devuelve config: nombre, meta, departamentos, paletas.
export async function aplicarTema(cfgPrevia = null) {
  aplicarTemaClaroOscuro(temaInicial());
  const cfg = cfgPrevia ?? (await MslCliente.config().catch(() => null));
  if (!cfg) return null;

  // Marca = CSS local de cada app. No inyectar css_vars de la API.
  const paletas = cfg.paletas || [];
  if (!paletas.length) {
    document.documentElement.removeAttribute("data-palette");
  } else if (!window.MSL_BOOT?.paletaCss) {
    precargarPaleta(paletas, localStorage.getItem(clavePaleta()) || paletas[0].value);
  } else {
    const id = localStorage.getItem(clavePaleta()) || paletas[0].value;
    document.documentElement.dataset.palette = id;
  }
  if (cfg.nombre) document.title = cfg.nombre;
  return cfg;
}

// Monta controles nativos del kit. Sin envoltorio propio.
export function montarControlesTema(contenedor, paletas = []) {
  if (!contenedor) return;
  contenedor.classList.add("msl-controles-tema");
  contenedor.replaceChildren();
  if (paletas.length) {
    const selector = document.createElement("is-palette-selector");
    selector.setAttribute("aria-label", "Elegir paleta");
    selector.setAttribute("storage-key", clavePaleta());
    selector.setAttribute("palettes", JSON.stringify(paletas));
    const paleta = localStorage.getItem(clavePaleta());
    if (paleta) selector.setAttribute("value", paleta);
    selector.addEventListener("is-palette-change", (e) => {
      const v = e.detail?.value;
      if (v) document.documentElement.dataset.palette = v;
    });
    contenedor.append(selector);
  }
  const toggle = document.createElement("is-theme-toggle");
  if (document.documentElement.dataset.theme === "dark") toggle.setAttribute("dark", "");
  toggle.addEventListener("is-theme-change", (e) => aplicarTemaClaroOscuro(e.detail?.theme));
  contenedor.append(toggle);
}

// Formatea centavos a moneda legible.
export function dinero(centavos, moneda = "COP") {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: moneda, maximumFractionDigits: 0 })
    .format((centavos || 0) / 100);
}
