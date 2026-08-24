// Cliente API de Muéstralo: único punto que habla con el Worker.
// Lo consumen app/, admin/ y main/. No duplicar fetch en los fronts.

const LS_TOKEN = "msl.token";
const LS_APP = "msl.app";

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

async function llamar(metodo, ruta, body) {
  const r = await fetch(`${estado.base}${ruta}`, {
    method: metodo,
    headers: cabeceras(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const datos = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(datos.error || `HTTP ${r.status}`);
  return datos;
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
    fijarPermisos(r.permisos);
    return r;
  },
  logout() { MslCliente.token = null; fijarPermisos({}); },

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
};

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
