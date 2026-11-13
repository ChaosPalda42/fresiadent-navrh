/* FresiaDent — chování webu. Žádná knihovna, jen to, co je potřeba. */
(function () {
  "use strict";

  var klid = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------- menu */
  var prepinac = document.querySelector("[data-prepinac]");
  if (prepinac) {
    var hlava = document.querySelector(".hlava");
    prepinac.addEventListener("click", function () {
      var otevreno = document.body.classList.toggle("menu-otevreno");
      prepinac.setAttribute("aria-expanded", String(otevreno));
      document.body.style.overflow = otevreno ? "hidden" : "";
      /* panel začíná pod hlavičkou tam, kde zrovna je — nahoře stránky ji posunul
         pruh ukázky, takže pevné --hlava-v by přes ni přelezlo */
      if (otevreno && hlava) {
        document.documentElement.style.setProperty(
          "--menu-vrch", Math.max(0, Math.round(hlava.getBoundingClientRect().bottom)) + "px");
      }
    });
  }

  /* rozbalovací Služby — na myši hover, jinak klik */
  document.querySelectorAll("[data-rozbal]").forEach(function (rozbal) {
    var spoust = rozbal.querySelector(".rozbal__spoust");
    var jemne = window.matchMedia("(hover: hover) and (min-width: 881px)");

    function nastav(stav) {
      if (stav) rozbal.setAttribute("data-otevreno", "");
      else rozbal.removeAttribute("data-otevreno");
      spoust.setAttribute("aria-expanded", String(stav));
    }
    spoust.addEventListener("click", function (e) {
      e.preventDefault();
      nastav(!rozbal.hasAttribute("data-otevreno"));
    });
    rozbal.addEventListener("mouseenter", function () { if (jemne.matches) nastav(true); });
    rozbal.addEventListener("mouseleave", function () { if (jemne.matches) nastav(false); });
    document.addEventListener("click", function (e) {
      if (jemne.matches && !rozbal.contains(e.target)) nastav(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") nastav(false);
    });
  });

  /* ---------------------------------------------------------- otevřeno teď */
  var DOBA = [null, [8, 15], [8, 15], [8, 15], [8, 15], null, null]; /* ne, po, út, st, čt, pá, so */

  function stavOrdinace(ted) {
    var den = ted.getDay();
    var hod = ted.getHours() + ted.getMinutes() / 60;
    var dnes = DOBA[den];
    if (dnes && hod >= dnes[0] && hod < dnes[1]) {
      return { otevreno: true, text: "Teď máme otevřeno — zavolejte" };
    }
    for (var i = 1; i <= 7; i++) {
      var d = DOBA[(den + i) % 7];
      if (d) {
        var jmena = ["v neděli", "v pondělí", "v úterý", "ve středu", "ve čtvrtek", "v pátek", "v sobotu"];
        var kdy = i === 1 ? "zítra" : (i === 0 ? "dnes" : jmena[(den + i) % 7]);
        if (dnes && hod < dnes[0]) kdy = "dnes";
        return { otevreno: false, text: "Teď je zavřeno — otevíráme " + kdy + " v " + d[0] + ":00" };
      }
    }
    return { otevreno: false, text: "Teď je zavřeno" };
  }

  var stav = stavOrdinace(new Date());
  document.querySelectorAll("[data-stav]").forEach(function (el) {
    var tecka = el.querySelector(".tecka");
    var text = el.querySelector("[data-stav-text]");
    if (tecka && !stav.otevreno) tecka.classList.add("tecka--zavreno");
    if (text) text.textContent = stav.text;
  });

  /* dnešní den v otevírací době */
  var dnesniRadek = document.querySelector('[data-den="' + new Date().getDay() + '"]');
  if (dnesniRadek) {
    dnesniRadek.classList.add("dnes");
    var dd = dnesniRadek.nextElementSibling;
    if (dd) dd.classList.add("dnes");
  }

  /* ---------------------------------------------------------- kopírování */
  document.querySelectorAll("[data-kopirovat]").forEach(function (tl) {
    tl.addEventListener("click", function () {
      var co = tl.getAttribute("data-kopirovat");
      var puvodni = tl.querySelector("span").textContent;
      navigator.clipboard.writeText(co).then(function () {
        tl.querySelector("span").textContent = "Zkopírováno";
        setTimeout(function () { tl.querySelector("span").textContent = puvodni; }, 1800);
      }).catch(function () {});
    });
  });

  /* ---------------------------------------------------------- obsah článku */
  var obsah = document.querySelector("[data-obsah]");
  if (obsah) {
    var nadpisy = Array.prototype.slice.call(document.querySelectorAll(".text h2[id]"));
    if (nadpisy.length > 1) {
      var ol = document.createElement("ol");
      nadpisy.forEach(function (h) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#" + h.id;
        a.textContent = h.textContent;
        li.appendChild(a);
        ol.appendChild(li);
      });
      obsah.appendChild(ol);

      var odkazy = obsah.querySelectorAll("a");
      var sled = new IntersectionObserver(function (zaznamy) {
        zaznamy.forEach(function (z) {
          if (!z.isIntersecting) return;
          odkazy.forEach(function (a) { a.removeAttribute("aria-current"); });
          var cil = obsah.querySelector('a[href="#' + z.target.id + '"]');
          if (cil) cil.setAttribute("aria-current", "true");
        });
      }, { rootMargin: "-80px 0px -70% 0px" });
      nadpisy.forEach(function (h) { sled.observe(h); });
    } else {
      obsah.remove();
    }
  }

  /* ---------------------------------------------------------- sdílení */
  var sdilet = document.querySelector("[data-sdilet]");
  if (sdilet && navigator.share) {
    sdilet.hidden = false;
    sdilet.addEventListener("click", function () {
      navigator.share({ title: document.title, url: location.href }).catch(function () {});
    });
  }

  /* ---------------------------------------------------------- zub v heru */
  var platno = document.querySelector("[data-zub]");
  if (platno && !klid) {
    var ctx = platno.getContext("2d");
    var body = [];
    var sirka = 0, vyska = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cas = 0, bezi = false;

    var maska = new Image();
    maska.src = platno.getAttribute("data-zub");

    /* zub kreslíme přesně tam, kde leží jeho tichá předloha v rozvržení */
    var obrys = platno.parentElement.querySelector(".hero__zub img");
    var sx = 0, sy = 0, mer = 0;

    function rozmer() {
      var r = platno.getBoundingClientRect();
      sirka = r.width; vyska = r.height;
      platno.width = Math.round(sirka * dpr);
      platno.height = Math.round(vyska * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (obrys && obrys.getBoundingClientRect().width > 0) {
        var o = obrys.getBoundingClientRect();
        sx = o.left - r.left + o.width / 2;
        sy = o.top - r.top + o.height / 2;
        mer = o.width;
      } else {
        sx = sirka * 0.72; sy = vyska * 0.5;
        mer = Math.min(sirka * 0.34, vyska * 0.68);
      }
    }

    /* z masky zubu vybereme body, kde je kresba */
    function nactiBody() {
      var N = 190;
      var pom = document.createElement("canvas");
      pom.width = N; pom.height = N;
      var pctx = pom.getContext("2d", { willReadFrequently: true });
      pctx.drawImage(maska, 0, 0, N, N);
      var data = pctx.getImageData(0, 0, N, N).data;

      body = [];
      for (var y = 0; y < N; y += 2) {
        for (var x = 0; x < N; x += 2) {
          var i = (y * N + x) * 4;
          if (data[i + 3] < 110) continue;
          if (Math.random() > 0.62) continue;
          body.push({
            x: x / N - 0.5,
            y: y / N - 0.5,
            f: Math.random() * Math.PI * 2,
            r: 0.5 + Math.random() * 1.25,
            j: 0.25 + Math.random() * 0.75,
          });
        }
      }
    }

    function kresli() {
      if (!bezi) return;
      cas += 0.0055;
      ctx.clearRect(0, 0, sirka, vyska);

      var otoc = Math.sin(cas * 0.55) * 0.3;
      /* světelná vlna shora dolů — nerýsuje se, jen rozsvěcuje body */
      var yv = sy + ((((cas * 0.14) % 1.6) - 0.3) - 0.5) * mer * 1.1;
      var sirkaVlny = Math.max(26, mer * 0.1);

      for (var i = 0; i < body.length; i++) {
        var b = body[i];
        /* jemné otáčení kolem svislé osy — jen škálováním x */
        var px = b.x * Math.cos(otoc);
        var hloubka = b.x * Math.sin(otoc);
        var pulz = Math.sin(cas * 2.1 + b.f) * 0.5 + 0.5;
        var x = sx + px * mer * 1.06;
        var y = sy + b.y * mer * 1.06 + Math.sin(cas * 1.3 + b.f) * 1.6;
        var vlna = Math.max(0, 1 - Math.abs(y - yv) / sirkaVlny);
        var a = (0.26 + pulz * 0.62 + vlna * 0.55) * b.j * (0.62 + hloubka * 0.38);
        if (a <= 0.01) continue;
        var r = b.r * (0.78 + hloubka * 0.22);

        ctx.beginPath();
        ctx.arc(x, y, r, 0, 6.2832);
        ctx.fillStyle = "rgba(" + (pulz > 0.86 || vlna > 0.55 ? "190,235,255" : "79,195,232") + "," + Math.min(a, 1).toFixed(3) + ")";
        ctx.fill();
      }

      requestAnimationFrame(kresli);
    }

    maska.addEventListener("load", function () {
      rozmer();
      nactiBody();
      bezi = true;
      requestAnimationFrame(kresli);
    });

    var zmena;
    window.addEventListener("resize", function () {
      clearTimeout(zmena);
      zmena = setTimeout(rozmer, 180);
    });

    /* když hero není vidět, nekreslíme */
    var hlidac = new IntersectionObserver(function (z) {
      var vidi = z[0].isIntersecting;
      if (vidi && !bezi && body.length) { bezi = true; requestAnimationFrame(kresli); }
      if (!vidi) bezi = false;
    }, { threshold: 0 });
    hlidac.observe(platno);
  }
})();
