/* ==========================================================================
   YOUNGBLOOD RECORDING STUDIO — shared front-end logic
   Vanilla JS, no dependencies. Runs on every page (see <script defer> tag).
   ========================================================================== */
(() => {
  'use strict';

  /* ---------------------------------------------------------------------
     0. Small helpers
  --------------------------------------------------------------------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const lerp = (a, b, n) => a + (b - a) * n;

  const TILE_PAIRS = [
    ['#2c2c2c', '#0d0d0d'], ['#262019', '#0c0a08'], ['#1c2420', '#0a0c0b'],
    ['#241c24', '#0b0910'], ['#262626', '#0e0e0e'], ['#20241f', '#0a0c09'],
  ];

  /* ---------------------------------------------------------------------
     1. Icon library (inline SVG strings, reused by JS-built markup)
  --------------------------------------------------------------------- */
  const ICON = {
    crown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 8l4 3 5-7 5 7 4-3-2 10H5L3 8z"/><path d="M5 21h14" stroke-linecap="round"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    zoom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="10" cy="10" r="6.5"/><path d="M20 20l-5.2-5.2"/><path d="M10 7.5v5M7.5 10h5"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" stroke-linecap="round"/></svg>',
  };

  const silhouetteSVG = () => `<svg class="silhouette" viewBox="0 0 100 100" fill="currentColor" preserveAspectRatio="xMidYMax meet">
    <circle cx="50" cy="30" r="17"/>
    <path d="M50 50c-22 0-38 16-38 40v10h76V90c0-24-16-40-38-40z"/>
  </svg>`;

  function buildTile({ ratio = '', idx = 0, glyph = 'mic', tag = true } = {}) {
    const [a, b] = TILE_PAIRS[idx % TILE_PAIRS.length];
    return `<div class="photo-tile ${ratio}" style="--tile-a:${a};--tile-b:${b}">
      <div class="noise"></div>
      ${silhouetteSVG()}
      <div class="scan"></div>
      <div class="vignette"></div>
      ${tag ? `<div class="tag">${ICON.crown}</div>` : ''}
    </div>`;
  }
  window.YB_buildTile = buildTile;

  /* ---------------------------------------------------------------------
     2. Preloader
  --------------------------------------------------------------------- */
  const preloader = $('.preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => preloader.classList.add('hidden'), 700);
    });
    // safety net in case load already fired
    setTimeout(() => preloader.classList.add('hidden'), 3000);
  }

  /* ---------------------------------------------------------------------
     3. Custom cursor
  --------------------------------------------------------------------- */
  const dot = $('.cursor-dot');
  const ring = $('.cursor-ring');
  if (dot && ring && matchMedia('(hover:hover)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    on(document, 'mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    });
    (function raf() {
      rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(raf);
    })();
    const hoverables = 'a, button, input, textarea, select, .a-card, .artist-card, .service-card, [data-cursor-hover]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest && e.target.closest(hoverables)) ring.classList.add('active');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest && e.target.closest(hoverables)) ring.classList.remove('active');
    });
    on(document, 'mouseleave', () => { dot.classList.add('hide'); ring.classList.add('hide'); });
    on(document, 'mouseenter', () => { dot.classList.remove('hide'); ring.classList.remove('hide'); });
  }

  /* ---------------------------------------------------------------------
     4. Navbar: scroll state, active link, mobile menu
  --------------------------------------------------------------------- */
  const navbar = $('.navbar');
  const onScrollNav = () => { if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40); };
  onScrollNav();
  on(window, 'scroll', onScrollNav, { passive: true });

  const path = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-links a, .mobile-menu a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });

  const burger = $('.burger');
  const mobileMenu = $('.mobile-menu');
  on(burger, 'click', () => {
    burger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });
  $$('.mobile-menu a').forEach((a) => on(a, 'click', () => {
    burger.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }));

  /* ---------------------------------------------------------------------
     5. Scroll reveal (IntersectionObserver)
  --------------------------------------------------------------------- */
  const revealEls = $$('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          if (entry.target.classList.contains('stagger')) {
            Array.from(entry.target.children).forEach((c, i) => c.style.setProperty('--i', i));
          }
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------------------
     6. Animated counters
  --------------------------------------------------------------------- */
  $$('[data-count]').forEach((el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals'), 10) : 0;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const dur = 1400, start = performance.now();
        function tick(now) {
          const p = clamp((now - start) / dur, 0, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    io.observe(el);
  });

  /* ---------------------------------------------------------------------
     7. Parallax on hero decorative elements
  --------------------------------------------------------------------- */
  const parallaxEls = $$('[data-parallax]');
  if (parallaxEls.length && matchMedia('(hover:hover)').matches) {
    on(window, 'mousemove', (e) => {
      const px = (e.clientX / window.innerWidth - 0.5);
      const py = (e.clientY / window.innerHeight - 0.5);
      parallaxEls.forEach((el) => {
        const f = parseFloat(el.getAttribute('data-parallax')) || 20;
        el.style.transform = `translate(${px * f}px, ${py * f}px)`;
      });
    });
  }

  /* ---------------------------------------------------------------------
     8. Back to top
  --------------------------------------------------------------------- */
  const toTop = $('.to-top');
  if (toTop) {
    on(window, 'scroll', () => toTop.classList.toggle('show', window.scrollY > 700), { passive: true });
    on(toTop, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------------------------------------------------------------------
     9. Footer year
  --------------------------------------------------------------------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------------------------------------------------------------------
     10. Carousel (home artists strip)
  --------------------------------------------------------------------- */
  const track = $('.carousel-track');
  if (track) {
    const step = () => (track.querySelector('.artist-card')?.offsetWidth || 230) + 20;
    on($('[data-carousel="prev"]'), 'click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    on($('[data-carousel="next"]'), 'click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  }

  /* =======================================================================
     11. ARTIST DATA — single source of truth for carousel, grid & modal
  ======================================================================= */
  const ARTISTS = [
    { id: 'flexy', name: 'FLEXY', genres: ['hiphop'], genreLabel: 'Хип-хоп',
      bio: 'FLEXY пишет треки прямо в студии, начиная с бита и заканчивая сведением за одну ночную сессию. Фирменный хриплый флоу и уличная лирика — то, за что его знают.',
      stats: [['24', 'Трека'], ['3', 'Года в YB'], ['120K', 'Слушателей']],
      tracks: [['Ночная смена', '2:41'], ['Без фильтров', '3:02'], ['Свои правила', '2:18']] },
    { id: 'mayot', name: 'MAYOT', genres: ['hiphop'], genreLabel: 'Хип-хоп',
      bio: 'Один из первых артистов YOUNGBLOOD. Собрал вокруг себя сцену молодых МС и продолжает писать треки о районе, в котором вырос.',
      stats: [['31', 'Трек'], ['4', 'Года в YB'], ['210K', 'Слушателей']],
      tracks: [['Район', '2:55'], ['Тихий час', '3:14'], ['Мой город', '2:47']] },
    { id: 'yungway', name: 'YUNGWAY', genres: ['rap'], genreLabel: 'Рэп / Мелодик',
      bio: 'Мелодичный рэп на стыке R&B и трэпа. YUNGWAY записывает вокал слоями прямо в студии, добиваясь плотного, «дорогого» звучания.',
      stats: [['18', 'Треков'], ['2', 'Года в YB'], ['95K', 'Слушателей']],
      tracks: [['На волне', '2:33'], ['Дым', '3:07'], ['Как раньше', '2:59']] },
    { id: 'lilmorty', name: 'LIL MORTY', genres: ['hiphop'], genreLabel: 'Хип-хоп',
      bio: 'Плотный флоу и агрессивная подача. LIL MORTY работает в студии над каждой деталью аранжировки, чтобы бит бил точно в такт словам.',
      stats: [['27', 'Треков'], ['3', 'Года в YB'], ['180K', 'Слушателей']],
      tracks: [['Корона', '2:22'], ['Без страха', '2:51'], ['Улицы помнят', '3:10']] },
    { id: '4nway', name: '4N WAY', genres: ['rap'], genreLabel: 'Рэп / Дрилл',
      bio: 'Дрилловые бочки, холодный бас и жёсткие панчлайны. 4N WAY — новое поколение сцены, для которого студия YOUNGBLOOD стала вторым домом.',
      stats: [['15', 'Треков'], ['1', 'Год в YB'], ['64K', 'Слушателей']],
      tracks: [['Морозы', '2:19'], ['Тени', '2:44'], ['Ва-банк', '2:36']] },
    { id: 'seemee', name: 'SEEMEE', genres: ['rap'], genreLabel: 'Рэп',
      bio: 'Спокойная подача, острая лирика. SEEMEE предпочитает живые сессии — весь альбом был записан за пять вечеров в YOUNGBLOOD.',
      stats: [['12', 'Треков'], ['1', 'Год в YB'], ['41K', 'Слушателей']],
      tracks: [['Между строк', '3:21'], ['Вес слов', '2:58'], ['Тишина', '2:40']] },
    { id: 'gonefludd', name: 'GONE.FLUDD', genres: ['rnb', 'pop'], genreLabel: 'R&B / Поп',
      bio: 'Экспериментирует на стыке R&B и поп-музыки. В YOUNGBLOOD сводит треки с акцентом на объёмный, «стадионный» вокал.',
      stats: [['22', 'Трека'], ['2', 'Года в YB'], ['300K', 'Слушателей']],
      tracks: [['Соло', '3:05'], ['Без границ', '2:49'], ['Высота', '3:33']] },
    { id: 'lovv66', name: 'LOVV66', genres: ['experimental'], genreLabel: 'Альтернатив',
      bio: 'Ломает границы жанра — от альтернативного рока до экспериментального рэпа. Один из самых непредсказуемых артистов лейбла.',
      stats: [['19', 'Треков'], ['2', 'Года в YB'], ['150K', 'Слушателей']],
      tracks: [['Осколки', '2:52'], ['Не моя вина', '3:16'], ['Вне системы', '2:28']] },
  ];
  window.YB_ARTISTS = ARTISTS;

  /* Render home carousel */
  const carouselTrack = $('[data-render="carousel"]');
  if (carouselTrack) {
    const order = ['flexy', 'mayot', 'yungway', 'lilmorty', '4nway'];
    carouselTrack.innerHTML = order.map((id, i) => {
      const a = ARTISTS.find((x) => x.id === id);
      return `<article class="artist-card" data-artist="${a.id}" tabindex="0">
        ${buildTile({ idx: i })}
        <h4>${a.name}</h4>
        <p class="genre">${a.genreLabel}</p>
      </article>`;
    }).join('');
  }

  /* Render artists grid page */
  const artistsGrid = $('[data-render="grid"]');
  if (artistsGrid) {
    artistsGrid.innerHTML = ARTISTS.map((a, i) => `
      <article class="a-card reveal" data-artist="${a.id}" data-genres="${a.genres.join(',')}" data-name="${a.name.toLowerCase()}" tabindex="0">
        ${buildTile({ idx: i, tag: false })}
        <div class="meta">
          <div>
            <h4>${a.name}</h4>
            <p class="genre">${a.genreLabel}</p>
          </div>
          <span class="arrow">${ICON.arrow}</span>
        </div>
      </article>`).join('');
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('in'); io2.unobserve(entry.target); } });
    }, { threshold: 0.1 });
    $$('.a-card', artistsGrid).forEach((el) => io2.observe(el));
  }

  /* Filters + search (artists.html) */
  const filterBar = $('.filter-tabs');
  const searchInput = $('.search-box input');
  const loadMoreBtn = $('[data-load-more]');
  const PAGE_SIZE = 6;
  let visibleCount = PAGE_SIZE;

  function applyFilters() {
    if (!artistsGrid) return;
    const activeBtn = $('.filter-tabs button.active');
    const genre = activeBtn ? activeBtn.getAttribute('data-genre') : 'all';
    const q = (searchInput?.value || '').trim().toLowerCase();
    const cards = $$('.a-card', artistsGrid);
    let shown = 0;
    cards.forEach((card) => {
      const genres = card.getAttribute('data-genres').split(',');
      const matchesGenre = genre === 'all' || genres.includes(genre);
      const matchesQuery = !q || card.getAttribute('data-name').includes(q);
      const withinLimit = shown < visibleCount;
      const show = matchesGenre && matchesQuery && withinLimit;
      if (matchesGenre && matchesQuery) shown++;
      card.hidden = !show;
    });
    const totalMatching = cards.filter((c) => {
      const genres = c.getAttribute('data-genres').split(',');
      return (genre === 'all' || genres.includes(genre)) && (!q || c.getAttribute('data-name').includes(q));
    }).length;
    if (loadMoreBtn) loadMoreBtn.style.display = totalMatching > visibleCount ? 'inline-flex' : 'none';
  }
  if (filterBar) {
    $$('button', filterBar).forEach((btn) => on(btn, 'click', () => {
      $$('button', filterBar).forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      visibleCount = PAGE_SIZE;
      applyFilters();
    }));
  }
  on(searchInput, 'input', () => { visibleCount = PAGE_SIZE; applyFilters(); });
  on(loadMoreBtn, 'click', () => { visibleCount += PAGE_SIZE; applyFilters(); });
  if (artistsGrid) applyFilters();

  /* ---------------------------------------------------------------------
     12. Artist modal (+ tiny procedural "beat" preview via Web Audio API)
  --------------------------------------------------------------------- */
  const modalOverlay = $('#artistModal');
  let audioCtx = null;
  let beatTimer = null;
  let playingRow = null;

  function stopBeat() {
    if (beatTimer) { clearInterval(beatTimer); beatTimer = null; }
    if (playingRow) { playingRow.classList.remove('playing'); playingRow.querySelector('.play-btn').innerHTML = ICON.play; }
    playingRow = null;
  }

  function playBeat(row) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    let step = 0;
    const stepTime = 130; // ms — ~115bpm 16th notes
    function kick() {
      const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
      o.frequency.setValueAtTime(120, audioCtx.currentTime);
      o.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.15);
      g.gain.setValueAtTime(0.9, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
      o.connect(g).connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + 0.2);
    }
    function hat() {
      const bufSize = audioCtx.sampleRate * 0.05;
      const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
      const src = audioCtx.createBufferSource(); src.buffer = buf;
      const hp = audioCtx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
      const g = audioCtx.createGain(); g.gain.value = 0.18;
      src.connect(hp).connect(g).connect(audioCtx.destination);
      src.start();
    }
    beatTimer = setInterval(() => {
      if (step % 4 === 0) kick();
      if (step % 2 === 1) hat();
      step = (step + 1) % 16;
    }, stepTime);
  }

  function openModal(id) {
    const a = ARTISTS.find((x) => x.id === id);
    if (!a || !modalOverlay) return;
    $('.modal-media', modalOverlay).innerHTML = buildTile({ idx: ARTISTS.indexOf(a), tag: false });
    $('.genre-tag', modalOverlay).textContent = a.genreLabel;
    $('.modal-name', modalOverlay).textContent = a.name;
    $('.bio', modalOverlay).textContent = a.bio;
    $('.modal-stats', modalOverlay).innerHTML = a.stats.map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join('');
    $('.modal-tracks', modalOverlay).innerHTML = a.tracks.map(([title, len], i) => `
      <div class="track-row" data-track="${i}">
        <button class="play-btn" aria-label="Слушать демо-бит">${ICON.play}</button>
        <div class="wave">${Array.from({ length: 28 }).map((_, j) => `<span style="height:${8 + Math.round(14 * Math.abs(Math.sin(j * (i + 2))))}px"></span>`).join('')}</div>
        <span>${title}</span>
        <span class="len" style="margin-left:auto">${len}</span>
      </div>`).join('');
    stopBeat();
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    stopBeat();
  }
  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-artist]');
    if (card) openModal(card.getAttribute('data-artist'));
    const trackRow = e.target.closest('.track-row .play-btn');
    if (trackRow) {
      const row = trackRow.closest('.track-row');
      if (playingRow === row) { stopBeat(); }
      else { stopBeat(); playingRow = row; row.classList.add('playing'); trackRow.innerHTML = ICON.pause; playBeat(row); }
    }
    if (e.target.closest('[data-modal-close]') || e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.closest('[data-artist]')) openModal(e.target.closest('[data-artist]').getAttribute('data-artist')); });
  on(document, 'keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* ---------------------------------------------------------------------
     13. Studio gallery lightbox (location.html)
  --------------------------------------------------------------------- */
  const galleryTiles = $('[data-render="gallery"]');
  if (galleryTiles) {
    galleryTiles.innerHTML = [0, 1, 2].map((i) => `
      <div class="photo-tile wide rip-frame" data-gallery-item="${i}" tabindex="0">
        <div class="noise"></div>${silhouetteSVG()}<div class="scan"></div><div class="vignette"></div>
        <div class="zoom-hint">${ICON.zoom}</div>
      </div>`).join('');
  }
  const lightbox = $('#lightbox');
  if (lightbox) {
    document.addEventListener('click', (e) => {
      const item = e.target.closest('[data-gallery-item]');
      if (item) {
        const i = parseInt(item.getAttribute('data-gallery-item'), 10);
        $('.lightbox-inner', lightbox).innerHTML = buildTile({ idx: i, ratio: 'wide', tag: false });
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
      if (e.target.closest('[data-lightbox-close]') || e.target === lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = modalOverlay?.classList.contains('active') ? 'hidden' : '';
      }
    });
    on(document, 'keydown', (e) => { if (e.key === 'Escape') { lightbox.classList.remove('active'); document.body.style.overflow = ''; } });
  }

  /* ---------------------------------------------------------------------
     14. Booking form
  --------------------------------------------------------------------- */
  const form = $('#bookingForm');
  if (form) {
    const message = $('#message');
    const charCount = $('.char-count', form);
    if (message && charCount) {
      const updateCount = () => { charCount.textContent = `${message.value.length}/500`; };
      on(message, 'input', updateCount); updateCount();
    }
    const dateInput = $('#date');
    if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

    on(form, 'submit', (e) => {
      e.preventDefault();
      let valid = true;
      $$('[required]', form).forEach((field) => {
        const wrap = field.closest('.field');
        const isValid = field.type === 'checkbox' ? field.checked : field.value.trim() !== '';
        wrap.classList.toggle('error', !isValid);
        if (!isValid) valid = false;
      });
      const phone = $('#phone');
      if (phone && phone.value.trim()) {
        const digits = phone.value.replace(/\D/g, '');
        const ok = digits.length >= 10;
        phone.closest('.field').classList.toggle('error', !ok);
        if (!ok) valid = false;
      }
      const email = $('#email');
      if (email && email.value.trim()) {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
        email.closest('.field').classList.toggle('error', !ok);
        if (!ok) valid = false;
      }
      if (!valid) {
        const firstError = $('.field.error', form);
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      form.style.display = 'none';
      $('.form-success', form.parentElement).classList.add('active');
    });

    $$('input, textarea, select', form).forEach((f) => on(f, 'input', () => f.closest('.field')?.classList.remove('error')));
  }

  /* ---------------------------------------------------------------------
     15. Marquee — duplicate content once for seamless loop
  --------------------------------------------------------------------- */
  $$('.marquee-track').forEach((m) => { m.innerHTML += m.innerHTML; });

})();
