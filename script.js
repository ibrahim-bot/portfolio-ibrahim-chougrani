// Liquid Glass++ interactions
// - Theme toggle with persistence and system default
// - Smooth scroll for anchor links
// - Contact form demo feedback
// - Dynamic scroll blur & hover sheen intensity
// - Parallax tilt on cards
// - Matrix rain background (left/right tint) with visibility pause

(function () {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const year = document.getElementById('year');
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');

  if (year) year.textContent = new Date().getFullYear();

  // Theme
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') {
    root.dataset.theme = stored;
  } else {
    root.dataset.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (btn) btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
  });

  // Keep color-scheme meta in sync to help iOS form controls
  const colorMeta = document.querySelector('meta[name="color-scheme"]');
  const observer = new MutationObserver(() => {
    if (!colorMeta) return;
    if (root.dataset.theme === 'dark') colorMeta.setAttribute('content', 'dark light');
    else colorMeta.setAttribute('content', 'light dark');
  });
  observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', '#' + id);
      }
    });
  });

  // Form demo
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      if (!email || !message) {
        if (note) note.textContent = 'Merci de remplir les champs requis.';
        return;
      }
      form.reset();
      if (note) note.textContent = 'Message envoyé (démo). Je te réponds rapidement.';
      setTimeout(() => note && (note.textContent = ''), 4000);
    });
  }

  // ===== Dynamic scroll blur & sheen intensity =====
  const maxScrollBlur = 8; // px
  function onScroll() {
    const y = window.scrollY || 0;
    const blur = Math.min(maxScrollBlur, y / 120);
    root.style.setProperty('--scroll-blur', blur.toFixed(2) + 'px');
    // Increase sheen visibility slightly as user scrolls
    const sheen = Math.min(0.8, 0.15 + (y / 1200));
    root.style.setProperty('--sheen-opacity', sheen.toFixed(2));
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ===== Parallax tilt on .parallax-tilt =====
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    const tilts = Array.from(document.querySelectorAll('.parallax-tilt'));
    const strength = 10; // deg
    function handleMove(e) {
      const { innerWidth: w, innerHeight: h } = window;
      const x = (e.clientX ?? (e.touches && e.touches[0].clientX) ?? w/2);
      const y = (e.clientY ?? (e.touches && e.touches[0].clientY) ?? h/2);
      const rx = ((y / h) - 0.5) * -strength;
      const ry = ((x / w) - 0.5) * strength;
      root.style.setProperty('--tilt-rx', rx.toFixed(2) + 'deg');
      root.style.setProperty('--tilt-ry', ry.toFixed(2) + 'deg');
    }
    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });
  }

  // ===== Matrix Rain Background (left blue / right pink) =====
  (function(){
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas || prefersReduced) return;

    const ctx = canvas.getContext('2d');
    let width, height, columns, drops;
    const fontSize = 16;
    const trailFade = 0.08;
    const leftColor = 'rgba(90,200,250,0.9)';
    const rightColor = 'rgba(255,45,85,0.9)';
    const chars = 'アァカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    function resize(){
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = new Array(columns).fill(0).map(()=> Math.floor(Math.random()*height/fontSize));
      ctx.font = fontSize + 'px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    }
    resize();
    window.addEventListener('resize', resize);

    let rafId = null;
    function frame(){
      ctx.fillStyle = `rgba(0,0,0,${trailFade})`;
      ctx.fillRect(0,0,width,height);

      for (let i=0; i<columns; i++){
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillStyle = (x < width/2) ? leftColor : rightColor;
        const text = chars[Math.floor(Math.random()*chars.length)];
        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      rafId = requestAnimationFrame(frame);
    }

    function onVis(){
      if (document.hidden){ if (rafId) cancelAnimationFrame(rafId); rafId = null; }
      else if (!rafId){ frame(); }
    }
    document.addEventListener('visibilitychange', onVis);
    frame();
  })();
})();