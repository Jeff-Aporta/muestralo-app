// Formulario de acceso: login y registro con nickname (email o móvil).
// OTP preparado: el nickname ya define el canal; falta solo el envío real.
// Evento: "msl-login" {nickname, password, esRegistro}.
import { MslCliente } from "../msl-cliente.js";

export class MslAuthForm extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <form class="msl-auth">
        <label>Nickname <small>(email o móvil)</small>
          <input name="nickname" required autocomplete="username">
        </label>
        <label>Contraseña
          <input name="password" type="password" required minlength="4" autocomplete="current-password">
        </label>
        <is-button type="submit" data-x="entrar"><is-icon icon="mdi:login"></is-icon> Entrar</is-button>
        <is-button type="button" data-x="registro" variante="texto">Crear cuenta</is-button>
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
    this.querySelector('[data-x="registro"]').onclick = () => enviar(true);
  }
}

customElements.define("msl-auth-form", MslAuthForm);
