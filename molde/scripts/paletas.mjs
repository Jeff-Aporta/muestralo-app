// Receta de api/vendor/brand-palette.ts, en JS para el build estático.
// La hoja combinada vive en cada app (css/paletas.css): primer pintado sin API.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";

const mix = (color, pct, con) => `color-mix(in srgb, ${color} ${pct}%, ${con})`;
const superficie = (id) => `--is-${id}-surface`;

export function cssPaleta(p, opts = {}) {
  const id = String(p.value || "").replace(/[^a-z0-9-]/gi, "");
  const c = p.accent;
  const sv = superficie(id);
  const tint = p.tint ?? 1;
  const t = (n) => +(n * tint).toFixed(2);
  const sel = opts.asDefault ? `:root,\n[data-palette="${id}"]` : `[data-palette="${id}"]`;
  const dark = opts.asDefault
    ? `.theme-dark:not([data-palette]),\n.theme-dark[data-palette="${id}"]`
    : `.theme-dark[data-palette="${id}"]`;
  const light = opts.asDefault
    ? `.theme-light:not([data-palette]),\n.theme-light[data-palette="${id}"]`
    : `.theme-light[data-palette="${id}"]`;
  return `${sel} {
  --is-color-brand-paler: ${mix(c, 12, "white")};
  --is-color-brand-pale: ${mix(c, 26, "white")};
  --is-color-brand: ${c};
  --is-color-brand-strong: ${c};
  --is-color-brand-stronger: ${mix(c, 86, "black")};
  --is-color-brand-strongest: ${mix(c, 74, "black")};
  --is-accent: ${c};
  --is-accent-bg: ${mix(c, 12, "transparent")};
  --is-brand-soft: ${mix(c, 18, "transparent")};
  --is-brand-soft-active: ${mix(c, 28, "transparent")};
  --is-focus: ${c};
  --is-logo-bg: ${c};
  --is-logo-fg: ${p.logoFg ?? "#fff"};
  --is-logo-accent: ${p.logoFg ?? "#fff"};
  --is-on-brand: ${p.onBrand ?? "#fff"};
  --is-radius: ${p.radius ?? "0.5em"};
  --is-radius-sm: calc(${p.radius ?? "0.5em"} / 2);${p.font ? `\n  --is-sans: ${p.font};` : ""}
}

${dark} {
  ${sv}: oklch(from ${c} l calc(c * 0.25) h);
  --is-brand-text: ${p.brandText ?? mix(c, 62, "white")};
  --is-bg: ${mix(`var(${sv})`, t(5), "#0a0e14")};
  --is-bg-soft: ${mix(`var(${sv})`, t(6), "#121820")};
  --is-bg-elev: ${mix(`var(${sv})`, t(7), "#18202a")};
  --is-border: ${mix(`var(${sv})`, t(10), "#273040")};
  --is-border-soft: ${mix(`var(${sv})`, t(8), "#1c2430")};
  --is-code-bg: ${mix(`var(${sv})`, t(4.5), "#0d1218")};
  --is-control-bg: ${mix(`var(${sv})`, t(5.5), "#1c2430")};
  --is-control-bg-hover: ${mix(`var(${sv})`, t(7), "#283242")};
  --is-control-bg-active: ${mix(`var(${sv})`, t(8), "#344054")};
  --is-control-border: ${mix(`var(${sv})`, t(12), "#59636e")};
  --is-shadow: 0 1px 0 rgb(255 255 255 / 3%), 0 8px 24px ${mix(`var(${sv})`, t(14), "rgb(0 0 0 / 25%)")};
}

${light} {
  ${sv}: oklch(from ${c} l calc(c * 0.25) h);
  --is-brand-text: ${p.brandTextLight ?? mix(c, 82, "black")};
  --is-bg: ${p.paper ?? "#fff"};
  --is-bg-soft: ${p.paperSoft ?? mix(`var(${sv})`, t(4), "#f6f8fa")};
  --is-bg-elev: ${p.paperElev ?? "#fff"};
  --is-border: ${p.paperBorder ?? mix(`var(${sv})`, t(14), "#d6dae0")};
  --is-border-soft: ${p.paperBorderSoft ?? mix(`var(${sv})`, t(8), "#e5e7eb")};
  --is-code-bg: ${mix(`var(${sv})`, t(3), p.paperSoft ?? "#f6f8fa")};
  --is-control-bg: ${mix(`var(${sv})`, t(3), p.paperSoft ?? "#f1f3f5")};
  --is-control-bg-hover: ${mix(`var(${sv})`, t(5), p.paperSoft ?? "#e9ecef")};
  --is-control-bg-active: ${mix(`var(${sv})`, t(7), p.paperSoft ?? "#dee2e6")};
  --is-control-border: #80808050;
  --is-text: ${p.ink ?? "#1b1f24"};
  --is-text-soft: ${p.inkSoft ?? "#334155"};
  --is-text-dim: ${p.inkDim ?? "#64748b"};
  --is-shadow: 0 10px 28px ${mix(`var(${sv})`, t(18), "rgb(58 36 22 / 10%)")}, 0 1px 0 rgb(58 36 22 / 6%);
  --is-b-required: #888;
  --is-b-readonly: #8884;
  --is-bg-readonly: ${p.paperSoft ?? "#f9f9f9"};
}
`;
}

export const hojaPaletas = (paletas) => paletas.map((p, i) => cssPaleta(p, { asDefault: i === 0 })).join("\n");

export const paraSelector = (paletas) =>
  paletas.map(({ value, label, accent, brandText, logoFg }) => ({
    value, label, accent, ...(brandText ? { brandText } : {}), ...(logoFg ? { logoFg } : {}),
  }));

export async function leerPaletasLocal(raiz) {
  try { return JSON.parse(await readFile(join(raiz, "css", "paletas.json"), "utf8")); }
  catch { return []; }
}

export async function textoBoot(raizSitio, kitUrl) {
  const archivos = [join(raizSitio, "..", "cdn", "msl-boot.js"), join(raizSitio, "..", "..", "app", "cdn", "msl-boot.js")];
  for (const f of archivos) {
    try {
      const t = await readFile(f, "utf8");
      if (t.includes("data-theme")) return t;
    } catch { /* sigue al CDN */ }
  }
  const r = await fetch(`${kitUrl}/msl-boot.js`);
  if (!r.ok) throw new Error(`msl-boot.js HTTP ${r.status}`);
  const t = await r.text();
  if (!t.includes("data-theme")) throw new Error("msl-boot.js inesperado");
  return t;
}

export async function hornearPaletas(raiz, dist, paletas) {
  if (!paletas.length) return null;
  const hoja = hojaPaletas(paletas);
  const sha = createHash("sha256").update(hoja).digest("hex");
  await mkdir(join(dist, "css", "paletas"), { recursive: true });
  await mkdir(join(raiz, "css", "paletas"), { recursive: true });
  await writeFile(join(dist, "css", "paletas.css"), hoja);
  await writeFile(join(raiz, "css", "paletas.css"), hoja);
  for (let i = 0; i < paletas.length; i++) {
    const css = cssPaleta(paletas[i], { asDefault: i === 0 });
    await writeFile(join(dist, "css", "paletas", `${paletas[i].value}.css`), css);
    await writeFile(join(raiz, "css", "paletas", `${paletas[i].value}.css`), css);
  }
  const meta = { sha256: sha, actualizado: new Date().toISOString(), ids: paletas.map((p) => p.value) };
  const metaTxt = `${JSON.stringify(meta, null, 2)}\n`;
  await writeFile(join(raiz, "css", "paletas.meta.json"), metaTxt);
  await writeFile(join(dist, "css", "paletas.meta.json"), metaTxt);
  return meta;
}
