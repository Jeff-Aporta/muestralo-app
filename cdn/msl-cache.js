// Caché de respuestas en IndexedDB: la vista pinta al instante con lo último
// que se sabe y se rehace solo si el servidor trae algo distinto.
//
// La clave es (app + método + ruta + cuerpo + quién pregunta): dos filtros
// distintos son dos entradas, y lo de un usuario no se le muestra a otro.
//
// Se guarda el JSON canónico (claves ordenadas). Comparar textos evita
// colisiones de hash y hace la decisión de "¿cambió?" exacta.

const DB = "muestralo";
const ALMACEN = "respuestas";
const VERSION = 1;
// Entradas más viejas que esto se ignoran y se borran al pasar por ellas.
const VIDA_MS = 7 * 24 * 60 * 60 * 1000;

// Respaldo en memoria: modo privado, cuota llena o base corrupta no rompen
// nada. Regla dura: el caché JAMAS bloquea el pintado. Si IndexedDB no
// contesta a tiempo, se degrada a memoria para el resto de la sesión.
const memoria = new Map();
const LIMITE_MS = 1500;
let promesaDb = null;

// Promesa con tope de espera: si no contesta, se sigue sin caché persistente.
function conTope(promesa, siTarda = null) {
  return Promise.race([
    promesa,
    new Promise((resolve) => setTimeout(() => resolve(siTarda), LIMITE_MS)),
  ]);
}

function abrir() {
  if (promesaDb) return promesaDb;
  promesaDb = conTope(new Promise((resolve) => {
    if (!globalThis.indexedDB) return resolve(null);
    let req;
    try {
      req = indexedDB.open(DB, VERSION);
    } catch {
      return resolve(null);
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(ALMACEN)) {
        db.createObjectStore(ALMACEN, { keyPath: "clave" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
    req.onblocked = () => resolve(null);
  }));
  return promesaDb;
}

function transaccion(db, modo) {
  return db.transaction(ALMACEN, modo).objectStore(ALMACEN);
}

const promesa = (req) =>
  conTope(new Promise((resolve) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  }));

// Escritura: tampoco se espera indefinidamente a que confirme.
function escribir(fn, clave, fila) {
  try {
    const db = fn;
    if (!db) return false;
    const store = transaccion(db, "readwrite");
    if (fila) store.put(fila);
    else if (clave !== undefined) store.delete(clave);
    else store.clear();
    return true;
  } catch {
    return false;
  }
}

// JSON canónico: mismas claves en distinto orden dan el mismo texto.
export function canonico(valor) {
  if (valor === null || typeof valor !== "object") return JSON.stringify(valor ?? null);
  if (Array.isArray(valor)) return `[${valor.map(canonico).join(",")}]`;
  const claves = Object.keys(valor).sort();
  return `{${claves.map((k) => `${JSON.stringify(k)}:${canonico(valor[k])}`).join(",")}}`;
}

// Identidad de una consulta. `quien` aísla por usuario (o "anon").
export function claveDe({ app, metodo, ruta, cuerpo, quien }) {
  return `${app}|${quien || "anon"}|${metodo}|${ruta}|${canonico(cuerpo ?? null)}`;
}

// Última respuesta conocida, o null. Devuelve {datos, texto, guardadoEn}.
export async function leer(clave) {
  const db = await abrir();
  let fila = memoria.get(clave) ?? null;
  if (!fila && db) {
    try {
      fila = await promesa(transaccion(db, "readonly").get(clave));
    } catch {
      fila = null;
    }
  }
  if (!fila) return null;
  if (Date.now() - fila.guardadoEn > VIDA_MS) {
    await borrar(clave);
    return null;
  }
  try {
    return { ...fila, datos: JSON.parse(fila.texto) };
  } catch {
    return null;
  }
}

// Guarda solo si el texto cambió. Devuelve true si hubo cambio real.
export async function guardar(clave, datos) {
  const texto = canonico(datos);
  const previo = await leer(clave);
  if (previo && previo.texto === texto) return false;
  const fila = { clave, texto, guardadoEn: Date.now() };
  const db = await abrir();
  // La copia en memoria siempre se mantiene: es el respaldo inmediato.
  memoria.set(clave, fila);
  escribir(db, undefined, fila);
  return true;
}

export async function borrar(clave) {
  memoria.delete(clave);
  escribir(await abrir(), clave, null);
}

// Invalida por prefijo o por trozo de ruta: tras mutar, lo tocado se relee.
export async function invalidar(coincide) {
  const prueba = typeof coincide === "function" ? coincide : (c) => c.includes(coincide);
  for (const c of [...memoria.keys()]) if (prueba(c)) memoria.delete(c);
  const db = await abrir();
  if (!db) return;
  try {
    const claves = await promesa(transaccion(db, "readonly").getAllKeys());
    const store = transaccion(db, "readwrite");
    for (const c of claves ?? []) if (prueba(String(c))) store.delete(c);
  } catch { /* la copia en memoria ya quedó limpia */ }
}

// Vacía todo: al cerrar sesión no queda rastro del usuario anterior.
export async function vaciar() {
  memoria.clear();
  escribir(await abrir(), undefined, null);
}
