// Tags msl-juego-*: urgencia, ancla de precio y juegos. Un módulo, 15 tags.
// Motor: ../msl-juego.js. Estilo: msl-kit.css. Portable por CDN.
import { dinero } from "../msl-tema.js";
import { esc, attrJson } from "../msl-core.js";
import {
  precioAncla, ventanaPromo, fmtRestante, parseDuracion,
  progresoAsintotico, escasezDe, rachaDiaria, misionesHoy, completarMision,
  sortear, cuponesDe, inyectarCupon, huecoBarra, leerJuego, escribirJuego, hoyClave,
} from "../msl-juego.js";

function a(el, n, d = "") { return el.getAttribute(n) ?? d; }
function n(el, k, d = 0) {
  const raw = el.getAttribute(k);
  if (raw == null || raw === "") return d;
  const v = Number(raw);
  return Number.isFinite(v) ? v : d;
}
function json(el, k, d) { return attrJson(el, k) ?? d; }
function fire(el, tipo, detail) { el.dispatchEvent(new CustomEvent(tipo, { detail, bubbles: true })); }

class Precio extends HTMLElement {
  static get observedAttributes() { return ["centavos", "modo", "inflar", "descuento", "moneda"]; }
  connectedCallback() { this.draw(); }
  attributeChangedCallback() { if (this.isConnected) this.draw(); }
  draw() {
    const p = precioAncla({
      centavos: n(this, "centavos"), modo: a(this, "modo", "simulada"),
      inflar: n(this, "inflar", 1.45), descuento: n(this, "descuento"),
    });
    const mon = a(this, "moneda", "COP");
    const fake = p.modo === "simulada";
    this.innerHTML = p.modo === "ninguna"
      ? `<strong class="msl-juego-oferta">${esc(dinero(p.oferta, mon))}</strong>`
      : `<span class="msl-juego-precio">
          <s>${esc(dinero(p.lista, mon))}</s>
          <strong class="msl-juego-oferta">${esc(dinero(p.oferta, mon))}</strong>
          <em class="msl-juego-sello">${fake ? "promo" : `−${p.pct}%`}</em>
          <small>${fake ? "ahorro percibido" : "descuento real"} ${esc(dinero(p.ahorro, mon))}</small>
        </span>`;
  }
}

class Cuenta extends HTMLElement {
  static get observedAttributes() { return ["ciclo", "hasta", "durante", "clave", "rotulo"]; }
  connectedCallback() { this._sesion(); this.draw(); this._t = setInterval(() => this.draw(), 1000); }
  disconnectedCallback() { clearInterval(this._t); }
  attributeChangedCallback() { this._fin = null; this._sesion(); this.draw(); }
  _sesion() {
    const dur = a(this, "durante");
    if (!dur) return;
    const k = "cuenta:" + (a(this, "clave") || this.id || "sesion");
    let st = leerJuego(k);
    if (!st?.fin || st.fin < Date.now()) st = escribirJuego(k, { fin: Date.now() + parseDuracion(dur) });
    this._fin = st.fin;
  }
  draw() {
    const rotulo = a(this, "rotulo", "Promo válida hasta");
    const v = this._fin
      ? { activa: this._fin > Date.now(), restante: Math.max(0, this._fin - Date.now()) }
      : ventanaPromo({ ciclo: a(this, "ciclo", "diario"), hasta: a(this, "hasta") || undefined });
    const viva = v.activa && v.restante > 0;
    this.dataset.estado = viva ? "viva" : "fuera";
    this.innerHTML = `<span class="msl-juego-cuenta">
      <is-icon icon="mdi:timer-sand"></is-icon>
      <em>${esc(rotulo)}</em>
      <strong>${viva ? esc(fmtRestante(v.restante)) : "terminó"}</strong>
    </span>`;
    if (!viva) {
      if (!this._avisoFin) { this._avisoFin = true; fire(this, "msl-juego-fin", v); }
    } else this._avisoFin = false;
  }
}

class Escasez extends HTMLElement {
  static get observedAttributes() { return ["sku", "quedan", "min", "max", "tipo"]; }
  connectedCallback() { this._unir(); this.pintar(); }
  disconnectedCallback() { this._cortar?.(); }
  attributeChangedCallback(k) {
    if (k === "sku" || k === "tipo") { this._unir(); }
    this.pintar();
  }
  _unir() {
    this._cortar?.();
    this._n = null;
    if (a(this, "tipo", "simulado") !== "real") return;
    const sku = a(this, "sku", "");
    if (!sku) return;
    import("../msl-cliente.js").then(({ MslCliente }) => {
      this._cortar = MslCliente.abrirMiradas(sku, (d) => {
        const n0 = this._n;
        this._n = Number(d?.n) || 0;
        this.pintar();
        if (n0 !== this._n) {
          fire(this, "msl-juego-mirada", { sku, n: this._n, tipo: "real" });
        }
      });
    }).catch(() => { this._n = 1; this.pintar(); });
  }
  pintar() {
    const sim = escasezDe(a(this, "sku", "x"), { min: n(this, "min", 2), max: n(this, "max", 8) });
    const q = this.hasAttribute("quedan") ? n(this, "quedan", sim.quedan) : sim.quedan;
    const real = a(this, "tipo", "simulado") === "real";
    const gente = real ? (this._n ?? "…") : sim.gente;
    this.innerHTML = `<p class="msl-juego-escasez"><is-icon icon="mdi:fire"></is-icon> Quedan <strong>${q}</strong> · ${gente} lo miran</p>`;
  }
}

class Barra extends HTMLElement {
  static get observedAttributes() { return ["actual", "umbral", "moneda", "premio"]; }
  connectedCallback() { this.draw(); }
  attributeChangedCallback() { this.draw(); }
  draw() {
    const h = huecoBarra({ actual: n(this, "actual"), umbral: n(this, "umbral") });
    const mon = a(this, "moneda", "COP");
    const premio = a(this, "premio", "envío gratis");
    this.innerHTML = `<div class="msl-juego-barra">
      <p>${h.falta ? `Agrega <strong>${esc(dinero(h.falta, mon))}</strong> para ${esc(premio)}` : `Listo: ${esc(premio)}`}</p>
      <div class="msl-juego-barra-via" role="progressbar" aria-valuenow="${h.pct}"><i style="width:${h.pct}%"></i></div>
    </div>`;
  }
}

class Asintota extends HTMLElement {
  static get observedAttributes() { return ["puntos", "premio"]; }
  connectedCallback() { this.draw(); }
  attributeChangedCallback() { this.draw(); }
  draw() {
    const vis = Math.round(progresoAsintotico(n(this, "puntos")) * 1000) / 10;
    this.innerHTML = `<div class="msl-juego-asintota">
      <p>${esc(a(this, "premio", "Caja misteriosa"))} · <strong>${vis}%</strong></p>
      <div class="msl-juego-barra-via"><i style="width:${Math.min(99.9, vis)}%"></i></div>
      <small>El último 1% pide racha, referidos o otra compra.</small>
    </div>`;
  }
}

const MISIONES = [
  { id: "entrar", texto: "Abrir la tienda hoy" },
  { id: "ver3", texto: "Mirar 3 productos" },
  { id: "carrito", texto: "Meter algo al carrito" },
];

class Mision extends HTMLElement {
  connectedCallback() { rachaDiaria(); this.draw(); }
  draw() {
    const lista = misionesHoy(json(this, "misiones", MISIONES));
    const r = leerJuego("racha", { dias: 0 });
    this.innerHTML = `<div class="msl-juego-mision">
      <p>Racha <strong>${r.dias}</strong> día${r.dias === 1 ? "" : "s"}</p>
      <ul>${lista.map((m) => `<li>
        <is-button data-m="${esc(m.id)}" ${m.hecha ? "disabled" : ""} variant="text">
          <is-icon icon="${m.hecha ? "mdi:check-circle" : "mdi:circle-outline"}"></is-icon> ${esc(m.texto)}
        </is-button></li>`).join("")}</ul>
    </div>`;
    this.querySelectorAll("[data-m]").forEach((b) => {
      b.onclick = () => { completarMision(b.dataset.m); this.draw(); fire(this, "msl-juego-mision", { id: b.dataset.m }); };
    });
  }
}

class Suerte extends HTMLElement {
  static get observedAttributes() { return ["tipo"]; }
  connectedCallback() { this.draw(); }
  attributeChangedCallback() { this.draw(); }
  draw() {
    const tipo = a(this, "tipo", "ruleta");
    const cta = { ruleta: "Girar", cofre: "Abrir", rasca: "Raspar" }[tipo] || "Jugar";
    this.innerHTML = `<div class="msl-juego-suerte" data-tipo="${esc(tipo)}">
      <div class="msl-juego-suerte-tablero"></div>
      <is-button data-x="jugar">${esc(cta)}</is-button>
      <p class="msl-juego-suerte-msg"></p>
    </div>`;
    this.querySelector("[data-x=jugar]").onclick = () => this.jugar();
  }
  jugar() {
    const k = "suerte:" + hoyClave() + ":" + (this.id || a(this, "tipo", "ruleta"));
    const msg = this.querySelector(".msl-juego-suerte-msg");
    if (leerJuego(k)) { msg.textContent = "Ya jugaste hoy. Vuelve mañana."; return; }
    const premios = json(this, "premios", [
      { id: "nada", texto: "Sigue intentando", peso: 5 },
      { id: "5", texto: "Cupón 5%", peso: 3 },
      { id: "envio", texto: "Envío gratis", peso: 1 },
    ]);
    const p = sortear(premios);
    escribirJuego(k, p);
    if (p.id !== "nada") inyectarCupon("anon", { texto: p.texto, vence: Date.now() + 36e5 * 6 });
    msg.textContent = p.texto;
    fire(this, "msl-juego-premio", p);
  }
}

class Feed extends HTMLElement {
  static get observedAttributes() { return ["items"]; }
  connectedCallback() { this.draw(); }
  attributeChangedCallback() { this.draw(); }
  draw() {
    const items = [...json(this, "items", [])].sort((x, y) => (x.precio || 0) - (y.precio || 0));
    this.innerHTML = `<div class="msl-juego-feed">${items.map((p) => `<a class="msl-juego-feed-item" href="${esc(p.href || "#")}">
      ${p.img ? `<img src="${esc(p.img)}" alt="">` : ""}<span>${esc(p.nombre)}</span>
      <msl-juego-precio centavos="${p.precio || 0}" modo="${esc(p.modo || "simulada")}" inflar="${p.inflar || 1.5}" descuento="${p.descuento || 0}" moneda="${esc(p.moneda || "COP")}"></msl-juego-precio>
    </a>`).join("")}</div>`;
  }
}

class Paquete extends HTMLElement {
  static get observedAttributes() { return ["items"]; }
  connectedCallback() { this.draw(); }
  attributeChangedCallback() { this.draw(); }
  draw() {
    const items = json(this, "items", []);
    this.innerHTML = `<div class="msl-juego-paquete"><p>Llena el pedido</p><ul>${items.map((p) =>
      `<li>${esc(p.nombre)} · ${esc(dinero(p.precio, p.moneda || "COP"))}
        <is-button data-id="${esc(p.id)}" variant="text">sumar</is-button></li>`).join("")}</ul></div>`;
    this.querySelectorAll("[data-id]").forEach((b) => {
      b.onclick = () => fire(this, "msl-juego-sumar", { id: b.dataset.id });
    });
  }
}

class Cupon extends HTMLElement {
  static get observedAttributes() { return ["cuenta"]; }
  connectedCallback() { this.draw(); }
  attributeChangedCallback() { this.draw(); }
  draw() {
    const lista = cuponesDe(a(this, "cuenta", "anon"));
    this.innerHTML = `<ul class="msl-juego-cupon">${lista.length
      ? lista.map((c) => `<li><strong>${esc(c.texto)}</strong>${c.vence
        ? ` <msl-juego-cuenta hasta="${new Date(c.vence).toISOString()}" rotulo="Caduca"></msl-juego-cuenta>` : ""}</li>`).join("")
      : "<li>Sin cupones. Gira la ruleta.</li>"}</ul>`;
  }
}

class Referido extends HTMLElement {
  connectedCallback() {
    const codigo = a(this, "codigo", "ronda");
    const url = `${location.origin}${location.pathname}?ref=${encodeURIComponent(codigo)}`;
    this.innerHTML = `<div class="msl-juego-referido">
      <p>Invita y ambos ganan crédito.</p><code>${esc(url)}</code>
      <is-button data-x="copiar" variant="text">Copiar enlace</is-button>
    </div>`;
    this.querySelector("[data-x=copiar]").onclick = async () => {
      try { await navigator.clipboard.writeText(url); } catch { /* */ }
      fire(this, "msl-juego-ref", { codigo, url });
    };
  }
}

class Grupo extends HTMLElement {
  static get observedAttributes() { return ["actual", "meta"]; }
  connectedCallback() { this.draw(); }
  attributeChangedCallback() { this.draw(); }
  draw() {
    const x = n(this, "actual"); const m = Math.max(1, n(this, "meta", 3));
    this.innerHTML = `<div class="msl-juego-grupo"><p>Compra grupal ${x}/${m}</p>
      <div class="msl-juego-barra-via"><i style="width:${Math.min(100, (x / m) * 100)}%"></i></div></div>`;
  }
}

class Alerta extends HTMLElement {
  static get observedAttributes() { return ["abierta", "titulo", "cuerpo"]; }
  connectedCallback() {
    if (this._cuerpo == null) this._cuerpo = (this.getAttribute("cuerpo") || this.textContent || "").trim();
    this.draw();
  }
  attributeChangedCallback() { this.draw(); }
  draw() {
    if (this._cuerpo == null) this._cuerpo = (this.getAttribute("cuerpo") || this.textContent || "").trim();
    const on = this.hasAttribute("abierta");
    this.hidden = !on;
    if (!on) return;
    const cuerpo = this.getAttribute("cuerpo") || this._cuerpo || "";
    this.innerHTML = `<aside class="msl-juego-alerta" role="dialog">
      <strong>${esc(a(this, "titulo", "Sigue aquí"))}</strong>
      ${cuerpo ? `<p>${esc(cuerpo)}</p>` : ""}
      <is-button data-x="ok">Seguir</is-button>
    </aside>`;
    this.querySelector("[data-x=ok]").onclick = () => {
      this.removeAttribute("abierta"); fire(this, "msl-juego-alerta", { ok: true });
    };
  }
}

class Salida extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<msl-juego-alerta titulo="¿Te vas? Hay un giro extra" cuerpo="Un último premio antes de irte."></msl-juego-alerta>`;
    this._on = (e) => {
      if (e.clientY > 8) return;
      if (leerJuego("salida:" + hoyClave())) return;
      escribirJuego("salida:" + hoyClave(), true);
      this.querySelector("msl-juego-alerta")?.setAttribute("abierta", "");
    };
    document.addEventListener("mouseout", this._on);
  }
  disconnectedCallback() { document.removeEventListener("mouseout", this._on); }
}

class Ficha extends HTMLElement {
  static get observedAttributes() { return ["producto", "modo", "ciclo", "tipo"]; }
  connectedCallback() { this.draw(); }
  attributeChangedCallback() { this.draw(); }
  draw() {
    const p = json(this, "producto", {});
    this.innerHTML = `<article class="msl-juego-ficha">
      ${p.img ? `<img src="${esc(p.img)}" alt="${esc(p.nombre || "")}">` : ""}
      <h3>${esc(p.nombre || "Producto")}</h3>
      <msl-juego-precio centavos="${p.precio || 0}" modo="${esc(a(this, "modo", "simulada"))}" inflar="${p.inflar || 1.55}" descuento="${p.descuento || 20}" moneda="${esc(p.moneda || "COP")}"></msl-juego-precio>
      <msl-juego-cuenta ciclo="${esc(a(this, "ciclo", "diario"))}" rotulo="Válida hasta"></msl-juego-cuenta>
      <msl-juego-escasez sku="${esc(String(p.id || p.nombre || "p"))}" tipo="${esc(a(this, "tipo", "simulado"))}"></msl-juego-escasez>
    </article>`;
  }
}

const TAGS = {
  "msl-juego-precio": Precio,
  "msl-juego-cuenta": Cuenta,
  "msl-juego-escasez": Escasez,
  "msl-juego-barra": Barra,
  "msl-juego-asintota": Asintota,
  "msl-juego-mision": Mision,
  "msl-juego-suerte": Suerte,
  "msl-juego-feed": Feed,
  "msl-juego-paquete": Paquete,
  "msl-juego-cupon": Cupon,
  "msl-juego-referido": Referido,
  "msl-juego-grupo": Grupo,
  "msl-juego-alerta": Alerta,
  "msl-juego-salida": Salida,
  "msl-juego-ficha": Ficha,
};
for (const [tag, cls] of Object.entries(TAGS)) {
  if (!customElements.get(tag)) customElements.define(tag, cls);
}
