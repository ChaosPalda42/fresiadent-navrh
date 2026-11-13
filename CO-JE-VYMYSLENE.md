# Co je na ukázce vymyšlené

Ukázka nového webu pro **FresiaDent s.r.o.** (MUDr. Zuzana Střelcová, Poliklinika
Vysočany, Praha 9). Postaveno jako návrh — ordinace si ho neobjednala a nic z toho
zatím neschválila. Web je `noindex, nofollow` a `robots.txt` ho celý zakazuje.

## Co je reálné (ze současného webu fresiadent.cz)

- Název firmy, jméno lékařky, adresa, PSČ, telefony, e-mail, ordinační hodiny
- Motto „Spondeo ac Polliceor“
- Životopis lékařky v sekci „Kdo vás ošetří“ — doslova z jejich stránky O nás
- **Všech šest článků v blogu** — texty jsou jejich, jen rozsekané do bloků
  (nadpis / odstavec / seznam) a vysázené v novém vzhledu
- Všechny fotografie — stažené z jejich webu a převedené do WebP

## Co jsme si vymysleli my

| Kde | Co |
|---|---|
| `data/site.json` → `pojistovny` | Seznam sedmi zdravotních pojišťoven. Víme jen, že smlouvy mají; **které konkrétně, je potřeba ověřit.** |
| `data/site.json` → `doprava` | Tramvajové spojení (zastávka a linky). Metro a parkoviště sedí, tramvaj je odhad podle mapy. |
| `data/sluzby.json` | Rozdělení na sedm služeb podle toho, co ordinace na webu uvádí. Vymyšlené jsou u každé služby: `perex`, `prubeh` / `vyhody`, `trvani` a `hrazeno`. **Ceny a doby ošetření si musí ordinace projít.** |
| `data/texty.json` | Hero, „Proč k nám“, „Jak probíhá první návštěva“, texty k objednání, nadpisy blogu a **všech osm častých dotazů** v sekci Pro pacienty. Výjimka: `oNas` je reálný text z jejich webu. |
| Fakturační údaje v Kontaktu | Uvedeny jen ty, které jsou veřejné. IČO, DIČ ani číslo účtu v ukázce nejsou. |
| Ochrana osobních údajů | Rozumný základ, ne právní dokument. Finální znění se dělá podle toho, jaké systémy ordinace používá. |

## Co na ukázce schválně není

- **Žádný kontaktní formulář.** Ordinace ho nechce. Objednání je telefon (`tel:`)
  a předvyplněný e-mail (`mailto:`), na mobilu navíc pevná spodní lišta.
- Žádné cookies, žádné měření, žádné vyskakovací okno.
- Administrace a nástěnka se statistikami z Google Analytics jsou v nabídce,
  v téhle ukázce postavené nejsou.
