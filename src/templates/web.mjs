/** Stránky veřejného webu. Každá funkce vrací díly pro stranka(). */

import { h, odkaz, koren } from "../lib/cesty.mjs";
import { ikona } from "./ikony.mjs";
import { tel, mailtoObjednani } from "./layout.mjs";
import * as c from "./casti.mjs";

/* ------------------------------------------------------- strukturovaná data */

/** Dentist — adresa, hodiny, telefon. Kvůli vyhledávání a Mapám. */
export function schemaOrdinace(ctx) {
  const { site } = ctx;
  const dny = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const hodiny = site.oteviraciDoba
    .map((d, i) => d.od ? {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${dny[i]}`,
      opens: d.od, closes: d.do,
    } : null)
    .filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: site.firma,
    alternateName: site.znacka,
    url: site.web,
    telephone: site.telefony[0].cislo,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.adresa.ulice,
      addressLocality: site.adresa.mesto,
      postalCode: site.adresa.psc,
      addressCountry: "CZ",
    },
    geo: { "@type": "GeoCoordinates", latitude: site.mapa.lat, longitude: site.mapa.lon },
    openingHoursSpecification: hodiny,
    medicalSpecialty: "Dentistry",
    availableService: ctx.sluzby.map((s) => ({ "@type": "MedicalProcedure", name: s.nazev })),
  };
}

/* ------------------------------------------------------------------- úvod */

export function uvod(ctx) {
  return {
    titulek: "",
    popis: `Zubní ordinace ${ctx.site.lekarka} v Poliklinice Vysočany, Praha 9. `
      + "Prevence, estetická stomatologie, zirkonové korunky, endodoncie. Přijímáme nové pacienty.",
    obrazek: "assets/img/foto/vysetreni-1600.webp",
    schema: schemaOrdinace(ctx),
    telo: [
      c.hero(ctx),
      c.duvody(ctx),
      c.sekceSluzeb(ctx, {
        kolik: 6,
        nadpis: "Co u nás vyřešíte",
        podtitul: "Od preventivní prohlídky po rekonstrukci celého chrupu. "
          + "U každé služby najdete, co obnáší, jak dlouho trvá a co hradí pojišťovna.",
      }),
      c.sekceLekarky(ctx),
      c.sekceNavstevy(ctx),
      c.sekceObjednani(ctx),
      sekceKdeNasNajdete(ctx),
      c.sekceBlogu(ctx),
      c.pruhCta(ctx),
    ].join(""),
  };
}

/** Kde nás najdete — mapa, doprava, pojišťovny. */
function sekceKdeNasNajdete(ctx) {
  const { site } = ctx;
  return `
<section class="sekce">
  <div class="obal">
    ${c.hlavickaSekce({ nadhlavi: "Kde nás najdete", nadpis: `${h(site.adresa.misto)}, ${h(site.adresa.mesto)}` })}
    <div class="mrizka mrizka--2">
      ${c.mapaBlok(ctx)}
      <div>
        <address style="font-style:normal;font-size:1.05rem;line-height:1.75;margin-bottom:1.6rem">
          <b>${h(site.firma)}</b><br>
          ${h(site.adresa.misto)}<br>
          ${h(site.adresa.ulice)}<br>
          ${h(site.adresa.psc)} ${h(site.adresa.mesto)} – ${h(site.adresa.ctvrt)}
        </address>
        ${c.dopravaBlok(ctx)}
        <h3 style="font-family:Inter,sans-serif;font-size:1rem;margin-top:2rem">Smlouvy se zdravotními pojišťovnami</h3>
        ${c.pojistovny(ctx)}
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ o nás */

export function oNas(ctx) {
  const { site, texty, stranka } = ctx;
  const z = koren(stranka);

  const zivotopis = texty.oNas.zivotopis.map((o) => `<p>${h(o)}</p>`).join("");
  const cisla = site.cisla.map((x) =>
    `<div><b>${h(x.hodnota)}</b><span>${h(x.popis)}</span></div>`).join("");

  return {
    titulek: "Ordinace",
    popis: `${site.lekarka} — přes 25 let praxe, vlastní ordinace od roku 2002. `
      + "Poliklinika Vysočany, Praha 9. Dospělí, senioři i malé děti.",
    obrazek: "assets/img/foto/lekarka-1100.webp",
    telo: `
<section class="sluzba-hlava">
  <div class="obal">
    ${c.drobky(ctx, [["index.html", "Úvod"], [null, "Ordinace"]])}
    <h1>${h(texty.oNas.nadpis)}</h1>
    <p>Místo, kde se víc než pětadvacet let zkušeností potkává s moderním vybavením — a kde má každý pacient prostor na otázky.</p>
  </div>
</section>

<section class="sekce">
  <div class="obal lekarka">
    <div class="lekarka__foto">
      <img src="${z}assets/img/foto/lekarka-600.webp"
           srcset="${z}assets/img/foto/lekarka-600.webp 600w, ${z}assets/img/foto/lekarka-1100.webp 1100w"
           sizes="(min-width: 1040px) 40vw, 100vw"
           width="1100" height="1375" decoding="async" alt="${h(site.lekarka)}">
    </div>
    <div>
      <span class="nadhlavi">Kdo vás ošetří</span>
      <h2>${h(site.lekarka)}</h2>
      ${zivotopis}
      <blockquote class="citat">
        <q>${h(site.motto)}</q>
        <cite>${h(site.mottoPreklad)} — lékařský slib, kterým se ordinace řídí</cite>
      </blockquote>
      <div class="cisla">${cisla}</div>
    </div>
  </div>
</section>

<section class="sekce sekce--svetla">
  <div class="obal">
    ${c.hlavickaSekce({ nadhlavi: "Ordinace", nadpis: "Jak to u nás vypadá", stred: true })}
    <div class="mrizka mrizka--3">
      ${["vysetreni", "zrcatko", "pece"].map((f, i) => `
      <figure style="margin:0;border-radius:var(--r);overflow:hidden;border:1px solid var(--linka)">
        ${c.foto(ctx, f, ["Ošetřovna", "Vyšetření", "Péče o pacienta"][i], { velikosti: "(min-width: 880px) 32vw, 100vw" })}
      </figure>`).join("")}
    </div>
    <p style="max-width:44rem;margin:2rem auto 0;text-align:center;color:var(--text-2)">
      ${h(texty.oNas.odstavce[1])}
    </p>
  </div>
</section>

${c.sekceNavstevy(ctx)}
${c.sekceSluzeb(ctx, { nadpis: "Služby ordinace", podtitul: "Sedm oblastí, kterým se věnujeme." })}
${c.pruhCta(ctx)}`,
  };
}

/* ---------------------------------------------------------------- služby */

export function sluzbyPrehled(ctx) {
  return {
    titulek: "Služby",
    popis: "Preventivní a estetická stomatologie, bělení zubů, zirkonové korunky, protetika, "
      + "endodoncie a zubní chirurgie. Zubní ordinace v Praze 9 – Vysočanech.",
    obrazek: "assets/img/foto/zrcatko-1600.webp",
    telo: `
<section class="sluzba-hlava">
  <div class="obal">
    ${c.drobky(ctx, [["index.html", "Úvod"], [null, "Služby"]])}
    <h1>Služby ordinace</h1>
    <p>Od preventivní prohlídky po rekonstrukci celého chrupu. U každé služby píšeme,
       co obnáší, jak dlouho trvá a co z ní hradí pojišťovna.</p>
  </div>
</section>

<section class="sekce">
  <div class="obal">
    <div class="mrizka mrizka--3">${ctx.sluzby.map((s) => c.kartaSluzby(ctx, s)).join("")}</div>
  </div>
</section>

${c.sekceNavstevy(ctx)}
${c.sekceObjednani(ctx)}
${c.pruhCta(ctx)}`,
  };
}

export function sluzbaDetail(ctx, s) {
  const { site, stranka, clanky, kategoriePodleId } = ctx;
  const kroky = s.prubeh || s.vyhody || [];
  const nadpisKroku = s.prubeh ? "Jak ošetření probíhá" : "Proč zrovna tohle řešení";

  const souvisejici = clanky.filter((x) => x.sluzba === s.id).slice(0, 3);
  const dalsi = ctx.sluzby.filter((x) => x.id !== s.id).slice(0, 3);

  return {
    titulek: s.nazev,
    popis: s.kratce,
    obrazek: `assets/img/foto/${s.foto}-1600.webp`,
    telo: `
<section class="sluzba-hlava">
  <div class="obal">
    ${c.drobky(ctx, [["index.html", "Úvod"], ["sluzby/index.html", "Služby"], [null, s.nazev]])}
    <h1>${h(s.nazev)}</h1>
    <p>${h(s.kratce)}</p>
  </div>
</section>

<section class="sekce">
  <div class="obal sluzba-mrizka">
    <div>
      <div style="border-radius:var(--r);overflow:hidden;margin-bottom:2rem">
        ${c.foto(ctx, s.foto, s.nazev, { velikosti: "(min-width: 1040px) 62vw, 100vw", lazy: false })}
      </div>
      <p style="font-size:1.12rem;color:var(--text)">${h(s.perex)}</p>

      ${kroky.length ? `
      <h2 style="margin-top:2.4rem">${h(nadpisKroku)}</h2>
      <div class="kroky" style="margin-top:1.6rem">
        ${kroky.map((k, i) => `
        <div class="krok">
          <span class="krok__cislo">${String(i + 1).padStart(2, "0")}</span>
          <h3>${h(k.nadpis)}</h3>
          <p>${h(k.text)}</p>
        </div>`).join("")}
      </div>` : ""}

      ${souvisejici.length ? `
      <h2 style="margin-top:3rem">Z blogu k tomuhle tématu</h2>
      <div class="mrizka mrizka--2" style="margin-top:1.4rem">
        ${souvisejici.map((x) => c.kartaClanku(ctx, x)).join("")}
      </div>` : ""}
    </div>

    <aside>
      <div class="panel" style="margin-bottom:1.1rem">
        <h3>Co služba zahrnuje</h3>
        <ul class="seznam-fajf">
          ${s.obsahuje.map((x) => `<li>${ikona("fajfka")}<span>${h(x)}</span></li>`).join("")}
        </ul>
      </div>
      <div class="panel" style="margin-bottom:1.1rem">
        <h3>Dobré vědět</h3>
        <div class="fakta">
          <div>${ikona("hodiny")}<span><b>Trvání</b>${h(s.trvani)}</span></div>
          <div>${ikona("penize")}<span><b>Úhrada</b>${h(s.hrazeno)}</span></div>
          <div>${ikona("mapa")}<span><b>Kde</b>${h(site.adresa.misto)}, ${h(site.adresa.ulice)}, ${h(site.adresa.mesto)}</span></div>
        </div>
      </div>
      <div class="panel">
        <h3>Objednat se na ${h(s.nazev.toLowerCase())}</h3>
        <p style="font-size:.93rem;color:var(--text-2);margin-bottom:1rem">
          Bez formuláře — zavolejte, nebo nám napište a ozveme se.
        </p>
        <a class="tl tl--hlavni tl--maly" style="width:100%;justify-content:center;margin-bottom:.6rem"
           href="tel:${tel(site.telefony[0].cislo)}">${ikona("telefon")} ${h(site.telefony[0].cislo)}</a>
        <a class="tl tl--obrys tl--modry tl--maly" style="width:100%;justify-content:center"
           href="${mailtoObjednani(site)}">${ikona("obalka")} Napsat e-mail</a>
      </div>
    </aside>
  </div>
</section>

<section class="sekce sekce--svetla">
  <div class="obal">
    ${c.hlavickaSekce({ nadhlavi: "Další služby", nadpis: "Co ještě u nás vyřešíte", stred: true })}
    <div class="mrizka mrizka--3">${dalsi.map((x) => c.kartaSluzby(ctx, x)).join("")}</div>
  </div>
</section>

${c.pruhCta(ctx)}`,
  };
}

/* -------------------------------------------------------------- objednání */

export function objednani(ctx) {
  const { site, texty } = ctx;
  return {
    titulek: "Objednat se",
    popis: `Objednání do zubní ordinace ${site.lekarka}: telefonem na ${site.telefony[0].cislo} `
      + `nebo e-mailem na ${site.email}. Poliklinika Vysočany, Praha 9.`,
    telo: `
<section class="sluzba-hlava">
  <div class="obal">
    ${c.drobky(ctx, [["index.html", "Úvod"], [null, "Objednat se"]])}
    <h1>${h(texty.objednani.nadpis)}</h1>
    <p>${h(texty.objednani.podtitul)}</p>
    <p style="margin-top:1.2rem">${c.stavOrdinace()}</p>
  </div>
</section>

<section class="sekce">
  <div class="obal">
    ${c.objednaciKanaly(ctx)}

    <div class="mrizka mrizka--2" style="margin-top:1.1rem">
      <div class="panel">
        <h3>Ordinační hodiny</h3>
        ${c.oteviraciDoba(ctx)}
        <p style="font-size:.9rem;color:var(--text-2);margin-top:1rem">
          Mimo ordinační hodiny nám napište — ozveme se hned ráno, jak otevřeme.
        </p>
      </div>
      <div class="panel">
        <h3>Co si připravit</h3>
        <ul class="seznam-fajf">
          <li>${ikona("fajfka")}<span>Kartičku zdravotní pojišťovny</span></li>
          <li>${ikona("fajfka")}<span>Průkaz totožnosti</span></li>
          <li>${ikona("fajfka")}<span>Seznam léků, které pravidelně berete</span></li>
          <li>${ikona("fajfka")}<span>Snímky a zprávy od předchozího zubaře, pokud je máte</span></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="sekce sekce--tmava">
  <div class="obal">
    ${c.hlavickaSekce({ nadhlavi: "Akutní bolest", nadpis: "Bolí to teď" })}
    <div class="mrizka mrizka--2">
      <div>
        <p>Když voláte kvůli bolesti nebo otoku, řekněte to hned na začátku hovoru.
           Hledáme místo ještě týž den — i mezi objednanými pacienty.</p>
        <p>Mimo ordinační hodiny, o víkendu a ve svátek využijte
           <strong>pohotovostní stomatologickou službu v Praze</strong>. Na nás se ozvěte
           e-mailem, ať o vás víme a navážeme, jak otevřeme.</p>
      </div>
      <div class="panel">
        <h3>Zavolat hned</h3>
        ${site.telefony.map((t) => `
        <p style="margin-bottom:.9rem">
          <a class="tl tl--hlavni tl--maly" style="width:100%;justify-content:center"
             href="tel:${tel(t.cislo)}">${ikona("telefon")} ${h(t.cislo)}</a>
          <span style="display:block;font-size:.82rem;color:#93a3bb;margin-top:.4rem;text-align:center">${h(t.role)} — ${h(t.popis)}</span>
        </p>`).join("")}
      </div>
    </div>
  </div>
</section>

${sekceKdeNasNajdete(ctx)}`,
  };
}

/* ----------------------------------------------------------------- kontakt */

export function kontakt(ctx) {
  const { site } = ctx;
  return {
    titulek: "Kontakt",
    popis: `${site.firma}, ${site.adresa.misto}, ${site.adresa.ulice}, ${site.adresa.psc} `
      + `${site.adresa.mesto}. Telefon ${site.telefony[0].cislo}, e-mail ${site.email}.`,
    schema: schemaOrdinace(ctx),
    telo: `
<section class="sluzba-hlava">
  <div class="obal">
    ${c.drobky(ctx, [["index.html", "Úvod"], [null, "Kontakt"]])}
    <h1>Kontakt</h1>
    <p>${h(site.adresa.misto)}, ${h(site.adresa.ulice)}, ${h(site.adresa.mesto)} – ${h(site.adresa.ctvrt)}.</p>
  </div>
</section>

<section class="sekce">
  <div class="obal">
    ${c.objednaciKanaly(ctx)}
  </div>
</section>

${sekceKdeNasNajdete(ctx)}

<section class="sekce sekce--svetla">
  <div class="obal">
    <div class="mrizka mrizka--2">
      <div class="panel">
        <h3>Ordinační hodiny</h3>
        ${c.oteviraciDoba(ctx)}
      </div>
      <div class="panel">
        <h3>Fakturační údaje</h3>
        <p style="font-size:.95rem;color:var(--text-2);line-height:1.8;margin:0">
          ${h(site.firma)}<br>
          ${h(site.adresa.ulice)}, ${h(site.adresa.psc)} ${h(site.adresa.mesto)}<br>
          Odborný zástupce: ${h(site.lekarka)}<br>
          Členka České stomatologické komory
        </p>
      </div>
    </div>
  </div>
</section>

${c.pruhCta(ctx)}`,
  };
}

/* ------------------------------------------------------------ pro pacienty */

export function proPacienty(ctx) {
  const { texty } = ctx;
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: texty.pacienti.dotazy.map((d) => ({
      "@type": "Question",
      name: d.otazka,
      acceptedAnswer: { "@type": "Answer", text: d.odpoved },
    })),
  };

  return {
    titulek: "Pro pacienty",
    popis: "Časté dotazy: přijímáme nové pacienty, smlouvy s pojišťovnami, "
      + "co dělat při akutní bolesti, parkování a co si vzít k první návštěvě.",
    schema,
    telo: `
<section class="sluzba-hlava">
  <div class="obal">
    ${c.drobky(ctx, [["index.html", "Úvod"], [null, "Pro pacienty"]])}
    <h1>${h(texty.pacienti.nadpis)}</h1>
    <p>${h(texty.pacienti.podtitul)}</p>
  </div>
</section>

${c.sekceNavstevy(ctx)}

<section class="sekce">
  <div class="obal obal--uzky">
    ${c.hlavickaSekce({ nadhlavi: "Časté dotazy", nadpis: "Na co se ptáte nejčastěji" })}
    ${c.dotazy(texty.pacienti.dotazy)}
  </div>
</section>

<section class="sekce sekce--svetla">
  <div class="obal">
    <div class="mrizka mrizka--2">
      <div class="panel">
        <h3>Smlouvy se zdravotními pojišťovnami</h3>
        <p style="font-size:.93rem;color:var(--text-2)">
          Ošetření hrazené z veřejného zdravotního pojištění účtujeme pojišťovně.
          U nadstandardních materiálů a estetických výkonů se doplácí — cenu vám řekneme předem.
        </p>
        ${c.pojistovny(ctx)}
      </div>
      <div class="panel">
        <h3>Co si vzít s sebou</h3>
        <ul class="seznam-fajf">
          <li>${ikona("fajfka")}<span>Kartičku zdravotní pojišťovny</span></li>
          <li>${ikona("fajfka")}<span>Průkaz totožnosti</span></li>
          <li>${ikona("fajfka")}<span>Seznam pravidelně užívaných léků</span></li>
          <li>${ikona("fajfka")}<span>Dokumentaci od předchozího zubaře, pokud ji máte</span></li>
        </ul>
      </div>
    </div>
  </div>
</section>

${c.sekceObjednani(ctx, { svetla: false })}
${c.pruhCta(ctx)}`,
  };
}

/* -------------------------------------------------------------------- GDPR */

export function gdpr(ctx) {
  const { site } = ctx;
  return {
    titulek: "Ochrana osobních údajů",
    popis: "Jak zpracováváme osobní údaje pacientů a návštěvníků webu.",
    telo: `
<section class="sekce">
  <div class="obal obal--uzky">
    ${c.drobky(ctx, [["index.html", "Úvod"], [null, "Ochrana osobních údajů"]])}
    <h1>Ochrana osobních údajů</h1>
    <div class="text" style="max-width:none;margin-top:2rem">
      <h2>Kdo údaje zpracovává</h2>
      <p>Správcem osobních údajů je ${h(site.firma)}, ${h(site.adresa.ulice)},
         ${h(site.adresa.psc)} ${h(site.adresa.mesto)}, odborný zástupce ${h(site.lekarka)}.
         Kontakt: <a href="mailto:${h(site.email)}">${h(site.email)}</a>,
         <a href="tel:${tel(site.telefony[0].cislo)}">${h(site.telefony[0].cislo)}</a>.</p>

      <h2>Jaké údaje a proč</h2>
      <ul>
        <li><strong>Zdravotnická dokumentace</strong> — vedeme ji ze zákona o zdravotních
            službách. Obsahuje identifikační údaje, zdravotní stav, provedená ošetření a RTG snímky.</li>
        <li><strong>Objednání</strong> — jméno, telefon, e-mail a důvod návštěvy. Potřebujeme je,
            abychom vám mohli domluvit termín a ozvat se zpět.</li>
        <li><strong>Vyúčtování pojišťovně</strong> — údaje potřebné k vykázání hrazené péče.</li>
      </ul>

      <h2>Jak dlouho je držíme</h2>
      <p>Zdravotnickou dokumentaci uchováváme po dobu stanovenou vyhláškou o zdravotnické
         dokumentaci. Korespondenci k objednání mažeme, jakmile přestane být potřebná,
         nejpozději do jednoho roku.</p>

      <h2>Komu je předáváme</h2>
      <p>Zdravotním pojišťovnám v rozsahu nutném k vyúčtování péče, zubní laboratoři
         při zhotovení náhrady a dalším lékařům jen s vaším souhlasem nebo na základě zákona.
         Nikomu je neprodáváme a nepoužíváme je k reklamě.</p>

      <h2>Vaše práva</h2>
      <p>Máte právo na přístup ke svým údajům, na jejich opravu, na omezení zpracování,
         na výpis ze zdravotnické dokumentace a na podání stížnosti u Úřadu pro ochranu
         osobních údajů. Stačí nám napsat na
         <a href="mailto:${h(site.email)}">${h(site.email)}</a>.</p>

      <h2>Tento web</h2>
      <p>Web nepoužívá reklamní ani sledovací soubory cookie. Neběží na něm žádný
         kontaktní formulář — objednáváte se telefonem nebo e-mailem, tedy přímo nám,
         bez prostředníka.</p>

      <div class="postranni-box">
        <h3>Poznámka k ukázce</h3>
        <p>Tohle je ukázková verze nového webu. Finální znění zásad připravíme s ordinací
           podle toho, jaké systémy pro objednávání a dokumentaci opravdu používá.</p>
      </div>
    </div>
  </div>
</section>`,
  };
}

/* --------------------------------------------------------------------- 404 */

export function nenalezeno(ctx) {
  return {
    titulek: "Stránka nenalezena",
    popis: "Tahle adresa na webu není.",
    telo: `
<section class="obal chyba">
  <p class="chyba__kod">404</p>
  <h1>Tahle stránka tu není</h1>
  <p style="color:var(--text-2);max-width:34rem;margin:1rem auto 2rem">
    Možná se přejmenovala, možná jste se překlepli v adrese. Zkuste úvodní stránku
    nebo zavolejte — rádi poradíme.
  </p>
  <p class="hero__akce" style="justify-content:center">
    <a class="tl tl--hlavni" href="${odkaz(ctx.stranka, "index.html")}">Na úvodní stránku</a>
    <a class="tl tl--obrys tl--modry" href="tel:${tel(ctx.site.telefony[0].cislo)}">${ikona("telefon")} ${h(ctx.site.telefony[0].cislo)}</a>
  </p>
</section>`,
  };
}
