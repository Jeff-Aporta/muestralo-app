// Motor de gamificación Muéstralo. Sin UI: números, ventanas y persistencia.
// Lo consumen msl-juego-* y cualquier app por CDN.

const LS = "msl.juego.";

export function leerJuego(clave, fallback) {
  try {
    const v = localStorage.getItem(LS + clave);
    return v == null ? fallback : JSON.parse(v);
  } catch { return fallback; }
}

export function escribirJuego(clave, valor) {
  try { localStorage.setItem(LS + clave, JSON.stringify(valor)); } catch { /* privado */ }
  return valor;
}

export function hoyClave(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Ancla psicológica. simulada: infla lista y el "descuento" deja el precio real.
// real: descuenta de verdad. ninguna: un solo número.
export function precioAncla({ centavos, modo = "ninguna", inflar = 1.45, descuento = 0 } = {}) {
  const real = Math.max(0, Math.round(Number(centavos) || 0));
  const fac = Math.max(1, Number(inflar) || 1);
  const pct = Math.min(90, Math.max(0, Number(descuento) || 0));
  if (modo === "simulada") {
    const lista = Math.round(real * fac);
    const oferta = real;
    const ahorro = Math.max(0, lista - oferta);
    return { lista, oferta, ahorro, pct: lista ? Math.round((ahorro / lista) * 100) : 0, modo };
  }
  if (modo === "real") {
    const lista = real;
    const oferta = Math.round(real * (1 - pct / 100));
    const ahorro = Math.max(0, lista - oferta);
    return { lista, oferta, ahorro, pct, modo };
  }
  return { lista: real, oferta: real, ahorro: 0, pct: 0, modo: "ninguna" };
}

export function parseDuracion(s) {
  const m = String(s || "").trim().match(/^(\d+(?:\.\d+)?)(ms|s|m|h|d)?$/i);
  if (!m) return 0;
  const n = Number(m[1]);
  const u = (m[2] || "s").toLowerCase();
  return n * ({ ms: 1, s: 1e3, m: 6e4, h: 36e5, d: 864e5 }[u] || 1e3);
}

// Ventana de promo. ciclo: diario | semanal | mes-semana-N | hasta=ISO | durante=90s
export function ventanaPromo({ ciclo, hasta, durante, ahora = Date.now() } = {}) {
  if (hasta) {
    const fin = new Date(hasta).getTime();
    return { inicio: ahora, fin, activa: ahora < fin, restante: Math.max(0, fin - ahora) };
  }
  if (durante) {
    const ms = parseDuracion(durante);
    return { inicio: ahora, fin: ahora + ms, activa: true, restante: ms, sesion: true };
  }
  const d = new Date(ahora);
  const y = d.getFullYear();
  const mo = d.getMonth();
  const c = String(ciclo || "diario");
  if (c === "diario") {
    const fin = new Date(y, mo, d.getDate() + 1).getTime();
    return { inicio: new Date(y, mo, d.getDate()).getTime(), fin, activa: true, restante: fin - ahora };
  }
  if (c === "semanal") {
    const dia = d.getDay();
    const aLun = (dia + 6) % 7;
    const ini = new Date(y, mo, d.getDate() - aLun).getTime();
    const fin = ini + 7 * 864e5;
    return { inicio: ini, fin, activa: ahora < fin, restante: Math.max(0, fin - ahora) };
  }
  const sem = c.match(/^mes-semana-(\d)$/);
  if (sem) {
    const n = Number(sem[1]);
    const ini = new Date(y, mo, (n - 1) * 7 + 1).getTime();
    const fin = new Date(y, mo, n * 7 + 1).getTime();
    const activa = ahora >= ini && ahora < fin;
    return { inicio: ini, fin, activa, restante: activa ? fin - ahora : (ahora < ini ? ini - ahora : 0) };
  }
  return { inicio: ahora, fin: ahora, activa: false, restante: 0 };
}

export function fmtRestante(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d) return `${d}d ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// 99% rápido, el último 1% pide más puntos (compra / invitar).
export function progresoAsintotico(puntos, { k = 0.07, techo = 0.99 } = {}) {
  const p = Math.max(0, Number(puntos) || 0);
  return techo * (1 - Math.exp(-k * p));
}

export function escasezDe(id, { min = 2, max = 9, personasMin = 4, personasMax = 28 } = {}) {
  const dia = hoyClave();
  let h = 0;
  const s = `${id}|${dia}`;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  const span = Math.max(0, max - min);
  const quedan = min + (h % (span + 1));
  const gente = personasMin + ((h >>> 8) % Math.max(1, personasMax - personasMin + 1));
  return { quedan, gente, dia };
}

export function rachaDiaria() {
  const hoy = hoyClave();
  const st = leerJuego("racha", { dias: 0, ultimo: "" });
  if (st.ultimo === hoy) return st;
  const ayer = hoyClave(new Date(Date.now() - 864e5));
  const dias = st.ultimo === ayer ? (st.dias || 0) + 1 : 1;
  return escribirJuego("racha", { dias, ultimo: hoy });
}

export function misionesHoy(defs) {
  const clave = "misiones:" + hoyClave();
  const done = new Set(leerJuego(clave, []));
  return defs.map((m) => ({ ...m, hecha: done.has(m.id) }));
}

export function completarMision(id) {
  const clave = "misiones:" + hoyClave();
  const done = new Set(leerJuego(clave, []));
  done.add(id);
  escribirJuego(clave, [...done]);
  const racha = rachaDiaria();
  return { id, racha };
}

export function sortear(premios) {
  const bag = premios.flatMap((p) => Array(Math.max(1, p.peso || 1)).fill(p));
  return bag[Math.floor(Math.random() * bag.length)] || premios[0];
}

export function cuponesDe(cuenta) {
  return leerJuego("cupones:" + (cuenta || "anon"), []);
}

export function inyectarCupon(cuenta, cupon) {
  const lista = cuponesDe(cuenta);
  lista.push({ ...cupon, id: cupon.id || crypto.randomUUID?.() || String(Date.now()) });
  escribirJuego("cupones:" + (cuenta || "anon"), lista);
  return lista;
}

export function huecoBarra({ actual = 0, umbral = 0 } = {}) {
  const a = Math.max(0, Number(actual) || 0);
  const u = Math.max(0, Number(umbral) || 0);
  const falta = Math.max(0, u - a);
  return { actual: a, umbral: u, falta, pct: u ? Math.min(100, Math.round((a / u) * 100)) : 100 };
}
