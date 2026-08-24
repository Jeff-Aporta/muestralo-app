// Tarjeta de pedido congelado: código base36, ítems, total y botón WhatsApp.
// Atributo JSON: pedido='{"codigo":"…","estado":"…","items":[],"total":…,"moneda":"COP","creado_en":"…"}'
// Atributo plano: whatsapp-url (o whatsapp_url dentro del JSON).
import { dinero } from "../msl-tema.js";
import { esc, attrJson, setJsonAttr } from "../msl-core.js";

export class MslPedidoCard extends HTMLElement {
  static get observedAttributes() { return ["pedido", "whatsapp-url"]; }

  set pedido(p) { setJsonAttr(this, "pedido", p); }
  get pedido() { return attrJson(this, "pedido"); }

  attributeChangedCallback() { this.render(); }
  connectedCallback() { this.render(); }

  render() {
    const p = attrJson(this, "pedido");
    if (!p) return;
    const wa = p.whatsapp_url || this.getAttribute("whatsapp-url");
    this.innerHTML = `
      <div class="msl-pedido">
        <header>
          <is-badge>${esc(p.estado)}</is-badge>
          <strong>Pedido #${esc(p.codigo)}</strong>
          <small>${esc((p.creado_en || "").slice(0, 16).replace("T", " "))}</small>
        </header>
        <ul>
          ${(p.items || []).map((i) => `
            <li>${i.cantidad}× ${esc(i.nombre)}
              <small>${esc(Object.entries(i.personalizacion || {}).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" · "))}</small>
              — ${dinero(i.subtotal, p.moneda)}</li>`).join("")}
        </ul>
        <footer>
          <strong>Total ${dinero(p.total, p.moneda)}</strong>
          ${wa ? `<a href="${esc(wa)}" target="_blank" rel="noopener">
            <is-button><is-icon icon="mdi:whatsapp"></is-icon> Completar pago por WhatsApp</is-button></a>` : ""}
        </footer>
      </div>`;
  }
}

customElements.define("msl-pedido-card", MslPedidoCard);
