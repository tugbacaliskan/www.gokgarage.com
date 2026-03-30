/* ============================================================
   GÖK GARAGE OTO GALERİ — script.js  v3.1
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. NAVBAR ─────────────────────────────────────────── */
  var navbar   = document.getElementById('navbar');
  var burger   = document.getElementById('burger');
  var navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', function () {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });

  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
    });
    document.addEventListener('click', function (e) {
      if (navbar && !navbar.contains(e.target)) {
        navLinks.classList.remove('open');
        burger.classList.remove('open');
      }
    });
    navLinks.querySelectorAll('.nav-item').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        burger.classList.remove('open');
      });
    });
  }

  /* ── 2. HERO SLİDER ────────────────────────────────────── */
  var heroSwiper = null;
  var SLIDE_COUNT = document.querySelectorAll('.hero-swiper .swiper-slide').length;

  function pad2(n) { return String(n).padStart(2, '0'); }

  function updateHeroCounter() {
    var curEl = document.getElementById('hero-cur');
    var totEl = document.getElementById('hero-tot');
    if (!heroSwiper || !curEl || !totEl) return;
    curEl.textContent = pad2(heroSwiper.realIndex + 1);
    totEl.textContent = pad2(SLIDE_COUNT);
  }

  if (document.querySelector('.hero-swiper') && window.Swiper) {
    heroSwiper = new Swiper('.hero-swiper', {
      loop: true,
      speed: 900,
      effect: 'fade',
      fadeEffect: { crossFade: true },
      autoplay: { delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true },
      pagination: { el: '.hero-pagination', clickable: true },
      navigation: { prevEl: '.hero-prev', nextEl: '.hero-next' },
      keyboard: { enabled: true },
      touchStartPreventDefault: false,
      allowTouchMove: false,
      on: {
        init: function() { updateHeroCounter(); },
        realIndexChange: function() { updateHeroCounter(); },
      },
    });
  }

  /* ── 3. STATS SAYAÇLARI ────────────────────────────────── */
  var statsAnimated = false;
  var statsSection  = document.querySelector('.stats');

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function animateCount(el, target, dur) {
    var startTs = null;
    function step(ts) {
      if (!startTs) startTs = ts;
      var p = Math.min((ts - startTs) / dur, 1);
      el.textContent = Math.floor(easeOut(p) * target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  if (statsSection) {
    var statsObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !statsAnimated) {
        statsAnimated = true;
        document.querySelectorAll('.stat-num[data-target]').forEach(function (el) {
          animateCount(el, parseInt(el.dataset.target, 10), 2000);
        });
        statsObs.disconnect();
      }
    }, { threshold: 0.4 });
    statsObs.observe(statsSection);
  }

  /* ── 4. VİTRİN ─────────────────────────────────────────── */
  var VITRIN_MAX   = 6;
  var demoBanner   = document.getElementById('demo-banner');
  var statActive   = document.getElementById('stat-active');
  var grid         = document.getElementById('vitrin-grid');
  var filterBtns   = document.querySelectorAll('.vfilt');
  var allCars      = [];
  var activeFilter = 'all';

  var DEMO_CARS = [
    { id:'d1', brand:'BMW',           title:'320D M Sport',          variant:'Hatasız · Sunroof · NBT · Isıtmalı Koltuk',         price:'1.525.000 ₺', km:'—',         year:'',     transmission:'Otomatik', fuel:'Dizel',  status:'active', badge:'',     image:'https://i0.shbdn.com/photos/62/40/06/1268624006b15.jpg', url:'https://sahibinden.com/ilan/vasita-otomobil-bmw-gok-garage-bmw-320d-m-sport-hatasiz-sunroof-nbt-k.isitma-ful-plusful-1268624006/detay' },
    { id:'d2', brand:'Mercedes-Benz', title:'C200 Edition 1 AMG',    variant:'2022 · Taba İç · AMG Paket · Hatasız',              price:'3.055.000 ₺', km:'—',         year:'2022', transmission:'Otomatik', fuel:'Benzin', status:'active', badge:'',     image:'https://i0.shbdn.com/photos/90/45/44/1301904544b15.jpg', url:'https://sahibinden.com/ilan/vasita-otomobil-mercedes-benz-gok-garage-2022-mercedes-benz-c200-edition-1-amg-hatasiz-taba-1301904544/detay' },
    { id:'d3', brand:'Honda',         title:'Civic',                 variant:'1.6i-VTEC Eco Elegance · 2017 · Otomatik',          price:'1.275.000 ₺', km:'—',         year:'2017', transmission:'Otomatik', fuel:'Benzin', status:'active', badge:'',     image:'https://i0.shbdn.com/photos/91/03/34/1301910334b15.jpg', url:'https://sahibinden.com/ilan/vasita-otomobil-honda-gok-garage-honda-civic-1-6i-vtec-eco-elegance-otomatik-1301910334/detay' },
    { id:'d4', brand:'Hyundai',       title:'i30 Elite Plus',        variant:'Dizel · Otomatik · Cam Tavan · Isıtmalı Koltuk',    price:'1.335.000 ₺', km:'—',         year:'',     transmission:'Otomatik', fuel:'Dizel',  status:'active', badge:'',     image:'https://i0.shbdn.com/photos/14/86/19/1298148619b15.jpg', url:'https://sahibinden.com/ilan/vasita-otomobil-hyundai-gok-garage-hyundai-i30-elite-plus-dizel-otomatik-cam-tavan-k-isitma-1298148619/detay' },
    { id:'d5', brand:'Porsche',       title:'Panamera Diesel',       variant:'Hatasız · 60.000 KM · Yetkili Bakım · Beyaz',       price:'10.055.000 ₺',km:'60.000 KM', year:'',     transmission:'Otomatik', fuel:'Dizel',  status:'active', badge:'ÖZEL', image:'https://i0.shbdn.com/photos/03/16/99/1290031699b15.jpg', url:'https://sahibinden.com/ilan/vasita-otomobil-porsche-gok-garage-porsche-panamera-diesel-hatasiz-60binkm-yetkili-bakim-1290031699/detay' },
    { id:'d6', brand:'Ford',          title:'Tourneo Custom',        variant:'2023 · 8+1 Kişilik · Otomatik · Dizel · 450 KM',   price:'1.755.000 ₺', km:'450 KM',    year:'2023', transmission:'Otomatik', fuel:'Dizel',  status:'active', badge:'YENİ', image:'https://i0.shbdn.com/photos/26/60/51/1300266051b15.jpg', url:'https://sahibinden.com/ilan/vasita-minivan-panelvan-ford-gok-garage-2023-ford-tourneo-custom-8-1-hatasiz-otomatik-450km-1300266051/detay' },
  ];

  async function loadCars() {
    try {
      var r = await fetch('cars.json', { cache: 'no-cache' });
      if (r.ok) {
        var d = await r.json();
        var list = d.cars || d;
        if (Array.isArray(list) && list.length) return list;
      }
    } catch (_) { /* silent */ }
    if (demoBanner) demoBanner.classList.add('show');
    return DEMO_CARS;
  }

  function renderGrid(cars) {
    if (!grid) return;
    if (!cars || !cars.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#888;font-size:.9rem">Gösterilecek araç bulunamadı.</div>';
      return;
    }
    var badgeCls = function(b) {
      return b === 'YENİ' ? 'car-badge--new' : b === 'SATILDI' ? 'car-badge--sold' : 'car-badge--hot';
    };
    grid.innerHTML = cars.map(function (c) {
      var sold = c.status === 'sold';
      return (
        '<article class="car-card' + (sold ? ' sold' : '') + '" onclick="window.open(\'' + esc(c.url || '#') + '\',\'_blank\')">' +
        '<div class="car-img">' +
        (c.image ? '<img src="' + esc(c.image) + '" alt="' + esc(c.brand + ' ' + c.title) + '" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=car-img-ph>🚗</div>\'">' : '<div class="car-img-ph">🚗</div>') +
        (c.badge ? '<span class="car-badge ' + badgeCls(c.badge) + '">' + esc(c.badge) + '</span>' : '') +
        '<span class="car-source">sahibinden.com</span></div>' +
        '<div class="car-body">' +
        '<p class="car-brand">' + esc(c.brand) + '</p>' +
        '<h3 class="car-name">' + esc(c.title) + '</h3>' +
        '<p class="car-variant">' + esc(c.variant || '') + '</p>' +
        '<div class="car-specs">' +
        '<div class="cs-item"><span class="cs-lbl">Yıl</span><span class="cs-val">' + esc(c.year || '—') + '</span></div>' +
        '<div class="cs-item"><span class="cs-lbl">KM</span><span class="cs-val">' + esc(c.km || '—') + '</span></div>' +
        '<div class="cs-item"><span class="cs-lbl">Vites</span><span class="cs-val">' + esc(c.transmission || '—') + '</span></div>' +
        '<div class="cs-item"><span class="cs-lbl">Yakıt</span><span class="cs-val">' + esc(c.fuel || '—') + '</span></div>' +
        '</div>' +
        '<div class="car-footer"><div>' +
        '<p class="car-price' + (sold ? ' sold' : '') + '">' + esc(c.price) + '</p>' +
        (c.credit ? '<p class="car-credit">' + esc(c.credit) + '</p>' : '') +
        '</div><span class="car-arrow"><i class="bi bi-arrow-right"></i></span></div>' +
        '</div></article>'
      );
    }).join('');
  }

  function applyFilter(tab) {
    activeFilter = tab;
    var list = allCars;
    if (tab === 'active') list = allCars.filter(function (c) { return c.status !== 'sold'; });
    if (tab === 'sold')   list = allCars.filter(function (c) { return c.status === 'sold'; });
    renderGrid(list.slice(0, VITRIN_MAX));
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });

  (async function init() {
    if (!grid) return;
    allCars = await loadCars();
    var n = allCars.filter(function (c) { return c.status !== 'sold'; }).length;
    if (statActive) { statActive.textContent = n; statActive.dataset.target = n; }
    applyFilter('all');
  })();

  /* ── 5. SSS ACCORDION ──────────────────────────────────── */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var wasOpen = item.classList.contains('active');
      document.querySelectorAll('.faq-item.active').forEach(function (i) { i.classList.remove('active'); });
      if (!wasOpen) item.classList.add('active');
    });
  });

  /* ── 6. SMOOTH SCROLL ──────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ── 7. UTILITY ────────────────────────────────────────── */
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

})();