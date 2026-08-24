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
    else if (/\.(m?js|html)$/.test(n)) salida.push(ruta);
  }
  return salida;
}

const raiz = process.argv[2] || ".";
let rotos = 0;
// JS embebido en HTML: los <script type="module"> también se comprueban.
// Un salto de línea dentro de un string ahí rompe la página entera y el
// navegador no siempre lo reporta de forma visible.
function trozos(ruta) {
  const texto = readFileSync(ruta, "utf8");
  if (!/\.html$/.test(ruta)) return [texto];
  const bloques = [...texto.matchAll(/<script\b[^>]*type=["']module["'][^>]*>([\s\S]*?)<\/script>/gi)];
  return bloques.map((m) => m[1]);
}

for (const f of archivos(raiz)) {
  for (const [i, codigo] of trozos(f).entries()) {
    const r = spawnSync(process.execPath, ["--input-type=module", "--check"], {
      input: codigo, encoding: "utf8",
    });
    if (r.status !== 0) {
      rotos++;
      const donde = /\.html$/.test(f) ? `${f} (script ${i + 1})` : f;
      console.error(`✗ ${donde}\n${r.stderr.split("\n").slice(1, 4).join("\n")}`);
    }
  }
}
console.log(rotos ? `${rotos} archivo(s) con sintaxis inválida.` : "Sintaxis ESM correcta en todo el JS.");
process.exit(rotos ? 1 : 0);
