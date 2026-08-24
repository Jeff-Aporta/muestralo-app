// Chequeo de sintaxis de todo el JS del repo, como MÓDULO.
// Ojo: `node --check archivo.js` parsea como CommonJS y da falsos OK
// (un salto de línea dentro de un string pasó desapercibido y rompió el panel).
// Aquí se parsea siempre como ESM, que es como el navegador lo carga.

import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const IGNORA = new Set(["node_modules", "dist", ".git"]);

function archivos(dir) {
  const salida = [];
  for (const n of readdirSync(dir)) {
    if (IGNORA.has(n)) continue;
    const ruta = join(dir, n);
    if (statSync(ruta).isDirectory()) salida.push(...archivos(ruta));
    else if (/\.(m?js)$/.test(n)) salida.push(ruta);
  }
  return salida;
}

const raiz = process.argv[2] || ".";
let rotos = 0;
for (const f of archivos(raiz)) {
  const r = spawnSync(process.execPath, ["--input-type=module", "--check"], {
    input: readFileSync(f), encoding: "utf8",
  });
  if (r.status !== 0) {
    rotos++;
    console.error(`✗ ${f}\n${r.stderr.split("\n").slice(1, 4).join("\n")}`);
  }
}
console.log(rotos ? `${rotos} archivo(s) con sintaxis inválida.` : "Sintaxis ESM correcta en todo el JS.");
process.exit(rotos ? 1 : 0);
