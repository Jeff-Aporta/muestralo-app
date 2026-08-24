// Panel de carrito: lista ítems, cantidades, total y botón de congelar.
// Propiedad: carrito {items, total}. Eventos: msl-cantidad, msl-quitar, msl-congelar.
import { dinero } from "../msl-tema.js";

export class MslCarritoPanel extends HTMLElement {
  set carrito(c) {
    this._c = c;
    this.render();
  }

  render() {
    const c = this._c;
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
              <strong>${i.nombre}</strong>
              <small>${Object.entries(i.personalizacion || {}).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" · ")}</small>
            </div>
            <input type="number" min="1" value="${i.cantidad}" style="width:4em">
            <span>${dinero(i.subtotal)}</span>
            <is-button data-x="quitar" variante="texto"><is-icon icon="mdi:delete"></is-icon></is-button>
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
