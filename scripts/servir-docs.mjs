import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const APP = fileURLToPath(new URL("..", import.meta.url));
const IS = "c:/ContaPyme/Personal/apps/is-webcomponents/dist/cdn";
const PUERTO = Number(process.argv[2] || 8779);
const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

function archivoDe(url) {
  let p = decodeURIComponent(url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  if (p === "/") p = "/index.html";
  const pref = "/apps/is-webcomponents/dist/cdn";
  if (p === pref || p.startsWith(pref + "/")) {
    return join(IS, p.slice(pref.length) || "is-base.min.css");
  }
  return join(APP, p);
}

createServer(async (req, res) => {
  try {
    const f = normalize(archivoDe(req.url || "/"));
    const datos = await readFile(f);
    res.writeHead(200, {
      "content-type": TIPOS[extname(f)] || "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(datos);
  } catch {
    res.writeHead(404);
    res.end("404");
  }
}).listen(PUERTO, "127.0.0.1", () => {
  console.log(`catálogo http://127.0.0.1:${PUERTO}/`);
});
