// msl-imagen-input — subida de imágenes con redimensionado en el navegador.
// El Worker no procesa imágenes: aquí salen las 3 variantes y se suben ya listas.
// Atributos: entidad, entidad-id, multiple, label. Propiedad: valor (array urls).
// Evento: "msl-subida" {detail:{archivo, url, urls}} por cada imagen subida.
import { esc } from "../msl-core.js";
import { MslCliente } from "../msl-cliente.js";

// Tamaños del ecosistema: detalle, tarjeta y miniatura. Calidad 0.75 JPEG.
export const VARIANTES = { grande: 2048, medio: 1024, mini: 320 };
const CALIDAD = 0.75;

// Redibuja la imagen en canvas al lado mayor pedido (sin agrandar).
function escalar(img, lado) {
  const razon = Math.min(1, lado / Math.max(img.width, img.height));
  const w = Math.round(img.width * razon);
  const h = Math.round(img.height * razon);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  c.getContext("2d").drawImage(img, 0, 0, w, h);
  return { dataUrl: c.toDataURL("image/jpeg", CALIDAD), ancho: w, alto: h };
}

function leerImagen(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = fr.result;
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

// Genera las variantes de un File. La grande es el binario principal.
export async function variantesDe(file) {
  const img = await leerImagen(file);
  const grande = escalar(img, VARIANTES.grande);
  return {
    data: grande.dataUrl,
    ancho: grande.ancho,
    alto: grande.alto,
    variantes: {
      medio: escalar(img, VARIANTES.medio).dataUrl,
      mini: escalar(img, VARIANTES.mini).dataUrl,
    },
  };
}

export class MslImagenInput extends HTMLElement {
  static get observedAttributes() { return ["label", "entidad", "entidad-id", "multiple"]; }

  connectedCallback() {
    this._urls = this._urls ?? [];
    this.render();
  }

  set valor(urls) {
    this._urls = Array.isArray(urls) ? urls : [];
    this.render();
  }

  get valor() { return this._urls ?? []; }

  render() {
    const label = this.getAttribute("label") ?? "Imágenes";
    this.innerHTML = `
      <div class="msl-img-input">
        <is-file-input label="${esc(label)}" accept="image/*"
          ${this.hasAttribute("multiple") ? "multiple" : ""}></is-file-input>
        <p class="msl-img-estado" hidden></p>
        <div class="msl-img-galeria">
          ${this.valor.map((u, i) => `
            <figure><img src="${esc(u)}" alt="">
              <is-button type="button" variant="text" data-quitar="${i}" title="Quitar">
                <is-icon icon="mdi:close"></is-icon>
              </is-button>
            </figure>`).join("")}
        </div>
      </div>`;
    const picker = this.querySelector("is-file-input");
    const tomar = (e) => {
      const files = e.target.files ?? e.detail?.files;
      if (files?.length) this.subir([...files]);
    };
    picker.addEventListener("change", tomar);
    picker.addEventListener("is-change", tomar);
    for (const b of this.querySelectorAll("[data-quitar]")) {
      b.onclick = () => {
        this._urls.splice(Number(b.dataset.quitar), 1);
        this.render();
        this.dispatchEvent(new CustomEvent("msl-cambio", { bubbles: true, detail: { urls: this.valor } }));
      };
    }
  }

  estado(texto) {
    const p = this.querySelector(".msl-img-estado");
    p.hidden = !texto;
    p.textContent = texto ?? "";
  }

  async subir(files) {
    let n = 0;
    for (const file of files) {
      n++;
      this.estado(`Procesando ${n}/${files.length}…`);
      try {
        const v = await variantesDe(file);
        const r = await MslCliente.subirArchivo({
          nombre: file.name, tipo: "imagen", ...v,
          entidad: this.getAttribute("entidad") ?? undefined,
          entidad_id: Number(this.getAttribute("entidad-id")) || undefined,
        });
        // El sitio pinta la variante media; la grande queda para el detalle.
        const url = MslCliente.urlArchivo(r.urls?.medio ?? r.url);
        this._urls.push(url);
        this.dispatchEvent(new CustomEvent("msl-subida", { bubbles: true, detail: { archivo: r, url, urls: r.urls } }));
      } catch (e) {
        this.estado(`Error: ${e.message}`);
        return;
      }
    }
    this.estado("");
    this.render();
    this.dispatchEvent(new CustomEvent("msl-cambio", { bubbles: true, detail: { urls: this.valor } }));
  }
}

customElements.define("msl-imagen-input", MslImagenInput);
