/** Rozvržení stránky: hlava dokumentu, hlavička, spodní lišta, patička. */

import { h, odkaz, koren } from "../lib/cesty.mjs";
import { podpisAutora } from "./podpis.mjs";
import { ikona } from "./ikony.mjs";

export const MENU = [
  ["o-nas.html", "Ordinace"],
  ["sluzby/index.html", "Služby", "rozbal"],
  ["blog/index.html", "Blog"],
  ["pro-pacienty.html", "Pro pacienty"],
  ["kontakt.html", "Kontakt"],
];

/** Telefon bez mezer do odkazu tel: */
export const tel = (cislo) => cislo.replace(/\s/g, "");

/** Předvyplněný e-mail — ať pacient nemusí vymýšlet, co napsat. */
export function mailtoObjednani(site) {
  const predmet = "Objednání do zubní ordinace";
  const telo = [
    "Dobrý den,",
    "",
    "rád/a bych se objednal/a do vaší ordinace.",
    "",
    "Jméno a příjmení:",
    "Telefon:",
    "Jsem u vás poprvé: ano / ne",
    "Důvod návštěvy (prohlídka, bolest, konzultace):",
    "Kdy se mi to hodí:",
    "",
    "Děkuji za odpověď.",
  ].join("\r\n");
  return `mailto:${site.email}?subject=${encodeURIComponent(predmet)}&body=${encodeURIComponent(telo)}`;
}

/** Hlavička s logem, rozcestníkem a telefonem. */
export function hlavicka(ctx) {
  const { stranka, site, sluzby } = ctx;
  const z = koren(stranka);

  const aktivni = (cil) => {
    if (cil === stranka) return ' aria-current="page"';
    const sekce = cil.replace("/index.html", "/");
    if (cil.includes("/") && stranka.startsWith(sekce)) return ' aria-current="page"';
    return "";
  };

  const panelSluzeb = sluzby.map((s) => `
    <a class="rozbal__polozka" href="${odkaz(stranka, `sluzby/${s.id}.html`)}">
      <span class="rozbal__ikona">${ikona(s.ikona)}</span>
      <span><b>${h(s.nazev)}</b><span>${h(s.kratce)}</span></span>
    </a>`).join("");

  const polozky = MENU.map(([cil, text, typ]) => {
    if (typ !== "rozbal") {
      return `<a href="${odkaz(stranka, cil)}"${aktivni(cil)}>${h(text)}</a>`;
    }
    const tridaAktivni = aktivni(cil) ? " rozbal--aktivni" : "";
    return `
    <div class="rozbal${tridaAktivni}" data-rozbal>
      <button class="rozbal__spoust" type="button" aria-expanded="false">
        ${h(text)} ${ikona("sipkaDolu")}
      </button>
      <div class="rozbal__panel">
        ${panelSluzeb}
      </div>
    </div>`;
  }).join("");

  const t = site.telefony[0].cislo;

  return `
<header class="hlava">
  <div class="obal hlava__vnitrek">
    <a class="znacka" href="${odkaz(stranka, "index.html")}" aria-label="${h(site.znacka)} — domovská stránka">
      <img src="${z}assets/img/logo-tmave.png" width="278" height="74" alt="${h(site.znacka)}">
    </a>
    <button class="prepinac" type="button" aria-expanded="false" aria-controls="menu" data-prepinac>
      <span></span><span class="jen-ctecka">Menu</span>
    </button>
    <nav class="menu" id="menu" aria-label="Hlavní rozcestník">
      ${polozky}
      <a class="tl tl--hlavni tl--maly" href="${odkaz(stranka, "objednani.html")}">Objednat se</a>
    </nav>
    <div class="hlava__akce">
      <a class="hlava__tel" href="tel:${tel(t)}">${ikona("telefon")} ${h(t)}</a>
      <a class="tl tl--hlavni tl--maly" href="${odkaz(stranka, "objednani.html")}">Objednat se</a>
    </div>
  </div>
</header>`;
}

/** Spodní lišta na mobilu — zavolat / napsat, vždy po ruce. */
export function lista(ctx) {
  const { site } = ctx;
  return `
<div class="lista">
  <a class="tl tl--hlavni" href="tel:${tel(site.telefony[0].cislo)}">${ikona("telefon")} Zavolat</a>
  <a class="tl tl--tmavy" href="${mailtoObjednani(site)}">${ikona("obalka")} Napsat</a>
</div>`;
}

export function pruhUkazky(ctx) {
  return `<div class="pruh-ukazky">Ukázka nového webu pro ${h(ctx.site.znacka)} — `
    + `připravil <a href="https://www.bypalda.cz/">byPalda</a></div>`;
}

/** Patička. */
export function patka(ctx) {
  const { stranka, site, sluzby, kategorie } = ctx;
  const z = koren(stranka);
  const a = site.adresa;

  const sloupec = (nadpis, polozky) => `
    <div>
      <h4>${h(nadpis)}</h4>
      <ul>${polozky.map(([cil, text]) =>
        `<li><a href="${odkaz(stranka, cil)}">${h(text)}</a></li>`).join("")}</ul>
    </div>`;

  const doba = site.oteviraciDoba
    .filter((d) => d.od)
    .map((d) => d.zkratka);
  const dobaText = `${doba[0]}–${doba[doba.length - 1]} 8:00–15:00`;

  return `
<footer class="pata">
  <div class="obal">
    <div class="pata__mrizka">
      <div>
        <img src="${z}assets/img/logo-tmave.png" width="278" height="74" alt="${h(site.znacka)}">
        <address>
          ${h(site.firma)}<br>
          ${h(site.lekarka)}<br><br>
          ${h(a.misto)}<br>
          ${h(a.ulice)}<br>
          ${h(a.psc)} ${h(a.mesto)}
        </address>
      </div>
      ${sloupec("Služby", sluzby.map((s) => [`sluzby/${s.id}.html`, s.nazev]))}
      ${sloupec("Blog", [
        ["blog/index.html", "Všechny články"],
        ...kategorie.map((k) => [`blog/${k.id}.html`, k.nazev]),
      ])}
      <div>
        <h4>Spojení</h4>
        <ul>
          ${site.telefony.map((t) =>
            `<li><a href="tel:${tel(t.cislo)}">${h(t.cislo)}</a></li>`).join("")}
          <li><a href="mailto:${h(site.email)}">${h(site.email)}</a></li>
        </ul>
        <h4 style="margin-top:1.6rem">Ordinační hodiny</h4>
        <p style="margin:0">${h(dobaText)}<br>Pá–Ne zavřeno</p>
        <p style="margin:.9rem 0 0"><a href="${odkaz(stranka, "objednani.html")}">Jak se objednat</a></p>
      </div>
    </div>
    <div class="pata__spodek">
      <p style="margin:0">© ${new Date().getFullYear()} ${h(site.firma)} ·
        <a href="${odkaz(stranka, "ochrana-osobnich-udaju.html")}">Ochrana osobních údajů</a></p>
      ${podpisAutora(h(site.domena))}
    </div>
  </div>
</footer>`;
}

/** Celá stránka. */
export function stranka(ctx, { titulek, popis, telo, trida = "", obrazek = null, schema = null }) {
  const { stranka: s, site } = ctx;
  const z = koren(s);
  /* u dlouhých titulků (články) značku nepřipojujeme — ve výsledcích se stejně ořízne */
  const plnyTitulek = titulek
    ? (titulek.length > 55 ? titulek : `${titulek} | ${site.znacka}`)
    : `${site.znacka} — ${site.podtitul}, ${site.lekarka}`;
  const og = obrazek ? `${site.web}/${obrazek}` : null;

  return `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${h(plnyTitulek)}</title>
<meta name="description" content="${h(popis)}">
<meta name="theme-color" content="#070b18">
<link rel="icon" href="${z}assets/img/favicon.png" sizes="180x180">
<link rel="preload" href="${z}assets/fonts/fraunces-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${z}assets/fonts/inter-normal-400-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${z}assets/style.css">
<script>/* obsah se smí schovat jen tehdy, když ho má kdo ukázat: značka jde dolů,
   když prohlížeč animace nechce, a pojistka ji sundá, kdyby web.js nedojel */
try{var d=document.documentElement;if(!matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("js-vjezd");setTimeout(function(){if(!d.hasAttribute("data-vjezd-bezi"))d.classList.remove("js-vjezd")},2500)}}catch(e){}</script>
<meta property="og:type" content="website">
<meta property="og:site_name" content="${h(site.firma)}">
<meta property="og:title" content="${h(plnyTitulek)}">
<meta property="og:description" content="${h(popis)}">
<meta property="og:locale" content="cs_CZ">
${og ? `<meta property="og:image" content="${h(og)}">` : ""}
<meta name="robots" content="noindex, nofollow">
${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ""}
</head>
<body class="${trida}">
<a class="preskocit" href="#obsah">Přeskočit na obsah</a>
${pruhUkazky(ctx)}
${hlavicka(ctx)}
<main id="obsah">
${telo}
</main>
${patka(ctx)}
${lista(ctx)}
<script src="${z}assets/web.js" defer></script>
</body>
</html>
`;
}
