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
    return r;
  },
  logout() { MslCliente.token = null; },

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
};
