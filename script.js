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

  const maxScrollBlur = 8; // px
  function onScroll() {
    const y = window.scrollY || 0;
    const blur = Math.min(maxScrollBlur, y / 120);
    root.style.setProperty('--scroll-blur', blur.toFixed(2) + 'px');
    const sheen = Math.min(0.8, 0.15 + (y / 1200));
    root.style.setProperty('--sheen-opacity', sheen.toFixed(2));
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

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
})();