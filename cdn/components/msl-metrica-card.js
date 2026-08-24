// Tarjeta de métrica: icono, valor y etiqueta. La usan admin/ y main/.
// Atributos: icono, valor, etiqueta.
import { esc } from "../msl-core.js";

export class MslMetricaCard extends HTMLElement {
  static get observedAttributes() { return ["icono", "valor", "etiqueta"]; }

  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }

  render() {
    this.innerHTML = `
      <div class="msl-metrica">
        <is-icon icon="${esc(this.getAttribute("icono") || "mdi:chart-box")}"></is-icon>
        <strong>${esc(this.getAttribute("valor") ?? "—")}</strong>
        <small>${esc(this.getAttribute("etiqueta") || "")}</small>
      </div>`;
  }
}

customElements.define("msl-metrica-card", MslMetricaCard);
