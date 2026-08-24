// Cache de respuestas en IndexedDB.
// Pinta al instante lo ultimo conocido. Rehace solo si servidor difiere.
// Clave: app + quien pregunta + metodo + ruta + cuerpo canonico.
// Guarda JSON canonico. Comparar texto evita colisiones de hash.

const DB = "muestralo";
const ALMACEN = "respuestas";
const VERSION = 1;
// Entrada mas vieja que esto se ignora y se borra al leerla.
const VIDA_MS = 7 * 24 * 60 * 60 * 1000;

// Respaldo en memoria: modo privado, cuota llena o base corrupta.
// Regla dura: cache JAMAS bloquea pintado.
// IndexedDB sin responder a tiempo degrada a memoria.
const memoria = new Map();
const LIMITE_MS = 1500;
let promesaDb = null;

// Promesa con tope. Sin respuesta, sigue sin cache persistente.
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

// Escritura sin esperar confirmacion.
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

// JSON canonico: claves ordenadas dan texto estable.
export function canonico(valor) {
  if (valor === null || typeof valor !== "object") return JSON.stringify(valor ?? null);
  if (Array.isArray(valor)) return `[${valor.map(canonico).join(",")}]`;
  const claves = Object.keys(valor).sort();
  return `{${claves.map((k) => `${JSON.stringify(k)}:${canonico(valor[k])}`).join(",")}}`;
}

// Identidad de consulta. `quien` aisla por usuario.
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
  // Copia en memoria siempre: respaldo inmediato.
  memoria.set(clave, fila);
  escribir(db, undefined, fila);
  return true;
}

export async function borrar(clave) {
  memoria.delete(clave);
  escribir(await abrir(), clave, null);
}

// Invalida por trozo de ruta. Tras mutar, lo tocado se relee.
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

// Vacia todo. Al salir no queda rastro del usuario.
export async function vaciar() {
  memoria.clear();
  escribir(await abrir(), undefined, null);
}
