// Formulario de acceso: login y registro con nickname (email o móvil).
// OTP preparado: el nickname ya define el canal; falta solo el envío real.
// Atributos: titulo (texto sobre el form), registro ("false" oculta crear cuenta).
// Evento: "msl-login" {token, nickname, rol}.
import { MslCliente } from "../msl-cliente.js";
import { esc } from "../msl-core.js";

export class MslAuthForm extends HTMLElement {
  connectedCallback() {
    const titulo = this.getAttribute("titulo") || "";
    const conRegistro = this.getAttribute("registro") !== "false";
    this.innerHTML = `
      <form class="msl-auth">
        ${titulo ? `<h3>${esc(titulo)}</h3>` : ""}
        <is-input name="nickname" label="Nickname" hint="email, móvil o usuario" required autocomplete="username"></is-input>
        <is-input name="password" type="password" password-toggle label="Contraseña" required minlength="4" autocomplete="current-password"></is-input>
        <is-button type="submit" data-x="entrar"><is-icon icon="mdi:login"></is-icon> Entrar</is-button>
        ${conRegistro ? `<is-button type="button" data-x="registro" variant="text">Crear cuenta</is-button>` : ""}
        <p class="msl-error" hidden></p>
      </form>`;
    const form = this.querySelector("form");
    const errorEl = this.querySelector(".msl-error");
    const leer = (name) => this.querySelector(`is-input[name="${name}"]`)?.value
      ?? form.elements[name]?.value ?? "";
    const enviar = async (esRegistro) => {
      errorEl.hidden = true;
      const nickname = String(leer("nickname")).trim();
      const password = String(leer("password"));
      try {
        if (esRegistro) await MslCliente.registro(nickname, password);
        const sesion = await MslCliente.login(nickname, password);
        this.dispatchEvent(new CustomEvent("msl-login", { detail: sesion, bubbles: true }));
      } catch (e) {
        errorEl.textContent = e.message;
        errorEl.hidden = false;
      }
    };
    form.onsubmit = (e) => { e.preventDefault(); enviar(false); };
    const btnRegistro = this.querySelector('[data-x="registro"]');
    if (btnRegistro) btnRegistro.onclick = () => enviar(true);
  }
}

customElements.define("msl-auth-form", MslAuthForm);
