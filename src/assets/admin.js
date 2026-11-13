/* Demo administrace — chování.
 *
 * Za ukázkou není žádný server: data přijdou vložená ve stránce a změny si
 * drží prohlížeč v localStorage, takže po načtení zůstanou, ale nikam
 * neodcházejí a nikdo jiný je neuvidí. Ostrá verze má na tomhle místě PHP
 * a databázi; obrazovky a ovládání zůstávají stejné.
 */
(function () {
  "use strict";

  var korenData = document.getElementById("adm-data");
  if (!korenData) return;
  var data = JSON.parse(korenData.textContent);

  var KLIC = "fresiadent-demo-administrace";
  var KLIC_PRIHLASEN = "fresiadent-demo-prihlasen";
  var VERZE = 1;

  /* ------------------------------------------------------------- pomůcky */
  var $ = function (vyber, kde) { return (kde || document).querySelector(vyber); };
  var $$ = function (vyber, kde) { return Array.prototype.slice.call((kde || document).querySelectorAll(vyber)); };

  function esc(text) {
    return String(text == null ? "" : text)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  var cislaCZ = new Intl.NumberFormat("cs-CZ");
  var cislo = function (n) { return cislaCZ.format(Math.round(n)); };

  function procenta(n) {
    return cislaCZ.format(Math.round(n * 10) / 10) + " %";
  }

  function trvani(sekundy) {
    var m = Math.floor(sekundy / 60);
    var s = Math.round(sekundy % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  /* Zkrácení na celá slova — půlka slova s třemi tečkami vypadá jako chyba. */
  function zkrat(text, kolik) {
    var t = String(text || "");
    if (t.length <= kolik) return t;
    var rez = t.slice(0, kolik);
    var mezera = rez.lastIndexOf(" ");
    return (mezera > kolik * 0.6 ? rez.slice(0, mezera) : rez).replace(/[,;:.\s]+$/, "") + "…";
  }

  function datumCZ(iso) {
    var d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });
  }

  var hlaskaCas;
  function hlaska(text) {
    var box = $("[data-hlaska]");
    box.textContent = text;
    box.hidden = false;
    clearTimeout(hlaskaCas);
    hlaskaCas = setTimeout(function () { box.hidden = true; }, 3200);
  }

  /* ---------------------------------------------------------------- stav */
  /* Výchozí stav je to, co přišlo ze sestavení; uložené změny ho přepíšou. */
  function vychozi() {
    return {
      verze: VERZE,
      clanky: JSON.parse(JSON.stringify(data.clanky)),
      texty: JSON.parse(JSON.stringify(data.texty)),
      sluzby: JSON.parse(JSON.stringify(data.sluzby)),
      ordinace: JSON.parse(JSON.stringify(data.ordinace)),
    };
  }

  var stav = vychozi();
  try {
    var ulozeno = localStorage.getItem(KLIC);
    if (ulozeno) {
      var nacteno = JSON.parse(ulozeno);
      if (nacteno && nacteno.verze === VERZE) stav = nacteno;
    }
  } catch (e) { /* soukromé okno, vypnuté úložiště — demo jede i bez něj */ }

  function uloz(zprava) {
    try {
      localStorage.setItem(KLIC, JSON.stringify(stav));
    } catch (e) {
      hlaska("Prohlížeč změnu neuložil (vypnuté úložiště), ale na obrazovce zůstane.");
      return;
    }
    if (zprava) hlaska(zprava);
  }

  /* ------------------------------------------------------------ přihlášení */
  var brana = $("[data-brana]");
  var adm = $("[data-adm]");

  function dovnitr() {
    brana.hidden = true;
    adm.hidden = false;
    document.title = "Administrace | FresiaDent";
  }

  $("[data-prihlaseni]").addEventListener("submit", function (udalost) {
    udalost.preventDefault();
    try { localStorage.setItem(KLIC_PRIHLASEN, "1"); } catch (e) {}
    dovnitr();
    vykresliVse();
    hlaska("Vítejte. Tohle je ukázka — data jsou smyšlená.");
  });

  $("[data-odhlasit]").addEventListener("click", function () {
    try { localStorage.removeItem(KLIC_PRIHLASEN); } catch (e) {}
    adm.hidden = true;
    brana.hidden = false;
  });

  $("[data-vycistit]").addEventListener("click", function () {
    if (!window.confirm("Vrátit ukázku do původního stavu? Všechny vaše změny v tomhle prohlížeči se zahodí.")) return;
    try { localStorage.removeItem(KLIC); } catch (e) {}
    stav = vychozi();
    vykresliVse();
    hlaska("Hotovo, ukázka je zpátky v původním stavu.");
  });

  /* ------------------------------------------------------------- záložky */
  function prepni(id) {
    $$("[data-zalozka]").forEach(function (tl) {
      tl.setAttribute("aria-selected", String(tl.dataset.zalozka === id));
    });
    $$("[data-sekce]").forEach(function (s) {
      s.hidden = s.dataset.sekce !== id;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  $$("[data-zalozka]").forEach(function (tl) {
    tl.addEventListener("click", function () { prepni(tl.dataset.zalozka); });
  });

  /* ------------------------------------------------------------ nástěnka */
  var obdobi = 30;

  function souctyZa(dny) {
    var soucet = { navstevy: 0, uzivatele: 0, zobrazeni: 0, objednani: 0, doba: 0, opusteni: 0 };
    dny.forEach(function (d) {
      soucet.navstevy += d.navstevy;
      soucet.uzivatele += d.uzivatele;
      soucet.zobrazeni += d.zobrazeni;
      soucet.objednani += d.objednani;
      soucet.doba += d.doba;
      soucet.opusteni += d.opusteni;
    });
    soucet.doba = soucet.doba / (dny.length || 1);
    soucet.opusteni = soucet.opusteni / (dny.length || 1);
    return soucet;
  }

  function vykresliMetriky() {
    var vse = data.statistiky.dny;
    var ted = vse.slice(-obdobi);
    var drive = vse.slice(-obdobi * 2, -obdobi);
    var a = souctyZa(ted);
    var b = drive.length ? souctyZa(drive) : null;

    var zobraz = {
      navstevy: cislo(a.navstevy),
      uzivatele: cislo(a.uzivatele),
      zobrazeni: cislo(a.zobrazeni),
      objednani: cislo(a.objednani),
      doba: trvani(a.doba) + " min",
      opusteni: procenta(a.opusteni),
    };
    /* u doby a opuštění je lepší nižší číslo, u zbytku vyšší */
    var lepsiJeMene = { opusteni: true };

    Object.keys(zobraz).forEach(function (klic) {
      var box = $('[data-metrika="' + klic + '"]');
      if (!box) return;
      $("[data-hodnota]", box).textContent = zobraz[klic];

      var zmenaBox = $("[data-zmena]", box);
      if (!b || !b[klic]) { zmenaBox.textContent = ""; return; }

      var zmena = ((a[klic] - b[klic]) / b[klic]) * 100;
      var roste = zmena > 0.5;
      var klesa = zmena < -0.5;
      var dobre = lepsiJeMene[klic] ? klesa : roste;
      var spatne = lepsiJeMene[klic] ? roste : klesa;

      zmenaBox.textContent = (zmena > 0 ? "▲ +" : zmena < 0 ? "▼ " : "– ")
        + cislaCZ.format(Math.round(Math.abs(zmena) * 10) / 10) + " %";
      zmenaBox.dataset.smer = dobre ? "nahoru" : spatne ? "dolu" : "klid";
    });
  }

  function vykresliGraf() {
    var dny = data.statistiky.dny.slice(-obdobi);
    var S = 720, V = 210, dole = 24, nahore = 8;
    var max = Math.max.apply(null, dny.map(function (d) { return d.navstevy; }));
    var strop = Math.ceil(max / 20) * 20;
    var sirkaSloupce = (S / dny.length) * 0.66;
    var rozestup = S / dny.length;

    var sloupce = dny.map(function (d, i) {
      var vyska = ((V - dole - nahore) * d.navstevy) / strop;
      var x = i * rozestup + (rozestup - sirkaSloupce) / 2;
      var y = V - dole - vyska;
      return '<rect class="adm-graf__sloupec" x="' + x.toFixed(1) + '" y="' + y.toFixed(1)
        + '" width="' + sirkaSloupce.toFixed(1) + '" height="' + Math.max(1, vyska).toFixed(1)
        + '" rx="2"><title>' + esc(datumCZ(d.datum) + ": " + cislo(d.navstevy) + " návštěv") + "</title></rect>";
    }).join("");

    /* popisky osy: první, prostřední a poslední den — víc by se na mobilu slilo */
    var popisky = [0, Math.floor(dny.length / 2), dny.length - 1].map(function (i) {
      var x = i * rozestup + rozestup / 2;
      var kotva = i === 0 ? "start" : i === dny.length - 1 ? "end" : "middle";
      return '<text class="adm-graf__osa" x="' + x.toFixed(1) + '" y="' + (V - 6)
        + '" text-anchor="' + kotva + '">' + esc(datumCZ(dny[i].datum)) + "</text>";
    }).join("");

    $("[data-graf]").innerHTML =
      '<svg viewBox="0 0 ' + S + " " + V + '" role="img" aria-label="Návštěvy za posledních '
      + obdobi + ' dní">'
      + '<defs><linearGradient id="admGrad" x1="0" y1="1" x2="0" y2="0">'
      + '<stop offset="0" stop-color="#7b3fe4"/><stop offset="1" stop-color="#ff00e8"/>'
      + "</linearGradient></defs>"
      + '<line class="adm-graf__linka" x1="0" y1="' + (V - dole) + '" x2="' + S + '" y2="' + (V - dole) + '"/>'
      + sloupce + popisky
      + "</svg>";

    $("[data-graf-popis]").textContent = "Nejsilnější den: " + cislo(strop >= max ? max : max)
      + " návštěv. Slabší dny jsou pátky a víkendy, kdy má ordinace zavřeno.";
  }

  function pruhy(kam, polozky, hodnota) {
    var max = Math.max.apply(null, polozky.map(function (p) { return p.podil || p.pocet; }));
    kam.innerHTML = polozky.map(function (p) {
      var h = p.podil || p.pocet;
      return "<li>"
        + '<span class="adm-pruhy__popis"><span>' + esc(p.nazev) + "</span><b>" + hodnota(p) + "</b></span>"
        + '<span class="adm-pruhy__kolej"><span class="adm-pruhy__vypln" style="width:'
        + ((h / max) * 100).toFixed(1) + '%"></span></span>'
        + "</li>";
    }).join("");
  }

  function vykresliNastenku() {
    vykresliMetriky();
    vykresliGraf();

    pruhy($("[data-zdroje]"), data.statistiky.zdroje, function (p) { return p.podil + " %"; });
    pruhy($("[data-dotazy]"), data.statistiky.dotazy, function (p) { return cislo(p.pocet) + "×"; });

    var ctene = stav.clanky.slice().sort(function (a, b) { return b.precteni - a.precteni; }).slice(0, 5);
    $("[data-ctene]").innerHTML = ctene.map(function (cl) {
      return "<li><a href=\"blog/" + esc(cl.id) + ".html\">" + esc(cl.titulek) + "</a><br>"
        + "<span>" + cislo(cl.precteni) + " přečtení · " + esc(nazevKategorie(cl.kategorie)) + "</span></li>";
    }).join("");
  }

  $$("[data-obdobi]").forEach(function (tl) {
    tl.addEventListener("click", function () {
      obdobi = Number(tl.dataset.obdobi);
      $$("[data-obdobi]").forEach(function (t) { t.setAttribute("aria-pressed", String(t === tl)); });
      vykresliNastenku();
    });
  });

  /* ---------------------------------------------------------------- blog */
  function nazevKategorie(id) {
    var k = data.kategorie.filter(function (k) { return k.id === id; })[0];
    return k ? k.nazev : id;
  }

  function puvodni(id) {
    return data.clanky.some(function (cl) { return cl.id === id; });
  }

  function vykresliClanky() {
    var hledano = ($("[data-hledat]").value || "").trim().toLowerCase();
    var kat = $("[data-filtr-kategorie]").value;
    var stavFiltr = $("[data-filtr-stav]").value;

    var vybrane = stav.clanky.filter(function (cl) {
      if (kat && cl.kategorie !== kat) return false;
      if (stavFiltr && cl.stav !== stavFiltr) return false;
      if (!hledano) return true;
      return (cl.titulek + " " + cl.popis).toLowerCase().indexOf(hledano) !== -1;
    }).sort(function (a, b) { return b.datum.localeCompare(a.datum); });

    $("[data-clanky]").innerHTML = vybrane.map(function (cl) {
      var nahled = puvodni(cl.id)
        ? '<a class="adm-tl adm-tl--mala" href="blog/' + esc(cl.id) + '.html" target="_blank" rel="noopener">Náhled</a>'
        : "";
      return "<tr>"
        + '<td><span class="adm-tabulka__nazev"><b>' + esc(cl.titulek) + "</b><span>"
        + esc(zkrat(cl.popis, 110)) + "</span></span></td>"
        + "<td>" + esc(nazevKategorie(cl.kategorie)) + "</td>"
        + "<td>" + esc(datumCZ(cl.datum)) + "</td>"
        + "<td>" + (cl.stav === "publikovano" ? cislo(cl.precteni) : "—") + "</td>"
        + '<td><span class="adm-znacka-stavu" data-stav="' + esc(cl.stav) + '">'
        + (cl.stav === "publikovano" ? "Publikováno" : "Koncept") + "</span></td>"
        + '<td><button type="button" class="adm-tl adm-tl--mala" data-upravit="' + esc(cl.id) + '">Upravit</button> '
        + nahled
        + ' <button type="button" class="adm-tl adm-tl--mala adm-tl--nebezpecna" data-smazat="'
        + esc(cl.id) + '">Smazat</button></td>'
        + "</tr>";
    }).join("");

    $("[data-clanky-prazdno]").hidden = vybrane.length > 0;
  }

  /* -------------------------------------------------------------- editor */
  var upravovany = null;

  /* Článek je v datech po blocích (odstavec, nadpis, seznam), v editoru je to
     jeden text. Překládá se tam i zpátky stejným zápisem, jaký nabízí lišta
     nad textem: "## " nadpis, "- " odrážka. */
  function teloNaText(telo) {
    if (typeof telo === "string") return telo;
    return (telo || []).map(function (b) {
      if (b.typ === "nadpis") return "## " + b.text;
      if (b.typ === "seznam") return (b.polozky || []).map(function (p) { return "- " + p; }).join("\n");
      return b.text || "";
    }).join("\n\n");
  }

  function textNaTelo(text) {
    var bloky = [];
    String(text).split(/\n{2,}/).forEach(function (kus) {
      var radky = kus.split("\n").map(function (r) { return r.trim(); }).filter(Boolean);
      var seznam = null;

      radky.forEach(function (radek) {
        if (radek.indexOf("## ") === 0) {
          seznam = null;
          bloky.push({ typ: "nadpis", text: radek.slice(3).trim() });
        } else if (radek.indexOf("- ") === 0) {
          if (!seznam) { seznam = { typ: "seznam", polozky: [] }; bloky.push(seznam); }
          seznam.polozky.push(radek.slice(2).trim());
        } else {
          seznam = null;
          var posledni = bloky[bloky.length - 1];
          /* zalomený řádek uvnitř odstavce patří k témuž odstavci */
          if (posledni && posledni.typ === "odstavec" && radky.indexOf(radek) > 0) {
            posledni.text += " " + radek;
          } else {
            bloky.push({ typ: "odstavec", text: radek });
          }
        }
      });
    });
    return bloky.filter(function (b) {
      return b.typ === "seznam" ? b.polozky.length > 0 : b.text !== "";
    });
  }

  function naplnVybery() {
    var kat = data.kategorie.map(function (k) {
      return '<option value="' + esc(k.id) + '">' + esc(k.nazev) + "</option>";
    }).join("");
    $("[data-editor-kategorie]").innerHTML = kat;
    $("[data-filtr-kategorie]").innerHTML = '<option value="">Všechny kategorie</option>' + kat;
    $("[data-editor-sluzba]").innerHTML = '<option value="">— žádná —</option>'
      + data.sluzby.map(function (s) {
        return '<option value="' + esc(s.id) + '">' + esc(s.nazev) + "</option>";
      }).join("");
  }

  function otevriEditor(id) {
    var f = $("[data-editor]");
    upravovany = id ? stav.clanky.filter(function (cl) { return cl.id === id; })[0] : null;

    var cl = upravovany || {
      titulek: "", popis: "", kategorie: data.kategorie[0].id, sluzba: "",
      datum: new Date().toISOString().slice(0, 10), minut: 4, telo: "", stav: "koncept", foto: "",
    };

    f.titulek.value = cl.titulek;
    f.popis.value = cl.popis;
    f.kategorie.value = cl.kategorie;
    f.sluzba.value = cl.sluzba || "";
    f.datum.value = cl.datum;
    f.minut.value = cl.minut;
    f.telo.value = teloNaText(cl.telo);
    $$('input[name="stav"]', f).forEach(function (r) { r.checked = r.value === cl.stav; });
    f.dataset.foto = cl.foto || "";

    $("[data-editor-nadpis]").textContent = id ? "Úprava článku" : "Nový článek";
    vykresliFotoEditoru();
    zrcadlo();
    prepni("editor");
  }

  function vykresliFotoEditoru() {
    var jmeno = $("[data-editor]").dataset.foto;
    var obr = data.obrazky.filter(function (o) { return o.jmeno === jmeno; })[0];
    $("[data-editor-foto]").innerHTML = obr
      ? '<img src="' + esc(obr.soubor) + '" alt="">'
      : '<p class="adm-napoveda adm-napoveda--mala">Zatím bez obrázku. Článek bez fotky vypadá ve výpisu prázdně.</p>';
  }

  function zrcadlo() {
    var f = $("[data-editor]");
    $("[data-nahled-titulek]").textContent = f.titulek.value || "Titulek článku";
    $("[data-nahled-popis]").textContent = f.popis.value
      || "Perex se ukáže tady — a taky ve výpisu blogu.";

    var delka = f.titulek.value.length;
    $("[data-delka-titulku]").textContent = delka === 0
      ? "Titulek zatím není."
      : "Titulek má " + delka + " znaků. " + (delka > 60
        ? "Google si ho nejspíš ořízne, nejlépe do 60."
        : "Do výsledků vyhledávání se vejde celý.");

    var znaku = f.telo.value.length;
    $("[data-pocet-znaku]").textContent = znaku === 0 ? "" : cislo(znaku) + " znaků · "
      + "asi " + Math.max(1, Math.round(znaku / 1100)) + " min čtení";
  }

  $("[data-editor]").addEventListener("input", zrcadlo);

  $("[data-novy-clanek]").addEventListener("click", function () { otevriEditor(null); });
  $("[data-editor-zpet]").addEventListener("click", function () { prepni("blog"); });

  $("[data-editor-ulozit]").addEventListener("click", function () {
    var f = $("[data-editor]");
    if (!f.titulek.value.trim()) { hlaska("Článek potřebuje titulek."); f.titulek.focus(); return; }

    var vybranyStav = ($$('input[name="stav"]', f).filter(function (r) { return r.checked; })[0] || {}).value || "koncept";
    var novy = {
      titulek: f.titulek.value.trim(),
      popis: f.popis.value.trim(),
      kategorie: f.kategorie.value,
      sluzba: f.sluzba.value,
      datum: f.datum.value || new Date().toISOString().slice(0, 10),
      minut: Number(f.minut.value) || 4,
      telo: textNaTelo(f.telo.value),
      stav: vybranyStav,
      foto: f.dataset.foto || "",
    };

    if (upravovany) {
      Object.keys(novy).forEach(function (k) { upravovany[k] = novy[k]; });
    } else {
      novy.id = adresaZNazvu(novy.titulek);
      novy.precteni = 0;
      stav.clanky.push(novy);
    }

    uloz(upravovany ? "Článek uložen." : "Článek založen jako " + (vybranyStav === "koncept" ? "koncept." : "publikovaný."));
    vykresliClanky();
    vykresliNastenku();
    prepni("blog");
  });

  function adresaZNazvu(text) {
    var zaklad = String(text).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
    var adresa = zaklad || "clanek";
    var i = 2;
    while (stav.clanky.some(function (cl) { return cl.id === adresa; })) adresa = zaklad + "-" + i++;
    return adresa;
  }

  /* lišta formátování nad textem článku */
  $$("[data-vlozit], [data-obal]").forEach(function (tl) {
    tl.addEventListener("click", function () {
      var pole = $("[data-editor]").telo;
      var zac = pole.selectionStart, kon = pole.selectionEnd;
      var vybrano = pole.value.slice(zac, kon);
      var text;
      if (tl.dataset.obal) {
        text = tl.dataset.obal + (vybrano || "text") + tl.dataset.obal;
      } else {
        text = (zac > 0 && pole.value[zac - 1] !== "\n" ? "\n" : "") + tl.dataset.vlozit + vybrano;
      }
      pole.setRangeText(text, zac, kon, "end");
      pole.focus();
      zrcadlo();
    });
  });

  /* ------------------------------------------------------- texty stránek */
  var POPISKY = {
    hero: "Úvodní obrazovka", proc: "Proč k nám chodí", oNas: "O ordinaci",
    navsteva: "První návštěva", objednani: "Objednání", blog: "Blog", pacienti: "Pro pacienty",
    nadpis: "Nadpis", podtitul: "Podtitul", pruh: "Proužek pod nadpisem", polozky: "Položky",
    odstavce: "Odstavce", zivotopis: "Vzdělání a praxe", kroky: "Kroky", dotazy: "Časté dotazy",
    text: "Text", otazka: "Otázka", odpoved: "Odpověď", nazev: "Název", kratce: "Krátce",
    perex: "Perex", trvani: "Trvání", hrazeno: "Hrazení", popis: "Popis",
    obsahuje: "Co služba zahrnuje", prubeh: "Jak to probíhá", vyhody: "Výhody",
  };
  var popisek = function (klic) { return POPISKY[klic] || klic.charAt(0).toUpperCase() + klic.slice(1); };
  var SKRYTE = { ikona: true, cislo: true };

  /** Jedno pole: krátký text do řádku, delší do plochy. */
  function pole(cesta, klic, hodnota) {
    var dlouhy = String(hodnota).length > 90;
    var vstup = dlouhy
      ? '<textarea rows="' + Math.min(10, Math.max(3, Math.ceil(String(hodnota).length / 90)))
        + '" data-pole="' + esc(cesta) + '">' + esc(hodnota) + "</textarea>"
      : '<input type="text" data-pole="' + esc(cesta) + '" value="' + esc(hodnota) + '">';
    return "<label>" + esc(popisek(klic)) + vstup + "</label>";
  }

  /** Rekurzivně: řetězec → pole, pole řetězců → plocha po řádcích, pole objektů → bloky. */
  function poleProHodnotu(cesta, klic, hodnota) {
    if (typeof hodnota === "string" || typeof hodnota === "number") {
      return pole(cesta, klic, hodnota);
    }
    if (Array.isArray(hodnota) && typeof hodnota[0] === "string") {
      return "<label>" + esc(popisek(klic))
        + '<textarea rows="' + Math.min(12, hodnota.length * 3) + '" data-pole="' + esc(cesta)
        + '" data-radky="1">' + esc(hodnota.join("\n\n")) + "</textarea>"
        + '<span class="adm-napoveda adm-napoveda--mala">Každý odstavec oddělte prázdným řádkem.</span></label>';
    }
    if (Array.isArray(hodnota)) {
      return '<div class="adm-harmonika__telo" style="padding:0;border:0">'
        + "<strong>" + esc(popisek(klic)) + ' <span class="adm-pocet">' + hodnota.length + "</span></strong>"
        + hodnota.map(function (polozka, i) {
          return '<div class="adm-panel" style="box-shadow:none;background:var(--papir-2)">'
            + Object.keys(polozka).filter(function (k) { return !SKRYTE[k]; }).map(function (k) {
              return poleProHodnotu(cesta + "." + i + "." + k, k, polozka[k]);
            }).join("")
            + "</div>";
        }).join("")
        + "</div>";
    }
    return "";
  }

  function vykresliTexty() {
    $("[data-texty]").innerHTML = Object.keys(stav.texty).map(function (skupina) {
      var obsah = stav.texty[skupina];
      return "<details><summary>" + esc(popisek(skupina))
        + '<span class="adm-pocet">' + Object.keys(obsah).length + " polí</span></summary>"
        + '<div class="adm-harmonika__telo">'
        + Object.keys(obsah).map(function (k) {
          return poleProHodnotu("texty." + skupina + "." + k, k, obsah[k]);
        }).join("")
        + "</div></details>";
    }).join("");
  }

  /** Zapíše hodnotu z formuláře zpátky do stavu podle cesty "texty.hero.nadpis". */
  function zapisPodleCesty(cesta, hodnota, radky) {
    var kusy = cesta.split(".");
    var kam = kusy[0] === "texty" ? stav.texty : kusy[0] === "sluzby" ? stav.sluzby : stav.ordinace;
    var uzel = kam;
    for (var i = 1; i < kusy.length - 1; i++) uzel = uzel[kusy[i]];
    var posledni = kusy[kusy.length - 1];
    uzel[posledni] = radky ? hodnota.split(/\n{2,}/).map(function (t) { return t.trim(); }).filter(Boolean) : hodnota;
  }

  function seberPole(korenVyber, predpona) {
    $$("[data-pole]", $(korenVyber)).forEach(function (vstup) {
      if (vstup.dataset.pole.indexOf(predpona) !== 0) return;
      zapisPodleCesty(vstup.dataset.pole, vstup.value, vstup.dataset.radky === "1");
    });
  }

  $("[data-ulozit-texty]").addEventListener("click", function () {
    seberPole("[data-texty]", "texty.");
    uloz("Texty uloženy. Na ostrém webu se projeví hned po uložení.");
  });

  /* -------------------------------------------------------------- služby */
  function vykresliSluzby() {
    $("[data-sluzby]").innerHTML = stav.sluzby.map(function (s, i) {
      return "<details><summary>" + esc(s.nazev) + '<span class="adm-pocet">'
        + esc(s.kratce) + "</span></summary>"
        + '<div class="adm-harmonika__telo">'
        /* Pole se berou z dat, ne z pevného seznamu: služba má kromě názvu
           a perexu i odrážky („Co služba zahrnuje") a kroky průběhu, a ty
           se musí dát přepsat taky. id je adresa stránky, to se nemění. */
        + Object.keys(s).filter(function (k) { return k !== "id" && !SKRYTE[k]; })
          .map(function (k) {
            return poleProHodnotu("sluzby." + i + "." + k, k, s[k]);
          }).join("")
        + '<p class="adm-napoveda adm-napoveda--mala">Stránka služby: '
        + '<a href="sluzby/' + esc(s.id) + '.html" target="_blank" rel="noopener">sluzby/'
        + esc(s.id) + ".html</a></p>"
        + "</div></details>";
    }).join("");
  }

  $("[data-ulozit-sluzby]").addEventListener("click", function () {
    seberPole("[data-sluzby]", "sluzby.");
    vykresliSluzby();
    uloz("Služby uloženy.");
  });

  /* ------------------------------------------------------------- obrázky */
  var nahrane = [];   /* jen po dobu návštěvy — ukázka nemá kam soubory ukládat */

  function dlazdice(o, novy) {
    return '<figure class="adm-dlazdice' + (novy ? " adm-dlazdice--novy" : "") + '" data-obrazek="'
      + esc(o.jmeno) + '">'
      + '<img src="' + esc(o.soubor) + '" alt="" loading="lazy">'
      + '<figcaption class="adm-dlazdice__popis"><b>' + esc(o.jmeno) + "</b>"
      + "<span>" + esc(o.pouziti) + "</span>"
      + "<span>" + (novy ? "nahráno teď — ukázka soubory neukládá" : o.kilobajtu + " kB") + "</span>"
      + "</figcaption></figure>";
  }

  function vykresliGalerii() {
    $("[data-galerie]").innerHTML = nahrane.map(function (o) { return dlazdice(o, true); }).join("")
      + data.obrazky.map(function (o) { return dlazdice(o, false); }).join("");
  }

  function prijmiSoubory(soubory) {
    var prijato = 0;
    Array.prototype.forEach.call(soubory, function (s) {
      if (!/^image\//.test(s.type)) return;
      nahrane.unshift({
        jmeno: s.name.replace(/\.[^.]+$/, ""),
        soubor: URL.createObjectURL(s),
        kilobajtu: Math.round(s.size / 1024),
        pouziti: "zatím nikde",
      });
      prijato++;
    });
    if (!prijato) { hlaska("To nevypadá na obrázek."); return; }
    vykresliGalerii();
    hlaska(prijato === 1 ? "Obrázek přidán do knihovny." : prijato + " obrázky přidány do knihovny.");
  }

  var nahrat = $("[data-nahrat]");
  var vstupSouboru = $("[data-nahrat-vstup]");
  nahrat.addEventListener("click", function () { vstupSouboru.click(); });
  nahrat.addEventListener("keydown", function (u) {
    if (u.key === "Enter" || u.key === " ") { u.preventDefault(); vstupSouboru.click(); }
  });
  vstupSouboru.addEventListener("change", function () { prijmiSoubory(vstupSouboru.files); vstupSouboru.value = ""; });
  ["dragenter", "dragover"].forEach(function (jmeno) {
    nahrat.addEventListener(jmeno, function (u) { u.preventDefault(); nahrat.dataset.nad = ""; });
  });
  ["dragleave", "drop"].forEach(function (jmeno) {
    nahrat.addEventListener(jmeno, function (u) { u.preventDefault(); delete nahrat.dataset.nad; });
  });
  nahrat.addEventListener("drop", function (u) {
    if (u.dataTransfer && u.dataTransfer.files) prijmiSoubory(u.dataTransfer.files);
  });

  /* výběr úvodního obrázku článku */
  var dialog = $("[data-dialog-foto]");
  $("[data-vybrat-foto]").addEventListener("click", function () {
    $("[data-dialog-galerie]").innerHTML = data.obrazky.map(function (o) { return dlazdice(o, false); }).join("");
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute("open", "");
  });
  $("[data-dialog-zavrit]").addEventListener("click", function () {
    if (dialog.close) dialog.close(); else dialog.removeAttribute("open");
  });
  dialog.addEventListener("click", function (u) {
    var dl = u.target.closest("[data-obrazek]");
    if (!dl) return;
    $("[data-editor]").dataset.foto = dl.dataset.obrazek;
    vykresliFotoEditoru();
    if (dialog.close) dialog.close(); else dialog.removeAttribute("open");
  });

  /* ------------------------------------------------------------ ordinace */
  /* V datech je čas jako "8:00", ale <input type="time"> chce "08:00". */
  function cas(hodnota) {
    if (!hodnota) return "";
    var kusy = String(hodnota).split(":");
    return ("0" + kusy[0]).slice(-2) + ":" + ("0" + (kusy[1] || "0")).slice(-2);
  }

  function vykresliOrdinaci() {
    var o = stav.ordinace;
    $("[data-spojeni]").innerHTML =
      pole("ordinace.firma", "nazev", o.firma)
      + pole("ordinace.lekarka", "Lékařka", o.lekarka)
      + pole("ordinace.email", "E-mail", o.email)
      + o.telefony.map(function (t, i) {
        return pole("ordinace.telefony." + i + ".cislo", (t.role || "Telefon") + " (" + t.popis + ")", t.cislo);
      }).join("")
      + pole("ordinace.adresa.misto", "Budova", o.adresa.misto)
      + pole("ordinace.adresa.ulice", "Ulice", o.adresa.ulice)
      + pole("ordinace.adresa.psc", "PSČ", o.adresa.psc)
      + pole("ordinace.adresa.mesto", "Město", o.adresa.mesto);

    $("[data-hodiny]").innerHTML = o.oteviraciDoba.map(function (d, i) {
      return '<div class="adm-hodiny__radek">'
        + '<span class="adm-hodiny__den">' + esc(d.zkratka) + "</span>"
        + '<input type="time" data-pole="ordinace.oteviraciDoba.' + i + '.od" value="' + esc(cas(d.od)) + '">'
        + "<span>–</span>"
        + '<input type="time" data-pole="ordinace.oteviraciDoba.' + i + '.do" value="' + esc(cas(d.do)) + '">'
        + "</div>";
    }).join("");
  }

  $("[data-ulozit-ordinaci]").addEventListener("click", function () {
    seberPole("[data-sekce='ordinace']", "ordinace.");
    vykresliOrdinaci();
    uloz("Spojení i hodiny uloženy.");
  });

  /* ------------------------------------------------------- seznam článků */
  $("[data-clanky]").addEventListener("click", function (u) {
    var upravit = u.target.closest("[data-upravit]");
    if (upravit) { otevriEditor(upravit.dataset.upravit); return; }

    var smazat = u.target.closest("[data-smazat]");
    if (!smazat) return;
    var cl = stav.clanky.filter(function (c) { return c.id === smazat.dataset.smazat; })[0];
    if (!cl) return;
    if (!window.confirm("Smazat článek „" + cl.titulek + "“?")) return;
    stav.clanky = stav.clanky.filter(function (c) { return c !== cl; });
    uloz("Článek smazán. „Vrátit do původního stavu“ ho přinese zpátky.");
    vykresliClanky();
    vykresliNastenku();
  });

  ["[data-hledat]", "[data-filtr-kategorie]", "[data-filtr-stav]"].forEach(function (v) {
    $(v).addEventListener("input", vykresliClanky);
  });

  /* ---------------------------------------------------------------- start */
  function vykresliVse() {
    naplnVybery();
    vykresliNastenku();
    vykresliClanky();
    vykresliTexty();
    vykresliSluzby();
    vykresliGalerii();
    vykresliOrdinaci();
  }

  var jePrihlasen = false;
  try { jePrihlasen = localStorage.getItem(KLIC_PRIHLASEN) === "1"; } catch (e) {}
  if (jePrihlasen) { dovnitr(); vykresliVse(); }
  prepni("nastenka");
})();
