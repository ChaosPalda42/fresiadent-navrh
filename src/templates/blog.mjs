/** Blog: výpis, kategorie, článek. */

import { h, odkaz, koren, uhel } from "../lib/cesty.mjs";
import { ikona } from "./ikony.mjs";
import { tel, mailtoObjednani } from "./layout.mjs";
import * as c from "./casti.mjs";

/* ------------------------------------------------------------------ výpis */

/** Filtrovací štítky kategorií. */
function chipy(ctx, aktivni) {
  const odk = (cil, text, je) =>
    `<a class="chip" href="${odkaz(ctx.stranka, cil)}"${je ? ' aria-current="page"' : ""}>${h(text)}</a>`;

  return `<div class="chipy">
    ${odk("blog/index.html", "Všechny články", !aktivni)}
    ${ctx.kategorie.map((k) => odk(`blog/${k.id}.html`, k.nazev, aktivni === k.id)).join("")}
  </div>`;
}

/** Vybraný článek přes celou šířku. */
function hlavniClanek(ctx, cl) {
  const kat = ctx.kategoriePodleId[cl.kategorie];
  return `
  <a class="hlavni-clanek" href="${odkaz(ctx.stranka, `blog/${cl.id}.html`)}">
    <div class="hlavni-clanek__foto">${c.foto(ctx, cl.foto, "", { velikosti: "(min-width: 1040px) 55vw, 100vw", lazy: false })}</div>
    <div class="hlavni-clanek__telo">
      <span class="stitek">${h(kat ? kat.nazev : "Blog")}</span>
      <h2>${h(cl.titulek)}</h2>
      <p>${h(cl.popis)}</p>
      <div class="meta"><span>${h(c.datum(cl.datum))}</span><span>${cl.minut} min čtení</span></div>
      <span class="sipka">Přečíst článek ${ikona("sipka")}</span>
    </div>
  </a>`;
}

export function blogPrehled(ctx) {
  const { clanky, texty } = ctx;
  const [prvni, ...zbytek] = clanky;

  return {
    titulek: "Blog",
    popis: "Zubařské minimum od MUDr. Zuzany Střelcové: prevence, estetika, protetika, "
      + "endodoncie a chirurgie srozumitelně a bez strašení.",
    obrazek: `assets/img/foto/${prvni.foto}-1600.webp`,
    telo: `
<section class="sluzba-hlava">
  <div class="obal">
    ${c.drobky(ctx, [["index.html", "Úvod"], [null, "Blog"]])}
    <h1>${h(texty.blog.nadpis)}</h1>
    <p>${h(texty.blog.podtitul)}</p>
  </div>
</section>

<section class="sekce">
  <div class="obal">
    ${chipy(ctx, null)}
    ${hlavniClanek(ctx, prvni)}
    <div class="mrizka mrizka--3">${zbytek.map((x) => c.kartaClanku(ctx, x)).join("")}</div>
  </div>
</section>

<section class="sekce sekce--svetla">
  <div class="obal">
    ${c.hlavickaSekce({ nadhlavi: "Rubriky", nadpis: "Projít blog po tématech", stred: true })}
    <div class="mrizka mrizka--3">
      ${ctx.kategorie.map((k) => {
        const pocet = clanky.filter((x) => x.kategorie === k.id).length;
        return `
      <a class="duvod" href="${odkaz(ctx.stranka, `blog/${k.id}.html`)}" style="text-decoration:none;color:inherit;display:block">
        <h3>${h(k.nazev)}</h3>
        <p>${h(k.popis)}</p>
        <span class="sipka" style="margin-top:.9rem">${pocet} ${skloňujClanky(pocet)} ${ikona("sipka")}</span>
      </a>`;
      }).join("")}
    </div>
  </div>
</section>

${c.pruhCta(ctx, {
  nadpis: "Něco vás na zubech trápí?",
  text: "Článek nenahradí prohlídku. Zavolejte nebo napište a domluvíme termín.",
})}`,
  };
}

function skloňujClanky(n) {
  if (n === 1) return "článek";
  if (n >= 2 && n <= 4) return "články";
  return "článků";
}

/* -------------------------------------------------------------- kategorie */

export function kategorieVypis(ctx, k) {
  const vyber = ctx.clanky.filter((x) => x.kategorie === k.id);

  return {
    titulek: `${k.nazev} — blog`,
    popis: `${k.popis} Články zubní ordinace ${ctx.site.lekarka}, Praha 9.`,
    obrazek: vyber.length ? `assets/img/foto/${vyber[0].foto}-1600.webp` : null,
    telo: `
<section class="sluzba-hlava">
  <div class="obal">
    ${c.drobky(ctx, [["index.html", "Úvod"], ["blog/index.html", "Blog"], [null, k.nazev]])}
    <h1>${h(k.nazev)}</h1>
    <p>${h(k.popis)}</p>
  </div>
</section>

<section class="sekce">
  <div class="obal">
    ${chipy(ctx, k.id)}
    ${vyber.length
      ? `<div class="mrizka mrizka--3">${vyber.map((x) => c.kartaClanku(ctx, x)).join("")}</div>`
      : `<p style="color:var(--text-2)">V téhle rubrice zatím nic nemáme. Mrkněte na
         <a href="${odkaz(ctx.stranka, "blog/index.html")}">všechny články</a>.</p>`}
  </div>
</section>

${c.pruhCta(ctx)}`,
  };
}

/* ----------------------------------------------------------------- článek */

/** Tělo článku z bloků. Nadpisy dostanou id kvůli obsahu a odkazování. */
function teloClanku(bloky) {
  const pouzita = new Set();

  return bloky.map((b) => {
    if (b.typ === "nadpis") {
      let id = uhel(b.text).slice(0, 60) || "cast";
      let n = 2;
      while (pouzita.has(id)) id = `${id}-${n++}`;
      pouzita.add(id);
      return `<h2 id="${id}">${h(b.text)}</h2>`;
    }
    if (b.typ === "seznam") {
      return `<ul>${b.polozky.map((p) => `<li>${h(p)}</li>`).join("")}</ul>`;
    }
    return `<p>${h(b.text)}</p>`;
  }).join("\n");
}

export function clanekDetail(ctx, cl) {
  const { site, stranka, clanky, kategoriePodleId, sluzbyPodleId } = ctx;
  const z = koren(stranka);
  const kat = kategoriePodleId[cl.kategorie];
  const sluzba = sluzbyPodleId[cl.sluzba];

  /* související: stejná kategorie, pak doplnit nejnovějšími */
  const souvisejici = [
    ...clanky.filter((x) => x.id !== cl.id && x.kategorie === cl.kategorie),
    ...clanky.filter((x) => x.id !== cl.id && x.kategorie !== cl.kategorie),
  ].slice(0, 3);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: cl.titulek,
    description: cl.popis,
    datePublished: cl.datum,
    author: { "@type": "Person", name: site.lekarka },
    publisher: { "@type": "Organization", name: site.firma },
    image: `${site.web}/assets/img/foto/${cl.foto}-1600.webp`,
    articleSection: kat ? kat.nazev : "Blog",
  };

  return {
    titulek: cl.titulek,
    popis: cl.popis,
    obrazek: `assets/img/foto/${cl.foto}-1600.webp`,
    schema,
    telo: `
<article>
<header class="clanek-hlava">
  <div class="obal">
    ${c.drobky(ctx, [
      ["index.html", "Úvod"],
      ["blog/index.html", "Blog"],
      ...(kat ? [[`blog/${kat.id}.html`, kat.nazev]] : []),
      [null, cl.titulek],
    ])}
    <span class="stitek" style="color:var(--rtg)">${h(kat ? kat.nazev : "Blog")}</span>
    <h1>${h(cl.titulek)}</h1>
    <div class="meta">
      <span>${h(site.lekarka)}</span>
      <span>${h(c.datum(cl.datum))}</span>
      <span>${cl.minut} min čtení</span>
    </div>
    <div class="clanek-hlava__foto">${c.foto(ctx, cl.foto, cl.titulek, { velikosti: "100vw", lazy: false })}</div>
  </div>
</header>

<div class="obal clanek-telo">
  <aside class="obsah-clanku" data-obsah>
    <h2>Obsah článku</h2>
  </aside>

  <div>
    <div class="text">
      ${teloClanku(cl.telo)}

      ${sluzba ? `
      <div class="postranni-box">
        <h3>Souvisí se službou: ${h(sluzba.nazev)}</h3>
        <p>${h(sluzba.kratce)}
          <a href="${odkaz(stranka, `sluzby/${sluzba.id}.html`)}">Víc o službě →</a></p>
      </div>` : ""}
    </div>

    <div class="sdileni">
      <span>Sdílet:</span>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${site.web}/blog/${cl.id}.html`)}"
         target="_blank" rel="noopener" aria-label="Sdílet na Facebooku">${ikona("facebook")}</a>
      <button type="button" data-sdilet hidden aria-label="Sdílet">${ikona("sdilet")}</button>
      <button type="button" class="kopirovat" data-kopirovat="${h(`${site.web}/blog/${cl.id}.html`)}"
              style="width:auto;border-radius:999px;padding:.3rem .9rem">
        ${ikona("kopie")}<span>Kopírovat odkaz</span>
      </button>
    </div>

    <div class="autor">
      <img src="${z}assets/img/foto/lekarka-600.webp" width="74" height="74" loading="lazy"
           alt="${h(site.lekarka)}">
      <div>
        <b>${h(site.lekarka)}</b>
        <span>${h(site.podtitul)} · ${h(site.adresa.misto)}</span>
        <p>Vlastní ordinaci vede od roku 2002. Věnuje se preventivní a estetické
           stomatologii, protetice i celkovým rekonstrukcím chrupu — u dospělých,
           seniorů i malých dětí.</p>
        <a class="tl tl--hlavni tl--maly" href="${odkaz(stranka, "objednani.html")}">Objednat se</a>
      </div>
    </div>
  </div>
</div>
</article>

<section class="sekce sekce--svetla">
  <div class="obal">
    ${c.hlavickaSekce({ nadhlavi: "Čtěte dál", nadpis: "Další články", stred: true })}
    <div class="mrizka mrizka--3">${souvisejici.map((x) => c.kartaClanku(ctx, x)).join("")}</div>
  </div>
</section>

<section class="cta-pruh">
  <div class="obal cta-pruh__vnitrek">
    <div>
      <h2>Potřebujete poradit?</h2>
      <p>Článek nenahradí vyšetření. Zavolejte nebo napište — ozveme se.</p>
    </div>
    <div class="cta-pruh__akce">
      <a class="tl tl--hlavni" href="tel:${tel(site.telefony[0].cislo)}">${ikona("telefon")} ${h(site.telefony[0].cislo)}</a>
      <a class="tl tl--obrys" href="${mailtoObjednani(site)}">${ikona("obalka")} Napsat e-mail</a>
    </div>
  </div>
</section>`,
  };
}
