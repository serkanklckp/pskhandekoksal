/* ==========================================================================
   Hande Köksal · Klinik Psikolog — Site etkileşimleri
   --------------------------------------------------------------------------
   Kütüphane kullanılmadan, saf JavaScript ile yazılmıştır.
   Bu dosya olmasa da site çalışır; buradaki kodlar yalnızca deneyimi
   zenginleştirir (mobil menü, ön görüşme formu, nefes egzersizi vb.).

   ► Değiştirmeniz gereken tek yer aşağıdaki AYARLAR bölümüdür.
   ========================================================================== */

const AYARLAR = {
  // WhatsApp numaranız: başında ülke kodu (90) olacak, boşluk ve + olmadan.
  whatsapp: "905XXXXXXXXX",
  // SMS için telefon numaranız: başında + ve ülke kodu (90) olacak, boşluksuz.
  telefon: "+905XXXXXXXXX",
  // Ön görüşme formunun "E-posta ile gönder" seçeneğinin gideceği adres.
  eposta: "iletisim@alanadiniz.com",
  // E-posta konusu
  epostaKonu: "Web sitesinden ön görüşme talebi",
};

(() => {
  "use strict";

  const d = document;
  const hareketAz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Mobil menü ------------------------------------------------------- */
  const menuDugme = d.querySelector(".menu-dugme");
  const menu = d.getElementById("ana-menu");

  function menuyuKapat(odakGeri = false) {
    if (!menu || !menuDugme) return;
    menu.classList.remove("acik");
    menuDugme.setAttribute("aria-expanded", "false");
    d.body.classList.remove("menu-acik");
    if (odakGeri) menuDugme.focus();
  }

  if (menuDugme && menu) {
    menuDugme.addEventListener("click", () => {
      const acik = menuDugme.getAttribute("aria-expanded") === "true";
      if (acik) {
        menuyuKapat();
      } else {
        menu.classList.add("acik");
        menuDugme.setAttribute("aria-expanded", "true");
        d.body.classList.add("menu-acik");
        const ilkLink = menu.querySelector("a");
        if (ilkLink) ilkLink.focus({ preventScroll: true });
      }
    });
    d.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("acik")) menuyuKapat(true);
    });
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) menuyuKapat();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1239) menuyuKapat(); // css/style.css → 18.17 ile aynı sınır
    });
  }

  /* 1b. Açılır menüler (Ben Kimim?, Çalışma Alanlarım, Danışmanlık Seçenekleri) */
  const masaustuMenu = window.matchMedia("(min-width: 1240px)");
  d.querySelectorAll(".menu__grup").forEach((grup) => {
    const dugme = grup.querySelector(".menu__acilir");
    if (!dugme) return;
    const kapat = () => {
      grup.classList.remove("acik");
      dugme.setAttribute("aria-expanded", "false");
    };
    dugme.addEventListener("click", () => {
      const acik = grup.classList.toggle("acik");
      dugme.setAttribute("aria-expanded", acik ? "true" : "false");
    });
    d.addEventListener("click", (e) => {
      if (!grup.contains(e.target)) kapat();
    });
    grup.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && grup.classList.contains("acik")) {
        kapat();
        dugme.focus();
        e.stopPropagation();
      }
    });
    // Masaüstünde odak menüden çıkınca kapanır. Mobil menüde (akordeon) bu yapılmaz:
    // açık bir grubun kapanması sayfayı kaydırıp bir sonraki dokunuşu boşa çıkarıyordu.
    grup.addEventListener("focusout", (e) => {
      if (masaustuMenu.matches && e.relatedTarget && !grup.contains(e.relatedTarget)) kapat();
    });
  });

  /* 2. Yüzen iletişim paneli -------------------------------------------- */
  const yuzenDugme = d.querySelector(".yuzen__dugme");
  const yuzenPanel = d.getElementById("yuzen-panel");

  function yuzenKapat(odakGeri = false) {
    if (!yuzenDugme || !yuzenPanel) return;
    yuzenPanel.hidden = true;
    yuzenDugme.setAttribute("aria-expanded", "false");
    if (odakGeri) yuzenDugme.focus();
  }
  if (yuzenDugme && yuzenPanel) {
    yuzenDugme.addEventListener("click", () => {
      const acik = yuzenDugme.getAttribute("aria-expanded") === "true";
      if (acik) {
        yuzenKapat();
      } else {
        yuzenPanel.hidden = false;
        yuzenDugme.setAttribute("aria-expanded", "true");
      }
    });
    d.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !yuzenPanel.hidden) yuzenKapat(true);
    });
    d.addEventListener("click", (e) => {
      if (!yuzenPanel.hidden && !e.target.closest(".yuzen")) yuzenKapat();
    });
    // Panel içindeki bir bağlantıya (ör. aynı sayfadaki forma) tıklanınca panel kapanır
    yuzenPanel.addEventListener("click", (e) => {
      if (e.target.closest("a")) yuzenKapat();
    });
  }

  /* 3. Üst menü gölgesi + yüzen düğme görünürlüğü ----------------------- */
  const ust = d.querySelector(".ust");
  const yuzen = d.querySelector(".yuzen");
  let bekleyen = false;

  function kaydirmaKontrol() {
    const y = window.scrollY;
    if (ust) ust.classList.toggle("kaydirildi", y > 8);
    if (yuzen) {
      const goster = y > 520;
      yuzen.classList.toggle("gorunur", goster);
      if (!goster) yuzenKapat();
    }
    bekleyen = false;
  }
  window.addEventListener("scroll", () => {
    if (!bekleyen) {
      bekleyen = true;
      window.requestAnimationFrame(kaydirmaKontrol);
    }
  }, { passive: true });
  kaydirmaKontrol();

  /* 4. Kaydırınca beliren içerik ---------------------------------------- */
  const belirecekler = d.querySelectorAll("[data-belir]");
  if (!hareketAz && "IntersectionObserver" in window && belirecekler.length) {
    const gozlemci = new IntersectionObserver((girdiler) => {
      girdiler.forEach((g) => {
        if (g.isIntersecting) {
          g.target.classList.add("beliriyor");
          g.target.classList.remove("bekliyor");
          gozlemci.unobserve(g.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    belirecekler.forEach((el) => {
      // Sadece ekranın altında kalan öğeleri gizle; ilk görünen içerik titremesin.
      if (el.getBoundingClientRect().top > window.innerHeight * 0.92) {
        el.classList.add("bekliyor");
        gozlemci.observe(el);
      }
    });
  }

  /* 4b. Çalışma alanları yapbozu: parçalar yerine oturunca üzerine gelme efekti gecikmesiz çalışır */
  d.querySelectorAll("[data-yapboz]").forEach((yapboz) => {
    const tamamla = () => yapboz.classList.add("yapboz--tamam");
    if (!yapboz.classList.contains("bekliyor")) {
      tamamla();
      return;
    }
    const izleyici = new MutationObserver(() => {
      if (!yapboz.classList.contains("bekliyor")) {
        izleyici.disconnect();
        window.setTimeout(tamamla, 1500);
      }
    });
    izleyici.observe(yapboz, { attributes: true, attributeFilter: ["class"] });
  });

  /* 5. Harita: yalnızca kullanıcı isterse yüklenir (gizlilik) ----------- */
  d.querySelectorAll("[data-harita-yukle]").forEach((dugme) => {
    dugme.addEventListener("click", () => {
      const kutu = dugme.closest(".harita");
      if (!kutu) return;
      const adres = kutu.getAttribute("data-adres") || "";
      const iframe = d.createElement("iframe");
      iframe.src = "https://www.google.com/maps?q=" + encodeURIComponent(adres) + "&output=embed";
      iframe.title = "Ofis konumu – Google Haritalar";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.setAttribute("allowfullscreen", "");
      kutu.querySelectorAll(".harita__kapak, .harita__cizim").forEach((el) => el.remove());
      kutu.appendChild(iframe);
    });
  });

  /* 5b. "Yol tarifi al" bağlantıları sayfadaki adresten oluşturulur ---- */
  const adresKaynagi = d.querySelector("[data-adres]");
  if (adresKaynagi) {
    const adres = adresKaynagi.getAttribute("data-adres");
    d.querySelectorAll("[data-yol-tarifi]").forEach((a) => {
      a.href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(adres);
    });
  }

  /* 6. Ön görüşme talep formu → WhatsApp / SMS / e-posta ----------------- */
  const form = d.getElementById("on-gorusme-formu");
  if (form) {
    const durum = form.querySelector(".form-durum");
    const gonderYazi = form.querySelector("[data-gonder-yazi]");
    const KANALLAR = {
      whatsapp: { ad: "WhatsApp", dugme: "WhatsApp ile gönder" },
      sms: { ad: "Telefon (SMS)", dugme: "SMS ile gönder" },
      eposta: { ad: "E-posta", dugme: "E-posta ile gönder" },
    };

    function seciliKanal() {
      const secili = form.querySelector('input[name="kanal"]:checked');
      return secili && KANALLAR[secili.value] ? secili.value : "whatsapp";
    }

    // Gönder butonunun yazısı ve ikonu seçilen kanala göre değişir
    function dugmeyiGuncelle() {
      const kanal = seciliKanal();
      if (gonderYazi) gonderYazi.textContent = KANALLAR[kanal].dugme;
      form.querySelectorAll("[data-kanal-ikon]").forEach((el) => {
        el.hidden = el.getAttribute("data-kanal-ikon") !== kanal;
      });
    }
    form.querySelectorAll('input[name="kanal"]').forEach((r) => r.addEventListener("change", dugmeyiGuncelle));
    dugmeyiGuncelle();

    function hataGoster(alan, mesaj) {
      const hata = d.getElementById(alan.id + "-hata");
      alan.setAttribute("aria-invalid", mesaj ? "true" : "false");
      if (hata) hata.textContent = mesaj || "";
    }

    function dogrula() {
      let ilkHatali = null;
      const ad = form.elements["ad"];
      const tel = form.elements["telefon"];
      const eposta = form.elements["eposta"];
      const kvkk = form.elements["kvkk"];

      const adDegeri = ad.value.trim();
      if (adDegeri.length < 2) { hataGoster(ad, "Lütfen adınızı ve soyadınızı yazın."); ilkHatali = ilkHatali || ad; }
      else hataGoster(ad, "");

      const rakamlar = tel.value.replace(/\D/g, "");
      if (rakamlar.length < 10 || rakamlar.length > 13) { hataGoster(tel, "Lütfen geçerli bir telefon numarası yazın (ör. 0 5XX XXX XX XX)."); ilkHatali = ilkHatali || tel; }
      else hataGoster(tel, "");

      const e = eposta.value.trim();
      if (!e && seciliKanal() === "eposta") { hataGoster(eposta, "E-posta ile iletişim için lütfen e-posta adresinizi yazın."); ilkHatali = ilkHatali || eposta; }
      else if (e && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) { hataGoster(eposta, "E-posta adresi geçerli görünmüyor."); ilkHatali = ilkHatali || eposta; }
      else hataGoster(eposta, "");

      if (!kvkk.checked) { hataGoster(kvkk, "Devam etmek için aydınlatma metnini okuduğunuzu onaylayın."); ilkHatali = ilkHatali || kvkk; }
      else hataGoster(kvkk, "");

      if (ilkHatali) ilkHatali.focus();
      return !ilkHatali;
    }

    function mesajOlustur() {
      const f = form.elements;
      const satirlar = [
        "Merhaba, web siteniz üzerinden ön görüşme talebinde bulunmak istiyorum.",
        "",
        "Ad Soyad: " + f["ad"].value.trim(),
        "Telefon: " + f["telefon"].value.trim(),
      ];
      if (f["eposta"].value.trim()) satirlar.push("E-posta: " + f["eposta"].value.trim());
      satirlar.push("Tercih ettiğim iletişim kanalı: " + KANALLAR[seciliKanal()].ad);
      if (f["mesaj"].value.trim()) satirlar.push("", "Mesajım: " + f["mesaj"].value.trim());
      return satirlar.join("\n");
    }

    function bilgi(html) {
      durum.innerHTML = '<div class="bilgi-kutusu" role="status"><span aria-hidden="true">✓</span><p>' + html + "</p></div>";
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!dogrula()) {
        durum.innerHTML = "";
        return;
      }
      const kanal = seciliKanal();
      const metin = mesajOlustur();
      if (kanal === "eposta") {
        window.location.href = "mailto:" + AYARLAR.eposta +
          "?subject=" + encodeURIComponent(AYARLAR.epostaKonu) +
          "&body=" + encodeURIComponent(metin);
        bilgi('E-posta uygulamanız hazır bir mesaj taslağıyla açıldı. <strong>Göndermeyi unutmayın.</strong> Açılmadıysa doğrudan <a href="mailto:' + AYARLAR.eposta + '">' + AYARLAR.eposta + "</a> adresine yazabilirsiniz.");
      } else if (kanal === "sms") {
        window.location.href = "sms:" + AYARLAR.telefon + "?&body=" + encodeURIComponent(metin);
        bilgi("SMS uygulamanız hazır bir mesaj taslağıyla açıldı. <strong>Mesajı göndermeyi unutmayın.</strong> Bilgisayardan bağlanıyorsanız SMS uygulaması açılmayabilir; bu durumda WhatsApp ya da e-posta seçeneğini kullanabilirsiniz.");
      } else {
        const link = "https://wa.me/" + AYARLAR.whatsapp + "?text=" + encodeURIComponent(metin);
        const pencere = window.open(link, "_blank");
        if (pencere) pencere.opener = null;
        else window.location.href = link;
        bilgi("WhatsApp hazır bir mesaj taslağıyla açıldı. <strong>Mesajı göndermeyi unutmayın.</strong> En kısa sürede size dönüş yapılacaktır.");
      }
    });
  }

  /* 7. Nefes egzersizi (4 sn al · 4 sn tut · 6 sn ver) -------------------- */
  const nefes = d.querySelector("[data-nefes]");
  if (nefes) {
    const daire = nefes.querySelector(".nefes__daire");
    const evreYazi = nefes.querySelector(".nefes__evre");
    const sayacYazi = nefes.querySelector(".nefes__sayac");
    const dugme = nefes.querySelector(".nefes__dugme");
    const duyuru = nefes.querySelector(".nefes__duyuru");
    const EVRELER = [
      { ad: "al", yazi: "Nefes alın", sure: 4 },
      { ad: "tut", yazi: "Tutun", sure: 4 },
      { ad: "ver", yazi: "Yavaşça verin", sure: 6 },
    ];
    const TOPLAM_TUR = 4; // yaklaşık 1 dakika
    let zamanlayici = null;
    let tur = 0, evreNo = 0, kalan = 0;

    function evreBaslat() {
      const evre = EVRELER[evreNo];
      kalan = evre.sure;
      daire.setAttribute("data-evre", evre.ad);
      evreYazi.textContent = evre.yazi;
      sayacYazi.textContent = kalan + " sn";
      duyuru.textContent = evre.yazi;
    }
    function durdur(bitti) {
      clearInterval(zamanlayici);
      zamanlayici = null;
      daire.removeAttribute("data-evre");
      dugme.textContent = bitti ? "Yeniden başlat" : "Başlat";
      dugme.setAttribute("aria-pressed", "false");
      evreYazi.textContent = bitti ? "Tamamlandı" : "Hazır mısınız?";
      sayacYazi.textContent = bitti ? "Nasıl hissediyorsunuz?" : "";
      duyuru.textContent = bitti ? "Egzersiz tamamlandı." : "";
    }
    dugme.addEventListener("click", () => {
      if (zamanlayici) { durdur(false); return; }
      tur = 0; evreNo = 0;
      dugme.textContent = "Durdur";
      dugme.setAttribute("aria-pressed", "true");
      evreBaslat();
      zamanlayici = setInterval(() => {
        kalan -= 1;
        if (kalan > 0) { sayacYazi.textContent = kalan + " sn"; return; }
        evreNo += 1;
        if (evreNo >= EVRELER.length) { evreNo = 0; tur += 1; }
        if (tur >= TOPLAM_TUR) { durdur(true); return; }
        evreBaslat();
      }, 1000);
    });
  }

  /* 7b. SSS: adresteki #bağlantı bir soruyu gösteriyorsa o soru açılır (ör. sss.html#gizlilik) */
  const soruyuAc = () => {
    const kimlik = decodeURIComponent(window.location.hash.slice(1));
    if (!kimlik) return;
    const hedef = d.getElementById(kimlik);
    const soru = hedef && hedef.closest("details");
    if (soru) soru.open = true;
  };
  soruyuAc();
  window.addEventListener("hashchange", soruyuAc);

  /* 8. Alt bilgideki yıl ------------------------------------------------ */
  d.querySelectorAll("[data-yil]").forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
