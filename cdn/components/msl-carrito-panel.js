// Panel de carrito: lista ítems, cantidades, total y botón de congelar.
// Atributo JSON: carrito='{"items":[],"total":0}'
// Eventos: msl-cantidad {id, cantidad}, msl-quitar {id}, msl-congelar.
import { dinero } from "../msl-tema.js";
import { esc, attrJson, setJsonAttr } from "../msl-core.js";

export class MslCarritoPanel extends HTMLElement {
  static get observedAttributes() { return ["carrito"]; }

  set carrito(c) { setJsonAttr(this, "carrito", c); }
  get carrito() { return attrJson(this, "carrito"); }

  attributeChangedCallback() { this.render(); }
  connectedCallback() { this.render(); }

  render() {
    const c = attrJson(this, "carrito");
    if (!c) return;
    if (!c.items.length) {
      this.innerHTML = `<div class="msl-vacio"><is-icon icon="mdi:cart-off"></is-icon><p>Carrito vacío</p></div>`;
      return;
    }
    this.innerHTML = `
      <div class="msl-carrito">
        ${c.items.map((i) => `
          <div class="msl-item" data-id="${i.id}">
            <div>
              <strong>${esc(i.nombre)}</strong>
              <small>${esc(Object.entries(i.personalizacion || {}).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" · "))}</small>
            </div>
            <input type="number" min="1" value="${i.cantidad}" style="width:4em">
            <span>${dinero(i.subtotal)}</span>
            <is-button data-x="quitar" variant="text"><is-icon icon="mdi:delete"></is-icon></is-button>
          </div>`).join("")}
        <div class="msl-total"><strong>Total</strong><strong>${dinero(c.total)}</strong></div>
        <is-button data-x="congelar" class="msl-congelar"><is-icon icon="mdi:whatsapp"></is-icon> Hacer pedido</is-button>
      </div>`;
    this.querySelectorAll(".msl-item input").forEach((inp) => {
      inp.onchange = () => this.dispatchEvent(new CustomEvent("msl-cantidad", {
        detail: { id: Number(inp.closest(".msl-item").dataset.id), cantidad: Number(inp.value) }, bubbles: true,
      }));
    });
    this.querySelectorAll('[data-x="quitar"]').forEach((b) => {
      b.onclick = () => this.dispatchEvent(new CustomEvent("msl-quitar", {
        detail: { id: Number(b.closest(".msl-item").dataset.id) }, bubbles: true,
      }));
    });
    this.querySelector('[data-x="congelar"]').onclick = () =>
      this.dispatchEvent(new CustomEvent("msl-congelar", { bubbles: true }));
  }
}

customElements.define("msl-carrito-panel", MslCarritoPanel);
