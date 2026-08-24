// Tarjeta de pedido congelado: código base36, ítems, total y botón WhatsApp.
// Propiedad: pedido. Atributo opcional: whatsapp-url.
import { dinero } from "../msl-tema.js";

export class MslPedidoCard extends HTMLElement {
  set pedido(p) {
    this._p = p;
    this.render();
  }

  render() {
    const p = this._p;
    if (!p) return;
    const wa = p.whatsapp_url || this.getAttribute("whatsapp-url");
    this.innerHTML = `
      <div class="msl-pedido">
        <header>
          <is-badge>${p.estado}</is-badge>
          <strong>Pedido #${p.codigo}</strong>
          <small>${(p.creado_en || "").slice(0, 16).replace("T", " ")}</small>
        </header>
        <ul>
          ${(p.items || []).map((i) => `
            <li>${i.cantidad}× ${i.nombre}
              <small>${Object.entries(i.personalizacion || {}).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" · ")}</small>
              — ${dinero(i.subtotal, p.moneda)}</li>`).join("")}
        </ul>
        <footer>
          <strong>Total ${dinero(p.total, p.moneda)}</strong>
          ${wa ? `<a href="${wa}" target="_blank" rel="noopener">
            <is-button><is-icon icon="mdi:whatsapp"></is-icon> Completar pago por WhatsApp</is-button></a>` : ""}
        </footer>
      </div>`;
  }
}

customElements.define("msl-pedido-card", MslPedidoCard);
