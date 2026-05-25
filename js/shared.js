/* ============================================================
   shared.js — Rachel Chong Xin Jie Architecture Portfolio
   1. Custom cursor (dot + lagging ring, scale on hover)
   2. Scroll reveal observer (adds & removes .visible on enter/exit)
   3. Skill bar observer
   4. Nav shrink / frosted glass on scroll
   5. Floating particles (28 dots, green + amber)
   6. Binary rain canvas (Matrix 0/1, 24fps)
   7. Lightbox handler
   ============================================================ */

(function () {
  'use strict';

  /* ---- 1. CUSTOM CURSOR ---- */
  const cur  = document.createElement('div');
  const ring = document.createElement('div');
  cur.className  = 'cursor';
  ring.className = 'cursor-ring';
  document.body.appendChild(cur);
  document.body.appendChild(ring);

  let mX = 0, mY = 0, rX = 0, rY = 0;

  document.addEventListener('mousemove', e => {
    mX = e.clientX;
    mY = e.clientY;
    cur.style.left = mX + 'px';
    cur.style.top  = mY + 'px';
  });

  (function lerpRing() {
    rX += (mX - rX) * 0.11;
    rY += (mY - rY) * 0.11;
    ring.style.left = rX + 'px';
    ring.style.top  = rY + 'px';
    requestAnimationFrame(lerpRing);
  })();

  document.querySelectorAll('a, button, [role="button"], .gallery-item, .project-card, .drawing-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cur.classList.add('hover');  ring.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cur.classList.remove('hover'); ring.classList.remove('hover'); });
  });

  /* ---- 2. SCROLL REVEAL OBSERVER ---- */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      } else {
        e.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObs.observe(el));

  /* ---- 3. SKILL BAR OBSERVER ---- */
  const skillSection = document.querySelector('.skills-cols');
  if (skillSection) {
    const skillObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.skill-fill').forEach(f => f.classList.add('animated'));
          skillObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });
    skillObs.observe(skillSection);
  }

  /* ---- 4. NAV SHRINK ---- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }

  /* ---- 5. FLOATING PARTICLES ---- */
  const pCanvas = document.getElementById('particles-canvas');
  if (pCanvas) {
    const pCtx    = pCanvas.getContext('2d');
    const colors  = ['#4a7c59', '#8b6914', '#7a8c6e', '#c8d5b9', '#4a7c59', '#4a7c59'];
    const TOTAL   = 28;
    const dots    = [];

    const resize = () => {
      pCanvas.width  = window.innerWidth;
      pCanvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    for (let i = 0; i < TOTAL; i++) {
      dots.push({
        x:     Math.random() * window.innerWidth,
        y:     Math.random() * window.innerHeight,
        r:     Math.random() * 2.2 + 0.8,
        vx:    (Math.random() - 0.5) * 0.18,
        vy:    -(Math.random() * 0.45 + 0.15),
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.45 + 0.12,
      });
    }

    (function draw() {
      pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
      dots.forEach(d => {
        pCtx.save();
        pCtx.globalAlpha = d.alpha;
        pCtx.fillStyle   = d.color;
        pCtx.beginPath();
        pCtx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.restore();
        d.x += d.vx;
        d.y += d.vy;
        if (d.y < -12) { d.y = pCanvas.height + 12; d.x = Math.random() * pCanvas.width; }
        if (d.x < -12) d.x = pCanvas.width + 12;
        if (d.x > pCanvas.width + 12) d.x = -12;
      });
      requestAnimationFrame(draw);
    })();
  }

  /* ---- 6. ARCHITECTURAL PARTICLES ---- */
  /* Nodes drift slowly; nearby nodes connect with thin dissolving lines —
     like a structural truss or node diagram. */
  const archCanvas = document.getElementById('binary-canvas');
  if (archCanvas) {
    const aCtx        = archCanvas.getContext('2d');
    const isMobile    = window.innerWidth <= 768;
    const NODE_COUNT  = isMobile ? 28 : 62;
    const CONNECT_R   = isMobile ? 100 : 170;  /* max distance for a line to form */
    const nodes       = [];

    const aResize = () => {
      archCanvas.width  = window.innerWidth;
      archCanvas.height = window.innerHeight;
    };
    aResize();
    window.addEventListener('resize', aResize, { passive: true });

    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x:     Math.random() * window.innerWidth,
        y:     Math.random() * window.innerHeight,
        vx:    (Math.random() - 0.5) * 0.28,
        vy:    (Math.random() - 0.5) * 0.28,
        r:     Math.random() * 1.4 + 0.9,
        gold:  Math.random() > 0.78,   /* ~22% amber accent nodes */
      });
    }

    (function aFrame() {
      requestAnimationFrame(aFrame);
      aCtx.clearRect(0, 0, archCanvas.width, archCanvas.height);

      /* ── connections ── */
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx   = nodes[i].x - nodes[j].x;
          const dy   = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_R) {
            /* alpha fades to zero at the connection threshold */
            const a = (1 - dist / CONNECT_R) * 0.38;
            aCtx.strokeStyle = `rgba(74,124,89,${a.toFixed(3)})`;
            aCtx.lineWidth   = 0.55;
            aCtx.beginPath();
            aCtx.moveTo(nodes[i].x, nodes[i].y);
            aCtx.lineTo(nodes[j].x, nodes[j].y);
            aCtx.stroke();
          }
        }
      }

      /* ── nodes ── */
      nodes.forEach(n => {
        aCtx.beginPath();
        aCtx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        aCtx.fillStyle = n.gold ? 'rgba(139,105,20,0.65)' : 'rgba(74,124,89,0.72)';
        aCtx.fill();

        n.x += n.vx;
        n.y += n.vy;

        /* wrap edges so nodes never leave the viewport */
        if (n.x < -12) n.x = archCanvas.width  + 12;
        if (n.x > archCanvas.width  + 12) n.x = -12;
        if (n.y < -12) n.y = archCanvas.height + 12;
        if (n.y > archCanvas.height + 12) n.y = -12;
      });
    })();
  }

  /* ---- 7. LIGHTBOX ---- */
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lbImg = lightbox.querySelector('.lightbox-img');

    document.querySelectorAll('.gallery-item img').forEach(img => {
      img.style.cursor = 'none';
      img.addEventListener('click', () => {
        lbImg.src = img.src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLb = () => {
      lightbox.classList.remove('active');
      lbImg.src = '';
      document.body.style.overflow = '';
    };

    lightbox.addEventListener('click', e => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-close')) closeLb();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
  }

  /* ---- 8. HAMBURGER MOBILE NAV ---- */
  (function () {
    var navInner = document.querySelector('.nav-inner');
    var navLinks = document.querySelector('.nav-links');
    if (!navInner || !navLinks) return;

    /* burger button */
    var burger = document.createElement('button');
    burger.className = 'nav-burger';
    burger.setAttribute('aria-label', 'Open navigation menu');
    burger.setAttribute('aria-expanded', 'false');
    burger.textContent = '☰';
    navInner.appendChild(burger);

    /* full-screen overlay */
    var overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    var closeBtn = document.createElement('button');
    closeBtn.className = 'nav-overlay-close';
    closeBtn.setAttribute('aria-label', 'Close navigation menu');
    closeBtn.textContent = '✕';

    var ul = document.createElement('ul');
    ul.className = 'nav-overlay-links';
    navLinks.querySelectorAll('a').forEach(function (a) {
      var li = document.createElement('li');
      var clone = a.cloneNode(true);
      li.appendChild(clone);
      ul.appendChild(li);
    });

    overlay.appendChild(closeBtn);
    overlay.appendChild(ul);
    document.body.appendChild(overlay);

    function openMenu() {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      burger.setAttribute('aria-expanded', 'true');
    }
    function closeMenu() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      burger.setAttribute('aria-expanded', 'false');
    }

    burger.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    ul.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) closeMenu();
    });
  })();

})();
