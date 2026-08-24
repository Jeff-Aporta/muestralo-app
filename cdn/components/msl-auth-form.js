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
        <label>Nickname <small>(email o móvil)</small>
          <input name="nickname" required autocomplete="username">
        </label>
        <label>Contraseña
          <input name="password" type="password" required minlength="4" autocomplete="current-password">
        </label>
        <is-button type="submit" data-x="entrar"><is-icon icon="mdi:login"></is-icon> Entrar</is-button>
        ${conRegistro ? `<is-button type="button" data-x="registro" variante="texto">Crear cuenta</is-button>` : ""}
        <p class="msl-error" hidden></p>
      </form>`;
    const form = this.querySelector("form");
    const errorEl = this.querySelector(".msl-error");
    const enviar = async (esRegistro) => {
      errorEl.hidden = true;
      const nickname = form.nickname.value.trim();
      const password = form.password.value;
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
