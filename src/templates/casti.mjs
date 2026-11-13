/** Sdílené sekce, které se opakují na víc stránkách. */

import { h, odkaz, koren } from "../lib/cesty.mjs";
import { ikona } from "./ikony.mjs";
import { tel, mailtoObjednani } from "./layout.mjs";

/* ------------------------------------------------------------------ fotky */

/** Obrázek z assets/img/foto ve dvou velikostech. */
export function foto(ctx, jmeno, alt, { trida = "", velikosti = "100vw", lazy = true } = {}) {
  const z = koren(ctx.stranka);
  return `<img src="${z}assets/img/foto/${jmeno}-800.webp"`
    + ` srcset="${z}assets/img/foto/${jmeno}-800.webp 800w, ${z}assets/img/foto/${jmeno}-1600.webp 1600w"`
    + ` sizes="${velikosti}" alt="${h(alt)}"${trida ? ` class="${trida}"` : ""}`
    + ` width="1600" height="1000"${lazy ? ' loading="lazy" decoding="async"' : ""}>`;
}

/* ----------------------------------------------------------- stav a doba */

/** Živý stav ordinace — text doplní web.js, tohle je rozumný výchozí. */
export function stavOrdinace(text = "Ordinujeme pondělí až čtvrtek, 8–15 hodin") {
  return `<span class="hero__stuzka" data-stav>`
    + `<span class="tecka"></span><span data-stav-text>${h(text)}</span></span>`;
}

/** Otevírací doba jako definiční seznam; dnešek si obarví web.js. */
export function oteviraciDoba(ctx) {
  const radky = ctx.site.oteviraciDoba.map((d, i) => {
    const denVTydnu = (i + 1) % 7; /* pondělí = 1, neděle = 0 — jako Date#getDay */
    const hodnota = d.od ? `${d.od} – ${d.do}` : "zavřeno";
    return `<dt data-den="${denVTydnu}">${h(d.den)}</dt><dd>${h(hodnota)}</dd>`;
  }).join("");
  return `<dl class="doba">${radky}</dl>`;
}

/* -------------------------------------------------------------- objednání */

/** Dvě velké karty: zavolat a napsat. Žádný formulář. */
export function objednaciKanaly(ctx, { email = true } = {}) {
  const { site } = ctx;
  const karty = site.telefony.map((t) => `
    <a class="kanal kanal--tel" href="tel:${tel(t.cislo)}">
      <div class="kanal__hlava">
        <span class="kanal__ikona">${ikona("telefon")}</span>
        <span>
          <span class="kanal__role">${h(t.role)}</span>
          <span class="kanal__hodnota">${h(t.cislo)}</span>
        </span>
      </div>
      <p>${h(t.popis)} — klepnutím rovnou voláte.</p>
    </a>`);

  if (email) {
    karty.push(`
    <a class="kanal kanal--mail" href="${mailtoObjednani(site)}">
      <div class="kanal__hlava">
        <span class="kanal__ikona">${ikona("obalka")}</span>
        <span>
          <span class="kanal__role">E-mailem</span>
          <span class="kanal__hodnota">${h(site.email)}</span>
        </span>
      </div>
      <p>Otevře se rozepsaný e-mail — stačí doplnit jméno, telefon a kdy se vám to hodí.</p>
      <span class="kanal__pata">
        <button class="kopirovat" type="button" data-kopirovat="${h(site.email)}">
          ${ikona("kopie")}<span>Zkopírovat adresu</span>
        </button>
      </span>
    </a>`);
  }

  return `<div class="objednat">${karty.join("")}</div>`;
}

/* ----------------------------------------------------------------- sekce */

/** Hlavička sekce: nadhlaví, nadpis, podtitul. */
export function hlavickaSekce({ nadhlavi, nadpis, podtitul = "", stred = false, uroven = 2 }) {
  return `
  <div class="hlavicka-sekce${stred ? " hlavicka-sekce--stred" : ""}">
    ${nadhlavi ? `<span class="nadhlavi">${h(nadhlavi)}</span>` : ""}
    <h${uroven}>${nadpis}</h${uroven}>
    ${podtitul ? `<p>${h(podtitul)}</p>` : ""}
  </div>`;
}

/** Úvodní tmavá scéna s nasvíceným zubem. */
export function hero(ctx) {
  const { site, texty, stranka } = ctx;
  const z = koren(stranka);
  const t = site.telefony[0].cislo;

  return `
<section class="hero">
  <canvas class="hero__platno" data-zub="${z}assets/img/zub-maska.png" aria-hidden="true"></canvas>
  <div class="obal hero__vnitrek">
    <div class="hero__text">
      ${stavOrdinace()}
      <h1>Zdravý úsměv <em>začíná</em> v naší ordinaci</h1>
      <p class="hero__podtitul">${h(texty.hero.podtitul)}</p>
      <div class="hero__akce">
        <a class="tl tl--hlavni" href="${odkaz(stranka, "objednani.html")}">Objednat se</a>
        <a class="tl tl--obrys" href="${odkaz(stranka, "sluzby/index.html")}">Prohlédnout služby</a>
      </div>
    </div>
    <div class="hero__zub">
      <img src="${z}assets/img/zub-maska.png" width="330" height="330" alt="" aria-hidden="true">
    </div>
  </div>
  <div class="hero__pata">
    <div class="hero__dlazdice">
      <b>Přijímáme nové pacienty</b>
      <span>stačí zavolat, termín domluvíme hned</span>
    </div>
    <div class="hero__dlazdice">
      <b>Smlouvy se zdravotními pojišťovnami</b>
      <span>doplatky říkáme předem, ne až u pokladny</span>
    </div>
    <div class="hero__dlazdice">
      <b>${h(site.adresa.misto)}, ${h(site.adresa.mesto)}</b>
      <span>metro B, hlídané parkoviště u budovy</span>
    </div>
  </div>
</section>`;
}

/** Proč k nám chodí lidé z celé Prahy. */
export function duvody(ctx) {
  const { texty } = ctx;
  const karty = texty.proc.polozky.map((p) => `
    <div class="duvod">
      <span class="duvod__ikona">${ikona(p.ikona)}</span>
      <h3>${h(p.nadpis)}</h3>
      <p>${h(p.text)}</p>
    </div>`).join("");

  return `
<section class="sekce">
  <div class="obal">
    ${hlavickaSekce({ nadhlavi: "Proč k nám", nadpis: h(texty.proc.nadpis), stred: true })}
    <div class="mrizka mrizka--4">${karty}</div>
  </div>
</section>`;
}

/** Karta jedné služby. */
export function kartaSluzby(ctx, s) {
  return `
  <a class="sluzba-karta" href="${odkaz(ctx.stranka, `sluzby/${s.id}.html`)}">
    <div class="sluzba-karta__foto">${foto(ctx, s.foto, s.nazev, { velikosti: "(min-width: 880px) 32vw, 100vw" })}</div>
    <div class="sluzba-karta__telo">
      <h3>${h(s.nazev)}</h3>
      <p>${h(s.kratce)}</p>
      <span class="sipka">Více o službě ${ikona("sipka")}</span>
    </div>
  </a>`;
}

/** Mřížka služeb. */
export function sekceSluzeb(ctx, { kolik = null, nadpis = "Co u nás vyřešíte", podtitul = "" } = {}) {
  const vyber = kolik ? ctx.sluzby.slice(0, kolik) : ctx.sluzby;
  return `
<section class="sekce sekce--svetla">
  <div class="obal">
    ${hlavickaSekce({ nadhlavi: "Služby", nadpis: h(nadpis), podtitul, stred: true })}
    <div class="mrizka mrizka--3">${vyber.map((s) => kartaSluzby(ctx, s)).join("")}</div>
    ${kolik && kolik < ctx.sluzby.length ? `
    <p style="text-align:center;margin-top:2.2rem">
      <a class="tl tl--obrys tl--modry" href="${odkaz(ctx.stranka, "sluzby/index.html")}">Všechny služby ${ikona("sipka")}</a>
    </p>` : ""}
  </div>
</section>`;
}

/** Představení lékařky s citátem a čísly. */
export function sekceLekarky(ctx, { zkracene = true } = {}) {
  const { site, texty, stranka } = ctx;
  const z = koren(stranka);
  const odstavce = (zkracene ? texty.oNas.odstavce.slice(0, 2) : texty.oNas.odstavce)
    .map((o) => `<p>${h(o)}</p>`).join("");

  const cisla = site.cisla.map((c) =>
    `<div><b>${h(c.hodnota)}</b><span>${h(c.popis)}</span></div>`).join("");

  return `
<section class="sekce">
  <div class="obal lekarka">
    <div class="lekarka__foto">
      <img src="${z}assets/img/foto/lekarka-600.webp"
           srcset="${z}assets/img/foto/lekarka-600.webp 600w, ${z}assets/img/foto/lekarka-1100.webp 1100w"
           sizes="(min-width: 1040px) 40vw, 100vw"
           width="1100" height="1375" loading="lazy" decoding="async"
           alt="${h(site.lekarka)}">
    </div>
    <div>
      <span class="nadhlavi">Kdo vás ošetří</span>
      <h2>${h(site.lekarka)}</h2>
      ${odstavce}
      <blockquote class="citat">
        <q>${h(site.motto)}</q>
        <cite>${h(site.mottoPreklad)} — lékařský slib, kterým se ordinace řídí</cite>
      </blockquote>
      <div class="cisla">${cisla}</div>
      ${zkracene ? `<p style="margin-top:1.8rem">
        <a class="sipka" href="${odkaz(stranka, "o-nas.html")}">Víc o ordinaci ${ikona("sipka")}</a>
      </p>` : ""}
    </div>
  </div>
</section>`;
}

/** Tmavý pás: jak probíhá první návštěva. */
export function sekceNavstevy(ctx) {
  const { texty } = ctx;
  const kroky = texty.navsteva.kroky.map((k) => `
    <div class="krok">
      <span class="krok__cislo">${h(k.cislo)}</span>
      <h3>${h(k.nadpis)}</h3>
      <p>${h(k.text)}</p>
    </div>`).join("");

  return `
<section class="sekce sekce--tmava">
  <div class="obal">
    ${hlavickaSekce({
      nadhlavi: "První návštěva",
      nadpis: h(texty.navsteva.nadpis),
      podtitul: texty.navsteva.podtitul,
    })}
    <div class="kroky">${kroky}</div>
  </div>
</section>`;
}

/** Sekce objednání — dvě karty a vedle nich hodiny. */
export function sekceObjednani(ctx, { svetla = true } = {}) {
  const { texty, stranka } = ctx;
  return `
<section class="sekce${svetla ? " sekce--svetla" : ""}">
  <div class="obal">
    ${hlavickaSekce({
      nadhlavi: "Objednání",
      nadpis: h(texty.objednani.nadpis),
      podtitul: texty.objednani.podtitul,
      stred: true,
    })}
    ${objednaciKanaly(ctx)}
    <div class="mrizka mrizka--2" style="margin-top:1.1rem">
      <div class="panel">
        <h3>Ordinační hodiny</h3>
        ${oteviraciDoba(ctx)}
      </div>
      <div class="panel">
        <h3>Než zavoláte</h3>
        <p style="font-size:.94rem;color:var(--text-2);margin-bottom:.9rem">
          Připravte si kartičku pojišťovny. Když voláte kvůli bolesti, řekněte to rovnou —
          hledáme místo ještě týž den.
        </p>
        <a class="sipka" href="${odkaz(stranka, "pro-pacienty.html")}">Časté dotazy ${ikona("sipka")}</a>
      </div>
    </div>
  </div>
</section>`;
}

/* -------------------------------------------------------------- doprava */

/** Jak se k nám dostanete. */
export function dopravaBlok(ctx) {
  return `<div class="doprava">${ctx.site.doprava.map((d) => `
    <div>
      <span class="doprava__ikona">${ikona(d.ikona)}</span>
      <div><b>${h(d.nadpis)}</b><p>${h(d.text)}</p></div>
    </div>`).join("")}</div>`;
}

/** Vložená mapa. */
export function mapaBlok(ctx) {
  const { site } = ctx;
  const q = encodeURIComponent(`${site.adresa.ulice}, ${site.adresa.psc} ${site.adresa.mesto}`);
  const bbox = [
    (site.mapa.lon - 0.006).toFixed(4), (site.mapa.lat - 0.003).toFixed(4),
    (site.mapa.lon + 0.006).toFixed(4), (site.mapa.lat + 0.003).toFixed(4),
  ].join("%2C");
  return `
  <div class="mapa">
    <iframe title="Mapa — ${h(site.adresa.misto)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
      src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&amp;layer=mapnik&amp;marker=${site.mapa.lat}%2C${site.mapa.lon}"></iframe>
  </div>
  <p style="font-size:.85rem;margin-top:.7rem">
    <a class="sipka" href="https://mapy.com/zakladni?q=${q}" target="_blank" rel="noopener">Otevřít v Mapách ${ikona("sipka")}</a>
  </p>`;
}

/** Štítky pojišťoven. */
export function pojistovny(ctx) {
  return `<div class="pojistovny">${ctx.site.pojistovny
    .map((p) => `<span class="pojistovna">${h(p)}</span>`).join("")}</div>`;
}

/* ------------------------------------------------------------------ blog */

/** Karta článku do mřížky. */
export function kartaClanku(ctx, c) {
  const kat = ctx.kategoriePodleId[c.kategorie];
  return `
  <a class="clanek-karta" href="${odkaz(ctx.stranka, `blog/${c.id}.html`)}">
    <div class="clanek-karta__foto">${foto(ctx, c.foto, "", { velikosti: "(min-width: 880px) 32vw, 100vw" })}</div>
    <div class="clanek-karta__telo">
      <span class="stitek">${h(kat ? kat.nazev : "Blog")}</span>
      <h3>${h(c.titulek)}</h3>
      <p>${h(c.popis)}</p>
      <div class="meta"><span>${h(datum(c.datum))}</span><span>${c.minut} min čtení</span></div>
    </div>
  </a>`;
}

/** Tři nejnovější články na úvodní stránce. */
export function sekceBlogu(ctx, { kolik = 3 } = {}) {
  const { texty, clanky, stranka } = ctx;
  return `
<section class="sekce">
  <div class="obal">
    ${hlavickaSekce({
      nadhlavi: "Blog",
      nadpis: h(texty.blog.nadpis),
      podtitul: texty.blog.podtitul,
      stred: true,
    })}
    <div class="mrizka mrizka--3">${clanky.slice(0, kolik).map((c) => kartaClanku(ctx, c)).join("")}</div>
    <p style="text-align:center;margin-top:2.2rem">
      <a class="tl tl--obrys tl--modry" href="${odkaz(stranka, "blog/index.html")}">Všechny články ${ikona("sipka")}</a>
    </p>
  </div>
</section>`;
}

/* ------------------------------------------------------------------- CTA */

/** Tmavý pruh s výzvou — na konci skoro každé stránky. */
export function pruhCta(ctx, {
  nadpis = "Potřebujete se objednat?",
  text = "Zavolejte nebo napište. Ozveme se a domluvíme termín.",
} = {}) {
  const { site, stranka } = ctx;
  return `
<section class="cta-pruh">
  <div class="obal cta-pruh__vnitrek">
    <div>
      <h2>${h(nadpis)}</h2>
      <p>${h(text)}</p>
    </div>
    <div class="cta-pruh__akce">
      <a class="tl tl--hlavni" href="tel:${tel(site.telefony[0].cislo)}">${ikona("telefon")} ${h(site.telefony[0].cislo)}</a>
      <a class="tl tl--obrys" href="${odkaz(stranka, "objednani.html")}">Jak se objednat</a>
    </div>
  </div>
</section>`;
}

/* ----------------------------------------------------------------- dotazy */

export function dotazy(seznam) {
  return seznam.map((d) => `
  <details class="dotaz">
    <summary>${h(d.otazka)}</summary>
    <p>${h(d.odpoved)}</p>
  </details>`).join("");
}

/* ------------------------------------------------------------------ různé */

const MESICE = ["ledna", "února", "března", "dubna", "května", "června",
  "července", "srpna", "září", "října", "listopadu", "prosince"];

/** 2025-11-24 → 24. listopadu 2025 */
export function datum(iso) {
  const [r, m, d] = iso.split("-").map(Number);
  return `${d}. ${MESICE[m - 1]} ${r}`;
}

/** Drobečková navigace. */
export function drobky(ctx, cesta) {
  const casti = cesta.map(([cil, text]) => cil
    ? `<a href="${odkaz(ctx.stranka, cil)}">${h(text)}</a>`
    : h(text));
  return `<nav class="drobky" aria-label="Drobečková navigace">${casti.join('<span>›</span>')}</nav>`;
}
