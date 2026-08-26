// Carrusel horizontal con snap. Tokens --is-*. Importar por CDN y cambiar paleta.
customElements.define("msl-carrusel", class extends HTMLElement {
  connectedCallback() {
    if (this.dataset.mslArmado) return;
    this.dataset.mslArmado = "1";
    const pista = document.createElement("div");
    pista.className = "msl-carrusel-pista";
    pista.setAttribute("role", "list");
    while (this.firstChild) pista.append(this.firstChild);
    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "msl-carrusel-btn";
    prev.dataset.dir = "prev";
    prev.setAttribute("aria-label", "Anterior");
    prev.textContent = "‹";
    const next = document.createElement("button");
    next.type = "button";
    next.className = "msl-carrusel-btn";
    next.dataset.dir = "next";
    next.setAttribute("aria-label", "Siguiente");
    next.textContent = "›";
    this.append(prev, pista, next);
    const paso = () => Math.max(pista.clientWidth * 0.8, 240);
    prev.onclick = () => pista.scrollBy({ left: -paso(), behavior: "smooth" });
    next.onclick = () => pista.scrollBy({ left: paso(), behavior: "smooth" });
  }
});
