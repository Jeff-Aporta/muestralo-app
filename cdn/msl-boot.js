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
    if (q.get("paleta")) localStorage.setItem((window.MSL_BOOT && window.MSL_BOOT.paletaKey) || "is-palette", q.get("paleta"));
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
  try {
    var pk = (window.MSL_BOOT && window.MSL_BOOT.paletaKey) || "is-palette";
    p = localStorage.getItem(pk) || p;
  } catch (e) {}
  if (p) h.setAttribute("data-palette", p);
  // Hoja de la paleta elegida antes del primer pintado: sin destello de marca.
  // El sitio generado deja en window.MSL_BOOT {api, app}; sin eso no aplica.
  var cfg = window.MSL_BOOT;
  // Hoja combinada horneada: no pedir API. Evita destello en visitas 2+.
  if (cfg && cfg.paletaCss) {
    try {
      var href = new URL(cfg.paletaHref || "css/paletas.css", location.href).href;
      if (window.caches) {
        caches.open("msl-paletas-v1").then(function (c) {
          c.match(href).then(function (hit) {
            if (hit) return;
            fetch(href).then(function (r) { if (r.ok) c.put(href, r.clone()); });
          });
        });
      }
    } catch (e) {}
  }
  var isCdn = window.IS_CDN;
  if (isCdn) {
    document.querySelectorAll("link[data-is-css]").forEach(function (l) {
      var n = l.getAttribute("data-is-css");
      l.href = isCdn.replace(/\/+$/, "") + (n === "paletas" ? "/palettes.min.css" : "/is-base.min.css");
    });
  }
})();
