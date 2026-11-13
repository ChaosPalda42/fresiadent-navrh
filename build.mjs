/** Sestavení ukázky webu: data + šablony → out/web/ */

import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { stranka } from "./src/templates/layout.mjs";
import * as web from "./src/templates/web.mjs";
import * as blog from "./src/templates/blog.mjs";

const KOREN = dirname(fileURLToPath(import.meta.url));
const VEN = join(KOREN, "out", "web");

const nacti = (jmeno) => JSON.parse(readFileSync(join(KOREN, "data", jmeno), "utf8"));

const site = nacti("site.json");
const sluzby = nacti("sluzby.json");
const texty = nacti("texty.json");
const kategorie = nacti("kategorie.json");

/* články od nejnovějšího */
const clanky = nacti("clanky.json")
  .slice()
  .sort((a, b) => b.datum.localeCompare(a.datum));

const zaklad = {
  site, sluzby, texty, kategorie, clanky,
  sluzbyPodleId: Object.fromEntries(sluzby.map((s) => [s.id, s])),
  kategoriePodleId: Object.fromEntries(kategorie.map((k) => [k.id, k])),
};

/** [cesta, funkce] — funkce vrací díly pro stranka(). */
const stranky = [
  ["index.html", web.uvod],
  ["o-nas.html", web.oNas],
  ["sluzby/index.html", web.sluzbyPrehled],
  ["objednani.html", web.objednani],
  ["kontakt.html", web.kontakt],
  ["pro-pacienty.html", web.proPacienty],
  ["ochrana-osobnich-udaju.html", web.gdpr],
  ["404.html", web.nenalezeno],
  ...sluzby.map((s) => [`sluzby/${s.id}.html`, (ctx) => web.sluzbaDetail(ctx, s)]),
  ["blog/index.html", blog.blogPrehled],
  ...kategorie.map((k) => [`blog/${k.id}.html`, (ctx) => blog.kategorieVypis(ctx, k)]),
  ...clanky.map((cl) => [`blog/${cl.id}.html`, (ctx) => blog.clanekDetail(ctx, cl)]),
];

function zapis(cesta, obsah) {
  const cil = join(VEN, cesta);
  mkdirSync(dirname(cil), { recursive: true });
  writeFileSync(cil, obsah, "utf8");
}

function hlavni() {
  rmSync(VEN, { recursive: true, force: true });
  mkdirSync(VEN, { recursive: true });

  cpSync(join(KOREN, "src", "assets"), join(VEN, "assets"), { recursive: true });

  const videna = new Set();
  let bajtu = 0;

  for (const [cesta, fn] of stranky) {
    if (videna.has(cesta)) throw new Error(`dvě stránky na stejné adrese: ${cesta}`);
    videna.add(cesta);

    const ctx = { ...zaklad, stranka: cesta };
    const html = stranka(ctx, fn(ctx));
    zapis(cesta, html);
    bajtu += Buffer.byteLength(html);
  }

  /* ukázka se nemá indexovat — stránky mají navíc noindex v hlavičce */
  zapis("robots.txt", "User-agent: *\nDisallow: /\n");
  /* GitHub Pages jinak prožene výstup Jekyllem */
  zapis(".nojekyll", "");

  console.log(`hotovo: ${stranky.length} stránek, ${(bajtu / 1024).toFixed(0)} kB HTML → out/web`);
}

hlavni();
