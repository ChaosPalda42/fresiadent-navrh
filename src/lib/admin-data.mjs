/** Data pro demo administraci.
 *
 *  Čísla „z Google Analytics" jsou smyšlená, ale ne náhodná: generují se ze
 *  pevného zrna, takže při každém sestavení vyjdou stejná, a mají tvar, jaký
 *  provoz malé ordinace mívá — ve všední dny víc než o víkendu, mírný růst
 *  v čase, o pár procent nahoru dolů. Ostrá verze si na tohle místo sáhne do
 *  Google Analytics Data API.
 */

/** Malý generátor pseudonáhodných čísel se zrnem (mulberry32). */
function zrno(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Půl roku dozadu: nástěnka ukazuje nejvýš 90 dní, ale musí mít proti čemu
   srovnávat — i u nejdelšího období. */
const DNU = 180;

/** Řada posledních DNU dní, od nejstaršího po včerejšek. */
function dny(dnes) {
  const r = zrno(20261113);
  const ven = [];

  for (let i = DNU; i >= 1; i--) {
    const d = new Date(dnes);
    d.setDate(d.getDate() - i);
    const den = d.getDay();                       /* 0 = neděle */
    const vikend = den === 0 || den === 6;
    const patek = den === 5;

    /* ordinace má Po–Čt, takže konec týdne je slabší */
    const tyden = vikend ? 0.58 : patek ? 0.78 : 1;
    const trend = 1 + (DNU - i) * 0.0022;         /* pomalý růst */
    const sum = 0.9 + r() * 0.26;                 /* šum ±13 % */

    const navstevy = Math.round(96 * tyden * trend * sum);
    ven.push({
      datum: d.toISOString().slice(0, 10),
      navstevy,
      uzivatele: Math.round(navstevy * (0.78 + r() * 0.08)),
      zobrazeni: Math.round(navstevy * (2.1 + r() * 0.7)),
      objednani: Math.round(navstevy * (0.06 + r() * 0.05)),
      doba: Math.round(96 + r() * 54),            /* sekundy */
      opusteni: Math.round(380 + r() * 130) / 10, /* procenta */
    });
  }
  return ven;
}

export function adminData({ site, sluzby, texty, kategorie, clanky, obrazky }, dnes = new Date()) {
  const r = zrno(42);

  /* Přečtení článku: starší článek jich má víc, ale ne úměrně — čte se hlavně to,
     co lidé hledají, ne to, co je nahoře. */
  const clankyVen = clanky.map((cl, i) => {
    const stari = Math.max(1, Math.round((dnes - new Date(cl.datum)) / 86400000));
    const zajem = 0.55 + r() * 0.9;
    return {
      id: cl.id,
      titulek: cl.titulek,
      popis: cl.popis,
      kategorie: cl.kategorie,
      sluzba: cl.sluzba || "",
      foto: cl.foto,
      datum: cl.datum,
      minut: cl.minut,
      telo: cl.telo,
      stav: "publikovano",
      precteni: Math.round((40 + stari * 2.4) * zajem) + 12 * (clanky.length - i),
    };
  });

  return {
    ordinace: {
      firma: site.firma,
      lekarka: site.lekarka,
      email: site.email,
      telefony: site.telefony,
      adresa: site.adresa,
      oteviraciDoba: site.oteviraciDoba,
    },
    kategorie: kategorie.map((k) => ({ id: k.id, nazev: k.nazev, popis: k.popis })),
    /* Pořadí klíčů je zároveň pořadí polí v administraci: nejdřív to krátké
       nahoře na stránce, pak seznamy, nakonec dvě věty pod ně. Prázdné klíče
       se nevyrábějí — u služby bez průběhu by to bylo prázdné pole navíc. */
    sluzby: sluzby.map((s) => ({
      id: s.id, nazev: s.nazev, kratce: s.kratce, perex: s.perex,
      ...(s.obsahuje ? { obsahuje: s.obsahuje } : {}),
      ...(s.prubeh ? { prubeh: s.prubeh } : {}),
      ...(s.vyhody ? { vyhody: s.vyhody } : {}),
      trvani: s.trvani || "", hrazeno: s.hrazeno || "",
    })),
    texty,
    clanky: clankyVen,
    obrazky,
    statistiky: {
      dny: dny(dnes),
      zdroje: [
        { nazev: "Vyhledávání Google", podil: 54 },
        { nazev: "Přímo (napsaná adresa)", podil: 18 },
        { nazev: "Mapy (Google, Seznam)", podil: 14 },
        { nazev: "Odkazy z jiných webů", podil: 9 },
        { nazev: "Sociální sítě", podil: 5 },
      ],
      dotazy: [
        { nazev: "zubař praha 9", pocet: 212 },
        { nazev: "fresiadent", pocet: 168 },
        { nazev: "zubní ordinace vysočany", pocet: 96 },
        { nazev: "bělení zubů praha cena", pocet: 71 },
        { nazev: "zubař který bere nové pacienty praha", pocet: 54 },
        { nazev: "zirkonová korunka cena", pocet: 38 },
      ],
    },
  };
}
