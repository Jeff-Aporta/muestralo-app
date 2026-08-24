// Cliente API: unico punto que habla con el Worker.
// Lo usan app/, admin/ y main/. No duplicar fetch en fronts.
// vivo(): pinta cache al instante, repinta solo si servidor difiere.
// Mutacion invalida lo que toco.
import * as cache from "./msl-cache.js";

const LS_TOKEN = "msl.token";
const LS_APP = "msl.app";
const LS_NICK = "msl.nickname";

// Métodos de lectura: son los únicos que se cachean.
const LECTURA = new Set(["GET", "QUERY"]);

// Que invalida cada mutacion. Clave lleva ruta: basta el trozo.
const INVALIDA = [
  [/^\/api\/productos/, ["/api/productos"]],
  [/^\/api\/carrito/, ["/api/carrito"]],
  [/^\/api\/pedidos\/congelar/, ["/api/carrito", "/api/pedidos", "/api/metricas"]],
  [/^\/api\/pedidos/, ["/api/pedidos", "/api/metricas"]],
  [/^\/api\/pagos/, ["/api/pagos", "/api/pedidos", "/api/metricas"]],
  [/^\/api\/archivos/, ["/api/archivos"]],
  [/^\/api\/config/, ["/api/config"]],
  [/^\/api\/tenants/, ["/api/tenants"]],
  [/^\/api\/seg/, ["/api/seg", "/api/permisos"]],
];

// Base de la API: configúrala con MslCliente.configurar({base, app}).
const estado = {
  base: localStorage.getItem("msl.api") || "https://muestralo-api.jeffaporta.workers.dev",
  app: localStorage.getItem(LS_APP) || "demo",
};

function cabeceras() {
  const h = { "content-type": "application/json", "x-app": estado.app };
  const token = localStorage.getItem(LS_TOKEN);
  if (token) h.authorization = `Bearer ${token}`;
  return h;
}

async function pedir(metodo, ruta, body) {
  const r = await fetch(`${estado.base}${ruta}`, {
    method: metodo,
    headers: cabeceras(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const datos = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(datos.error || `HTTP ${r.status}`);
  return datos;
}

// Clave de cache: atada a tenant y a quien pregunta.
const claveDe = (metodo, ruta, body) => cache.claveDe({
  app: estado.app, metodo, ruta, cuerpo: body,
  quien: localStorage.getItem(LS_NICK) || "anon",
});

// Tras mutar, olvida lecturas desactualizadas.
async function invalidarPor(ruta) {
  for (const [patron, trozos] of INVALIDA) {
    if (!patron.test(ruta)) continue;
    for (const t of trozos) await cache.invalidar(t);
    return;
  }
}

async function llamar(metodo, ruta, body) {
  const datos = await pedir(metodo, ruta, body);
  if (LECTURA.has(metodo)) await cache.guardar(claveDe(metodo, ruta, body), datos);
  else await invalidarPor(ruta);
  return datos;
}

// Lectura con cache: pinta ya, revalida despues.
// pintar(datos,{origen,cambio}): una vez con lo guardado (origen "cache").
// Segunda llamada solo si red trajo algo distinto (origen "red").
// Respuesta identica: no repinta.
// Red caida con cache: no lanza, resuelve lo guardado y avisa por onError.
export async function vivo(metodo, ruta, body, pintar, { onError } = {}) {
  if (!LECTURA.has(metodo)) throw new Error(`vivo() solo admite ${[...LECTURA].join(" o ")}`);
  const clave = claveDe(metodo, ruta, body);
  const guardado = await cache.leer(clave).catch(() => null);
  if (guardado) pintar(guardado.datos, { origen: "cache", cambio: false });

  try {
    const frescos = await pedir(metodo, ruta, body);
    const cambio = await cache.guardar(clave, frescos);
    // Sin caché previa hay que pintar igual; con ella, solo si cambió.
    if (cambio || !guardado) pintar(frescos, { origen: "red", cambio });
    return frescos;
  } catch (e) {
    if (!guardado) throw e;
    onError?.(e);
    return guardado.datos;
  }
}

export const MslCliente = {
  configurar({ base, app } = {}) {
    if (base) { estado.base = base; localStorage.setItem("msl.api", base); }
    if (app) { estado.app = app; localStorage.setItem(LS_APP, app); }
  },
  get app() { return estado.app; },
  get base() { return estado.base; },
  get token() { return localStorage.getItem(LS_TOKEN); },
  set token(t) { t ? localStorage.setItem(LS_TOKEN, t) : localStorage.removeItem(LS_TOKEN); },

  // Tenant
  config: () => llamar("GET", "/api/config"),
  guardarConfig: (datos) => llamar("PUT", "/api/config", datos),

  // Auth
  registro: (nickname, password) => llamar("POST", "/api/usuarios/registro", { nickname, password }),
  login: async (nickname, password) => {
    const r = await llamar("POST", "/api/usuarios/login", { nickname, password });
    MslCliente.token = r.token;
    // Nickname va en la clave: nadie ve datos de otra sesion.
    localStorage.setItem(LS_NICK, r.nickname);
    fijarPermisos(r.permisos);
    return r;
  },
  logout() {
    MslCliente.token = null;
    localStorage.removeItem(LS_NICK);
    fijarPermisos({});
    // Al salir no queda rastro en el dispositivo.
    cache.vaciar();
  },

  // Catálogo
  productos: (filtro = {}) => llamar("QUERY", "/api/productos", filtro),
  producto: (id) => llamar("GET", `/api/productos/${id}`),
  crearProducto: (datos) => llamar("POST", "/api/productos", datos),
  actualizarProducto: (id, datos) => llamar("PUT", `/api/productos/${id}`, datos),
  borrarProducto: (id) => llamar("DELETE", `/api/productos/${id}`),

  // Carrito
  carrito: () => llamar("GET", "/api/carrito"),
  agregar: (producto_id, cantidad, personalizacion) =>
    llamar("POST", "/api/carrito", { producto_id, cantidad, personalizacion }),
  cambiarCantidad: (id, cantidad) => llamar("PUT", `/api/carrito/${id}`, { cantidad }),
  quitar: (id) => llamar("DELETE", `/api/carrito/${id}`),

  // Pedidos
  congelar: (nota) => llamar("POST", "/api/pedidos/congelar", { nota }),
  pedidos: (filtro = {}) => llamar("QUERY", "/api/pedidos", filtro),
  pedido: (codigo) => llamar("GET", `/api/pedidos/${codigo}`),
  actualizarPedido: (codigo, datos) => llamar("PUT", `/api/pedidos/${codigo}`, datos),

  // Pagos
  registrarPago: (datos) => llamar("POST", "/api/pagos", datos),
  pagos: (filtro = {}) => llamar("QUERY", "/api/pagos", filtro),

  // Métricas y tracking
  visita: (ruta) => llamar("POST", "/api/visitas", { ruta }).catch(() => {}),
  metricas: () => llamar("QUERY", "/api/metricas", {}),

  // Matriz
  tenants: () => llamar("GET", "/api/tenants"),
  crearTenant: (datos) => llamar("POST", "/api/tenants", datos),

  // Archivos (R2). El navegador manda las variantes ya redimensionadas.
  subirArchivo: (datos) => llamar("POST", "/api/archivos", datos),
  archivos: (filtro = {}) => llamar("QUERY", "/api/archivos", filtro),
  borrarArchivo: (id) => llamar("DELETE", `/api/archivos/${id}`),
  // Ruta relativa de la API → absoluta para usar en <img src>.
  urlArchivo: (ruta) => (/^https?:/.test(ruta ?? "") ? ruta : `${estado.base}${ruta ?? ""}`),

  // Definiciones y permisos: el front no quema rutas, roles ni acciones.
  definiciones: () => llamar("GET", "/api/definiciones"),
  permisos: () => llamar("GET", "/api/permisos"),

  // Lectura con caché. Ver `vivo()`: pinta ya y solo rehace si algo cambió.
  vivo,
  // Escotillas de caché para casos puntuales (tras un import masivo, etc.).
  olvidar: (trozo) => cache.invalidar(trozo),
  vaciarCache: () => cache.vaciar(),
};

// Variante con cache de cada lectura. Front no conoce la ruta:
//   MslCliente.productos(filtro)              → red, promesa (como siempre)
//   MslCliente.productos.vivo(filtro, pintar) → caché ya + red si cambió
const LECTURAS = {
  config: ["GET", "/api/config"],
  productos: ["QUERY", "/api/productos"],
  carrito: ["GET", "/api/carrito"],
  pedidos: ["QUERY", "/api/pedidos"],
  pagos: ["QUERY", "/api/pagos"],
  archivos: ["QUERY", "/api/archivos"],
  metricas: ["QUERY", "/api/metricas"],
  tenants: ["GET", "/api/tenants"],
  permisos: ["GET", "/api/permisos"],
  definiciones: ["GET", "/api/definiciones"],
};

for (const [nombre, [verbo, ruta]] of Object.entries(LECTURAS)) {
  // Cuerpo por defecto igual al del metodo normal: misma clave.
  const pordefecto = verbo === "QUERY" ? {} : undefined;
  MslCliente[nombre].vivo = (cuerpo, pintar, opts) =>
    vivo(verbo, ruta, cuerpo ?? pordefecto, pintar, opts);
}

// Permisos de la sesión en memoria: el front pinta según esto.
let PERMISOS = {};

// Guarda el mapa que devuelven login o /api/permisos.
export function fijarPermisos(mapa) {
  PERMISOS = mapa ?? {};
  return PERMISOS;
}

// ¿La sesión puede ejecutar la accion (id de endpoint)? "*" pasa siempre.
export function puede(accion) {
  return !!(PERMISOS["*"] || PERMISOS[accion]);
}

// Alcance del permiso: true total, objeto acotado, false sin paso.
export function alcance(accion) {
  return PERMISOS["*"] ? true : (PERMISOS[accion] ?? false);
}

// Carga los permisos del token vigente (tras un refresh de página).
export async function cargarPermisos() {
  try {
    const r = await MslCliente.permisos();
    return fijarPermisos(r.permisos);
  } catch {
    return fijarPermisos({});
  }
}
