/** Demo administrace. Kostru vykresluje tahle šablona, obsah assets/admin.js
 *  z dat vložených do stránky. Ukázka běží na statickém hostingu, takže za tím
 *  není žádný server: změny si drží prohlížeč (localStorage) a nikam neodcházejí.
 *  Ostrá verze má na tomhle místě PHP a databázi — rozvržení a ovládání zůstává. */

import { h, odkaz } from "../lib/cesty.mjs";
import { ikona } from "./ikony.mjs";

const ZALOZKY = [
  ["nastenka", "Nástěnka", "jiskra"],
  ["blog", "Blog", "rec"],
  ["texty", "Texty stránek", "kopie"],
  ["sluzby", "Služby", "zub"],
  ["obrazky", "Obrázky", "sken"],
  ["ordinace", "Ordinace", "hodiny"],
];

const METRIKY = [
  ["navstevy", "Návštěvy", "kolikrát někdo přišel na web"],
  ["uzivatele", "Uživatelé", "kolik různých lidí to bylo"],
  ["zobrazeni", "Zobrazené stránky", "součet všech otevřených stránek"],
  ["objednani", "Objednání", "kliknutí na telefon a na e-mail"],
  ["doba", "Průměrná návštěva", "jak dlouho se na webu zdrží"],
  ["opusteni", "Odchody z první stránky", "kolik lidí odejde, aniž by klikli dál"],
];

/** Přihlašovací obrazovka — v ukázce pustí dovnitř cokoliv. */
function prihlaseni(ctx) {
  return `
<div class="adm-brana" data-brana>
  <form class="adm-brana__panel" data-prihlaseni>
    <img src="assets/img/logo.png" width="278" height="74" alt="${h(ctx.site.znacka)}">
    <h1>Administrace webu</h1>
    <p class="adm-napoveda">Ukázka pro ${h(ctx.site.firma)}. Přihlásí vás jakékoli heslo —
      nic se nikam neodesílá a žádný účet tu zatím není.</p>
    <label>E-mail
      <input type="email" name="email" value="${h(ctx.site.email)}" autocomplete="username">
    </label>
    <label>Heslo
      <input type="password" name="heslo" value="ukazka" autocomplete="current-password">
    </label>
    <button class="adm-tl adm-tl--hlavni" type="submit">Přihlásit se</button>
    <p class="adm-napoveda adm-napoveda--mala">Ostrá verze bude mít přihlášení na e-mail a heslo,
      dvoufázové ověření a oddělené účty pro lékařku a sestru.</p>
  </form>
</div>`;
}

/** Nástěnka: metriky, graf, zdroje návštěv, nejčtenější články. */
function nastenka() {
  const dlazdice = METRIKY.map(([klic, nazev, popis]) => `
    <article class="adm-metrika" data-metrika="${klic}">
      <h3>${h(nazev)}</h3>
      <strong data-hodnota>—</strong>
      <span class="adm-metrika__zmena" data-zmena></span>
      <span class="adm-napoveda adm-napoveda--mala">${h(popis)}</span>
    </article>`).join("");

  return `
<section class="adm-sekce" data-sekce="nastenka" hidden>
  <header class="adm-sekce__hlava">
    <div>
      <h2>Nástěnka</h2>
      <p class="adm-napoveda">Čísla z Google Analytics, bez přihlašování do Googlu. Šipka u čísla
        porovnává vybrané období se stejně dlouhým obdobím před ním. Tohle je ukázka na smyšlených datech.</p>
    </div>
    <div class="adm-prepinac-obdobi" role="group" aria-label="Období">
      <button type="button" class="adm-tl" data-obdobi="7">7 dní</button>
      <button type="button" class="adm-tl" data-obdobi="30" aria-pressed="true">30 dní</button>
      <button type="button" class="adm-tl" data-obdobi="90">90 dní</button>
    </div>
  </header>

  <div class="adm-metriky">${dlazdice}</div>

  <div class="adm-dvojice">
    <article class="adm-panel">
      <h3>Návštěvy v čase</h3>
      <div class="adm-graf" data-graf></div>
      <p class="adm-napoveda adm-napoveda--mala" data-graf-popis></p>
    </article>
    <article class="adm-panel">
      <h3>Odkud lidé přišli</h3>
      <ul class="adm-pruhy" data-zdroje></ul>
    </article>
  </div>

  <div class="adm-dvojice">
    <article class="adm-panel">
      <h3>Nejčtenější články</h3>
      <ol class="adm-zebricek" data-ctene></ol>
    </article>
    <article class="adm-panel">
      <h3>Co lidé hledali, než přišli</h3>
      <ul class="adm-pruhy" data-dotazy></ul>
    </article>
  </div>
</section>`;
}

/** Blog: seznam článků a editor. */
function blog() {
  return `
<section class="adm-sekce" data-sekce="blog" hidden>
  <header class="adm-sekce__hlava">
    <div>
      <h2>Blog</h2>
      <p class="adm-napoveda">Články se píšou tady. Koncept uvidíte jen vy, publikovaný článek se
        objeví na webu i v rozcestníku kategorie.</p>
    </div>
    <button type="button" class="adm-tl adm-tl--hlavni" data-novy-clanek>Nový článek</button>
  </header>

  <div class="adm-filtr">
    <label class="adm-hledani">
      <span class="jen-ctecka">Hledat v článcích</span>
      <input type="search" placeholder="Hledat v názvech a perexech" data-hledat>
    </label>
    <select data-filtr-kategorie aria-label="Kategorie"><option value="">Všechny kategorie</option></select>
    <select data-filtr-stav aria-label="Stav">
      <option value="">Publikované i koncepty</option>
      <option value="publikovano">Jen publikované</option>
      <option value="koncept">Jen koncepty</option>
    </select>
  </div>

  <div class="adm-tabulka-obal">
    <table class="adm-tabulka">
      <thead>
        <tr>
          <th scope="col">Článek</th>
          <th scope="col">Kategorie</th>
          <th scope="col">Vyšel</th>
          <th scope="col">Přečtení</th>
          <th scope="col">Stav</th>
          <th scope="col"><span class="jen-ctecka">Akce</span></th>
        </tr>
      </thead>
      <tbody data-clanky></tbody>
    </table>
  </div>
  <p class="adm-prazdno" data-clanky-prazdno hidden>Tomuhle hledání neodpovídá žádný článek.</p>
</section>`;
}

/** Editor článku — otevírá se přes celou šířku místo seznamu. */
function editor() {
  return `
<section class="adm-sekce" data-sekce="editor" hidden>
  <header class="adm-sekce__hlava">
    <div>
      <h2 data-editor-nadpis>Nový článek</h2>
      <p class="adm-napoveda">Vlevo text, vpravo to, co o článku vědí vyhledávače a rozcestník.</p>
    </div>
    <div class="adm-akce">
      <button type="button" class="adm-tl" data-editor-zpet>Zpět na seznam</button>
      <button type="button" class="adm-tl adm-tl--hlavni" data-editor-ulozit>Uložit</button>
    </div>
  </header>

  <form class="adm-editor" data-editor onsubmit="return false">
    <div class="adm-editor__text">
      <label>Titulek
        <input type="text" name="titulek" placeholder="O čem článek je" data-zrcadlo="nahled-titulek">
      </label>
      <label>Perex
        <textarea name="popis" rows="3" placeholder="Dvě věty, které se ukážou v rozcestníku a ve vyhledávači"
          data-zrcadlo="nahled-popis"></textarea>
      </label>
      <div class="adm-naradi" role="group" aria-label="Formátování">
        <button type="button" class="adm-tl adm-tl--mala" data-vlozit="## ">Mezinadpis</button>
        <button type="button" class="adm-tl adm-tl--mala" data-obal="**">Tučně</button>
        <button type="button" class="adm-tl adm-tl--mala" data-vlozit="- ">Odrážka</button>
        <button type="button" class="adm-tl adm-tl--mala" data-vlozit="> ">Zvýrazněná věta</button>
      </div>
      <label>Text článku
        <textarea name="telo" rows="18" placeholder="Vlastní text. Odstavce oddělte prázdným řádkem."></textarea>
      </label>
      <p class="adm-napoveda adm-napoveda--mala" data-pocet-znaku></p>
    </div>

    <aside class="adm-editor__bok">
      <div class="adm-panel">
        <h3>Zařazení</h3>
        <label>Kategorie <select name="kategorie" data-editor-kategorie></select></label>
        <label>Datum vydání <input type="date" name="datum"></label>
        <label>Doba čtení <input type="number" name="minut" min="1" max="30" step="1"> <span class="adm-pripona">minut</span></label>
        <label>Souvisí se službou <select name="sluzba" data-editor-sluzba></select></label>
        <fieldset class="adm-stav">
          <legend>Stav</legend>
          <label class="adm-prepinatko"><input type="radio" name="stav" value="koncept"> Koncept</label>
          <label class="adm-prepinatko"><input type="radio" name="stav" value="publikovano"> Publikováno</label>
        </fieldset>
      </div>

      <div class="adm-panel">
        <h3>Úvodní obrázek</h3>
        <div class="adm-foto-vyber" data-editor-foto></div>
        <button type="button" class="adm-tl adm-tl--mala" data-vybrat-foto>Vybrat z obrázků</button>
      </div>

      <div class="adm-panel">
        <h3>Jak to uvidí Google</h3>
        <div class="adm-serp">
          <span class="adm-serp__adresa" data-nahled-adresa>fresiadent.cz › blog ›</span>
          <span class="adm-serp__titulek" data-nahled-titulek>Titulek článku</span>
          <span class="adm-serp__popis" data-nahled-popis>Perex se ukáže tady — a taky ve výpisu blogu.</span>
        </div>
        <p class="adm-napoveda adm-napoveda--mala" data-delka-titulku></p>
      </div>
    </aside>
  </form>
</section>`;
}

/** Texty stránek: co je na webu napsané, po skupinách. */
function texty() {
  return `
<section class="adm-sekce" data-sekce="texty" hidden>
  <header class="adm-sekce__hlava">
    <div>
      <h2>Texty stránek</h2>
      <p class="adm-napoveda">Všechno, co je na webu napsané mimo blog. Rozbalte stránku a přepište text —
        nikde se nesahá na vzhled.</p>
    </div>
    <button type="button" class="adm-tl adm-tl--hlavni" data-ulozit-texty>Uložit texty</button>
  </header>
  <div class="adm-harmonika" data-texty></div>
</section>`;
}

/** Služby: co ordinace nabízí. */
function sluzby() {
  return `
<section class="adm-sekce" data-sekce="sluzby" hidden>
  <header class="adm-sekce__hlava">
    <div>
      <h2>Služby</h2>
      <p class="adm-napoveda">Každá služba má svou stránku. Tady se mění, co je na ní napsané.</p>
    </div>
    <button type="button" class="adm-tl adm-tl--hlavni" data-ulozit-sluzby>Uložit služby</button>
  </header>
  <div class="adm-harmonika" data-sluzby></div>
</section>`;
}

/** Obrázky: knihovna a nahrávání. */
function obrazky() {
  return `
<section class="adm-sekce" data-sekce="obrazky" hidden>
  <header class="adm-sekce__hlava">
    <div>
      <h2>Obrázky</h2>
      <p class="adm-napoveda">Fotky, které web používá. Nahraný obrázek se sám zmenší do tří velikostí,
        aby se na mobilu nestahovala velká fotka.</p>
    </div>
  </header>

  <div class="adm-nahrat" data-nahrat tabindex="0" role="button"
       aria-label="Nahrát obrázek — přetáhněte sem soubor nebo klikněte">
    <strong>Přetáhněte sem fotku</strong>
    <span class="adm-napoveda">nebo klikněte a vyberte ze souborů · JPG, PNG, WebP do 8 MB</span>
    <input type="file" accept="image/*" multiple hidden data-nahrat-vstup>
  </div>

  <div class="adm-galerie" data-galerie></div>
</section>`;
}

/** Ordinace: kontakt a hodiny. */
function ordinace() {
  return `
<section class="adm-sekce" data-sekce="ordinace" hidden>
  <header class="adm-sekce__hlava">
    <div>
      <h2>Ordinace</h2>
      <p class="adm-napoveda">Spojení a hodiny. Mění se na všech stránkách naráz — v patičce,
        v kontaktu i ve spodní liště na mobilu.</p>
    </div>
    <button type="button" class="adm-tl adm-tl--hlavni" data-ulozit-ordinaci>Uložit</button>
  </header>

  <div class="adm-dvojice">
    <article class="adm-panel">
      <h3>Spojení</h3>
      <div data-spojeni></div>
    </article>
    <article class="adm-panel">
      <h3>Ordinační hodiny</h3>
      <div class="adm-hodiny" data-hodiny></div>
      <p class="adm-napoveda adm-napoveda--mala">Prázdné pole znamená zavřeno.</p>
    </article>
  </div>
</section>`;
}

export function administrace(ctx, data) {
  const zalozky = ZALOZKY.map(([id, popisek, ik]) => `
    <button type="button" class="adm-zalozka" data-zalozka="${id}" aria-selected="false">
      ${ikona(ik)}<span>${h(popisek)}</span>
    </button>`).join("");

  return {
    titulek: "Administrace — ukázka",
    popis: `Ukázka administrace webu pro ${ctx.site.firma}. Demo na smyšlených datech.`,
    trida: "je-administrace",
    cista: true,
    hlavaNavic: `<link rel="stylesheet" href="assets/admin.css">`,
    skriptyNavic: `<script type="application/json" id="adm-data">${
      JSON.stringify(data).replace(/</g, "\\u003c")
    }</script>
<script src="assets/admin.js" defer></script>`,
    telo: `
${prihlaseni(ctx)}

<div class="adm" data-adm hidden>
  <header class="adm-hlava">
    <a class="adm-znacka" href="${odkaz("administrace.html", "index.html")}">
      <img src="assets/img/logo.png" width="278" height="74" alt="${h(ctx.site.znacka)}">
      <span>Administrace</span>
    </a>
    <div class="adm-hlava__akce">
      <a class="adm-tl" href="${odkaz("administrace.html", "index.html")}" target="_blank" rel="noopener">Zobrazit web</a>
      <span class="adm-ucet">${h(ctx.site.lekarka)}</span>
      <button type="button" class="adm-tl" data-odhlasit>Odhlásit</button>
    </div>
  </header>

  <div class="adm-pruh">
    Ukázka administrace — data jsou smyšlená a změny zůstávají jen ve vašem prohlížeči.
    <button type="button" class="adm-tl adm-tl--mala" data-vycistit>Vrátit do původního stavu</button>
  </div>

  <div class="adm-telo">
    <nav class="adm-zalozky" aria-label="Části administrace">${zalozky}</nav>
    <main class="adm-obsah">
      ${nastenka()}
      ${blog()}
      ${editor()}
      ${texty()}
      ${sluzby()}
      ${obrazky()}
      ${ordinace()}
    </main>
  </div>
</div>

<div class="adm-hlaska" data-hlaska role="status" aria-live="polite" hidden></div>
<dialog class="adm-dialog" data-dialog-foto>
  <h3>Vyberte obrázek</h3>
  <div class="adm-galerie adm-galerie--vyber" data-dialog-galerie></div>
  <button type="button" class="adm-tl" data-dialog-zavrit>Zavřít</button>
</dialog>`,
  };
}
