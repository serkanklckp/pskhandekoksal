/* ==========================================================================
   Hande Köksal · Klinik Psikolog — Site etkileşimleri
   --------------------------------------------------------------------------
   Kütüphane kullanılmadan, saf JavaScript ile yazılmıştır.
   Bu dosya olmasa da site çalışır; buradaki kodlar yalnızca deneyimi
   zenginleştirir (mobil menü, randevu formu, nefes egzersizi vb.).

   ► Değiştirmeniz gereken tek yer aşağıdaki AYARLAR bölümüdür.
   ========================================================================== */

const AYARLAR = {
  // WhatsApp numaranız: başında ülke kodu (90) olacak, boşluk ve + olmadan.
  whatsapp: "905XXXXXXXXX",
  // Randevu formunun "E-posta ile gönder" seçeneğinin gideceği adres.
  eposta: "iletisim@alanadiniz.com",
  // E-posta konusu
  epostaKonu: "Web sitesinden randevu talebi",
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
      if (window.innerWidth > 1060) menuyuKapat();
    });
  }

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

  /* 6. Randevu talep formu → WhatsApp / e-posta ------------------------- */
  const form = d.getElementById("randevu-formu");
  if (form) {
    const durum = form.querySelector(".form-durum");

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
      if (e && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) { hataGoster(eposta, "E-posta adresi geçerli görünmüyor."); ilkHatali = ilkHatali || eposta; }
      else hataGoster(eposta, "");

      if (!kvkk.checked) { hataGoster(kvkk, "Devam etmek için aydınlatma metnini okuduğunuzu onaylayın."); ilkHatali = ilkHatali || kvkk; }
      else hataGoster(kvkk, "");

      if (ilkHatali) ilkHatali.focus();
      return !ilkHatali;
    }

    function mesajOlustur() {
      const f = form.elements;
      const secili = (ad) => Array.from(form.querySelectorAll(`input[name="${ad}"]:checked`)).map((i) => i.value);
      const satirlar = [
        "Merhaba, web siteniz üzerinden ön görüşme / randevu talebinde bulunmak istiyorum.",
        "",
        "Ad Soyad: " + f["ad"].value.trim(),
        "Telefon: " + f["telefon"].value.trim(),
      ];
      if (f["eposta"].value.trim()) satirlar.push("E-posta: " + f["eposta"].value.trim());
      const donus = secili("donus");
      if (donus.length) satirlar.push("Size nasıl dönüş yapılsın: " + donus.join(", "));
      const zaman = secili("zaman");
      if (zaman.length) satirlar.push("Uygun zamanlar: " + zaman.join(", "));
      if (f["not"].value.trim()) satirlar.push("", "Not: " + f["not"].value.trim());
      return satirlar.join("\n");
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // Hangi düğmeye basıldı? (Enter ile gönderimde varsayılan: WhatsApp)
      const secilenKanal = (e.submitter && e.submitter.getAttribute("data-gonder")) || "whatsapp";
      if (!dogrula()) {
        durum.innerHTML = "";
        return;
      }
      const metin = mesajOlustur();
      if (secilenKanal === "eposta") {
        const link = "mailto:" + AYARLAR.eposta +
          "?subject=" + encodeURIComponent(AYARLAR.epostaKonu) +
          "&body=" + encodeURIComponent(metin);
        window.location.href = link;
        durum.innerHTML = '<div class="bilgi-kutusu" role="status"><span aria-hidden="true">✓</span><p>E-posta uygulamanız hazır bir mesajla açıldı. <strong>Göndermeyi unutmayın.</strong> Açılmadıysa bize doğrudan <a href="mailto:' + AYARLAR.eposta + '">' + AYARLAR.eposta + "</a> adresinden yazabilirsiniz.</p></div>";
      } else {
        const link = "https://wa.me/" + AYARLAR.whatsapp + "?text=" + encodeURIComponent(metin);
        const pencere = window.open(link, "_blank", "noopener");
        if (!pencere) window.location.href = link;
        durum.innerHTML = '<div class="bilgi-kutusu" role="status"><span aria-hidden="true">✓</span><p>WhatsApp hazır bir mesajla açıldı. <strong>Mesajı göndermeyi unutmayın.</strong> En kısa sürede size dönüş yapılacaktır.</p></div>';
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
      sayacYazi.textContent = bitti ? "Nasıl hissediyorsunuz?" : "Yaklaşık 1 dakika";
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

  /* 8. Alt bilgideki yıl ------------------------------------------------ */
  d.querySelectorAll("[data-yil]").forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
