// Tarjeta de producto.
// Atributo JSON: producto='{"id":1,"nombre":"…","precio":…,"moneda":"COP","stock":…,"imagenes":[],"variaciones":{}}'
// Eventos: "msl-ver" (detalle), "msl-agregar" (añadir al carrito).
import { dinero } from "../msl-tema.js";
import { esc, attrJson, setJsonAttr } from "../msl-core.js";

export class MslProductoCard extends HTMLElement {
  static get observedAttributes() { return ["producto"]; }

  // La propiedad JS es azúcar: escribe el atributo y una sola vía renderiza.
  set producto(p) { setJsonAttr(this, "producto", p); }
  get producto() { return attrJson(this, "producto"); }

  attributeChangedCallback() { this.render(); }
  connectedCallback() { this.render(); }

  render() {
    const p = attrJson(this, "producto");
    if (!p || !p.id) return;
    const img = (p.imagenes || [])[0];
    const vars = p.variaciones || {};
    this.innerHTML = `
      <is-card>
        ${img
          ? `<img slot="media" src="${esc(img)}" alt="${esc(p.nombre)}" loading="lazy">`
          : `<div slot="media" class="msl-sin-img"><is-icon icon="mdi:image-off-outline"></is-icon></div>`}
        <strong slot="header">${esc(p.nombre)}</strong>
        <div class="msl-card-cuerpo">
          <span class="msl-precio">${dinero(p.precio, p.moneda)}</span>
          ${p.stock <= 0 ? `<is-badge>agotado</is-badge>` : ""}
          ${Object.keys(vars).length ? `<small>${esc(Object.keys(vars).join(" · "))}</small>` : ""}
        </div>
        <div slot="actions" class="msl-acciones">
          <is-button data-x="ver" variant="text"><is-icon icon="mdi:eye"></is-icon> Ver</is-button>
          <is-button data-x="agregar" ${p.stock <= 0 ? "disabled" : ""}><is-icon icon="mdi:cart-plus"></is-icon> Agregar</is-button>
        </div>
      </is-card>`;
    this.querySelector('[data-x="ver"]').onclick = () =>
      this.dispatchEvent(new CustomEvent("msl-ver", { detail: p, bubbles: true }));
    this.querySelector('[data-x="agregar"]').onclick = () =>
      this.dispatchEvent(new CustomEvent("msl-agregar", { detail: p, bubbles: true }));
  }
}

customElements.define("msl-producto-card", MslProductoCard);
