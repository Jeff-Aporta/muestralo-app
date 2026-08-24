// Servidor de vista previa para desarrollo del molde.
// Sirve el dist de una empresa y, en /cdn, el kit local sin publicar:
//   node scripts/servir.mjs ../business/demo [puerto]
// Luego abrir  http://127.0.0.1:8791/?cdn=/cdn  para probar el kit local.
//
// Su cwd NO es dist: en Windows eso bloquearía el rm -rf del build.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const EMPRESA = resolve(process.argv[2] ?? ".");
const PUERTO = Number(process.argv[3] ?? 8791);
const DIST = join(EMPRESA, "dist");
const KIT = resolve(fileURLToPath(new URL("../cdn", import.meta.url)));

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
};

createServer(async (req, res) => {
  let ruta = decodeURIComponent(req.url.split("?")[0]);
  if (ruta.endsWith("/")) ruta += "index.html";
  // /cdn/* sale del kit del repo; el resto, del sitio horneado.
  const archivo = ruta.startsWith("/cdn/")
    ? join(KIT, ruta.slice(5))
    : join(DIST, ruta);
  try {
    const datos = await readFile(archivo);
    res.writeHead(200, {
      "content-type": TIPOS[extname(archivo)] ?? "application/octet-stream",
      "access-control-allow-origin": "*",
    });
    res.end(datos);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("404");
  }
}).listen(PUERTO, () => {
  console.log(`Vista previa: http://127.0.0.1:${PUERTO}/?cdn=/cdn`);
});
