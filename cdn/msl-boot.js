// Boot síncrono de tema: corre en <head> ANTES del primer pintado.
// Clases theme-dark|theme-light + data-theme + data-palette, como pide el kit.
// Personalizable: ?tema=dark|light  ?paleta=<id>  (se guardan y ganan).
(function () {
  var h = document.documentElement;
  var local = location.hostname === "127.0.0.1" || location.hostname === "localhost";
  if (local && !window.IS_CDN) {
    window.IS_CDN = location.origin + "/apps/is-webcomponents/dist/cdn";
  }
  try {
    var q = new URLSearchParams(location.search);
    if (q.get("tema") === "dark" || q.get("tema") === "light") {
      localStorage.setItem("msl.tema", q.get("tema"));
    }
    if (q.get("paleta")) localStorage.setItem("is-palette", q.get("paleta"));
  } catch (e) {}
  var t = null;
  try { t = localStorage.getItem("msl.tema"); } catch (e) {}
  if (t !== "dark" && t !== "light") {
    t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  h.classList.remove("theme-dark", "theme-light");
  h.classList.add(t === "dark" ? "theme-dark" : "theme-light");
  h.setAttribute("data-theme", t);
  var p = h.getAttribute("data-palette");
  try { p = localStorage.getItem("is-palette") || p; } catch (e) {}
  if (p) h.setAttribute("data-palette", p);
  // Hoja de la paleta elegida antes del primer pintado: sin destello de marca.
  // El sitio generado deja en window.MSL_BOOT {api, app}; sin eso no aplica.
  var cfg = window.MSL_BOOT;
  if (cfg && cfg.api && cfg.app && p) {
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.setAttribute("data-msl-paleta", p);
    l.href = cfg.api.replace(/\/+$/, "") + "/tema/" + cfg.app + "/" + p + ".css";
    document.head.appendChild(l);
  }
  var isCdn = window.IS_CDN;
  if (isCdn) {
    document.querySelectorAll("link[data-is-css]").forEach(function (l) {
      var n = l.getAttribute("data-is-css");
      l.href = isCdn.replace(/\/+$/, "") + (n === "paletas" ? "/palettes.min.css" : "/is-base.min.css");
    });
  }
})();
