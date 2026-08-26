// Portada: bloque SEO horneado. Con data-carrusel = slideshow fade (mismo contrato que Don Jacobo).
customElements.define("msl-vitrina-hero", class extends HTMLElement {
  connectedCallback() {
    if (!this.hasAttribute("data-carrusel") || this.dataset.mslArmado) return;
    this.dataset.mslArmado = "1";
    const slides = [...this.querySelectorAll(".msl-slide")];
    const dots = [...this.querySelectorAll(".msl-slide-punto")];
    if (slides.length < 2) return;
    let i = Math.max(0, slides.findIndex((s) => s.classList.contains("is-activa")));
    const ir = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("is-activa", k === i));
      dots.forEach((d, k) => {
        d.classList.toggle("is-activa", k === i);
        d.setAttribute("aria-current", k === i ? "true" : "false");
      });
    };
    this.querySelector("[data-dir=prev]")?.addEventListener("click", () => ir(i - 1));
    this.querySelector("[data-dir=next]")?.addEventListener("click", () => ir(i + 1));
    dots.forEach((d, k) => d.addEventListener("click", () => ir(k)));
    let x0 = null;
    this.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button, a")) { x0 = null; return; }
      x0 = e.clientX;
    });
    this.addEventListener("pointerup", (e) => {
      if (x0 == null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) < 40) return;
      ir(i + (dx < 0 ? 1 : -1));
    });
  }
});
