// Cifra de dashboard: traduce atributos de dominio al <is-stat> del kit.
// Atributos: icono, valor, etiqueta.
import { esc } from "../msl-core.js";

export class MslMetricaCard extends HTMLElement {
  static get observedAttributes() { return ["icono", "valor", "etiqueta"]; }

  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }

  render() {
    this.innerHTML = `<is-stat
      icon="${esc(this.getAttribute("icono") || "mdi:chart-box")}"
      value="${esc(this.getAttribute("valor") ?? "—")}"
      label="${esc(this.getAttribute("etiqueta") || "")}"></is-stat>`;
  }
}

customElements.define("msl-metrica-card", MslMetricaCard);
