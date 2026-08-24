// Tarjeta de producto. Atributos: producto (propiedad JS).
// Eventos: "msl-ver" (detalle), "msl-agregar" (añadir al carrito).
import { dinero } from "../msl-tema.js";

export class MslProductoCard extends HTMLElement {
  set producto(p) {
    this._p = p;
    this.render();
  }
  get producto() { return this._p; }

  render() {
    const p = this._p;
    if (!p) return;
    const img = (p.imagenes || [])[0];
    const vars = p.variaciones || {};
    this.innerHTML = `
      <div class="msl-card">
        ${img ? `<img src="${img}" alt="${p.nombre}" loading="lazy">` : `<div class="msl-sin-img"><is-icon icon="mdi:image-off-outline"></is-icon></div>`}
        <div class="msl-card-cuerpo">
          <strong>${p.nombre}</strong>
          <span class="msl-precio">${dinero(p.precio, p.moneda)}</span>
          ${p.stock <= 0 ? `<is-badge>agotado</is-badge>` : ""}
          ${Object.keys(vars).length ? `<small>${Object.keys(vars).join(" · ")}</small>` : ""}
          <div class="msl-acciones">
            <is-button data-x="ver" variante="texto"><is-icon icon="mdi:eye"></is-icon> Ver</is-button>
            <is-button data-x="agregar" ${p.stock <= 0 ? "disabled" : ""}><is-icon icon="mdi:cart-plus"></is-icon> Agregar</is-button>
          </div>
        </div>
      </div>`;
    this.querySelector('[data-x="ver"]').onclick = () =>
      this.dispatchEvent(new CustomEvent("msl-ver", { detail: p, bubbles: true }));
    this.querySelector('[data-x="agregar"]').onclick = () =>
      this.dispatchEvent(new CustomEvent("msl-agregar", { detail: p, bubbles: true }));
  }
}

customElements.define("msl-producto-card", MslProductoCard);
