// Genera business/<app>/ desde el molde: copia archivos, kit cdn y rellena
// empresa.json + README. No toca git: la creación del repo es paso aparte.
//
// Uso: node scripts/nueva-empresa.mjs --app mitienda --nombre "Mi Tienda"
//        [--dominio https://usuario.github.io/muestralo-mitienda]

import { readFile, writeFile, cp, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const arg = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };

const app = arg("app");
const nombre = arg("nombre");
if (!app || !nombre) {
  console.error("Uso: node scripts/nueva-empresa.mjs --app <id> --nombre \"Nombre\" [--dominio <url>]");
  process.exit(1);
}
if (!/^[a-z0-9-]+$/.test(app)) {
  console.error("El id de app solo admite minúsculas, números y guiones.");
  process.exit(1);
}

const APP_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const DESTINO = join(APP_DIR, "..", "business", app);
const dominio = arg("dominio") || `https://jeff-aporta.github.io/muestralo-${app}`;

// Molde + kit de componentes compartido.
await mkdir(DESTINO, { recursive: true });
await cp(join(APP_DIR, "molde"), DESTINO, { recursive: true });

// Identidad horneada.
const empresa = JSON.parse(await readFile(join(DESTINO, "empresa.json"), "utf8"));
Object.assign(empresa, { app, nombre, dominio });
await writeFile(join(DESTINO, "empresa.json"), JSON.stringify(empresa, null, 2) + "\n");

const readme = await readFile(join(DESTINO, "README.md"), "utf8");
await writeFile(join(DESTINO, "README.md"), readme.replaceAll("{{NOMBRE}}", nombre));

console.log(`Empresa "${nombre}" generada en business/${app}/`);
console.log("Siguiente paso: node scripts/build.mjs dentro de esa carpeta.");
