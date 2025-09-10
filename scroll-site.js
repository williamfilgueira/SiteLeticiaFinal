(function () {
  // Marca que JS está ativo (para o CSS condicional)
  document.documentElement.classList.add('has-js');

  const DURATION = 1000; // ← ajuste a velocidade (ms)
  const header = document.querySelector('.site-header');
  const HEADER_OFFSET = header ? header.offsetHeight + 8 : 0;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hero  = document.getElementById('inicio');
  const after = document.getElementById('after-hero');
  const btn   = document.querySelector('.scroll-down');

  // Easing suave
  const ease = t => (t < 0.5) ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2;

  function smoothScrollTo(yTarget, duration) {
    const yStart = window.pageYOffset;
    const dist = yTarget - yStart;
    let startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      const t = Math.min(1, (ts - startTime) / duration);
      const y = yStart + dist * ease(t);
      window.scrollTo(0, y);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const reveal = () => after && after.classList.add('show');

  // Se abriu com hash (#contato etc.), já revela
  if (location.hash) reveal();

  // Observer para revelar quando sair do hero (se suportado)
  if (hero && after && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) reveal();
    }, { threshold: 0.85 });
    io.observe(hero);
  } else {
    // Sem suporte? Mostra tudo
    reveal();
  }

  // Fallbacks de interação: qualquer gesto revela
  window.addEventListener('wheel', reveal, { passive: true, once: true });
  window.addEventListener('touchstart', reveal, { passive: true, once: true });
  window.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) reveal();
  }, { once: true });

  // Botão da setinha
  btn?.addEventListener('click', (e) => {
    e.preventDefault();
    reveal();
    const y = Math.max(after.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET, 0);
    if (prefersReduced) window.scrollTo(0, y); else smoothScrollTo(y, DURATION);
  });

  // Âncoras do site com rolagem lenta
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]:not([href="#"])');
    if (!a) return;

    const id = a.getAttribute('href');
    const el = document.querySelector(id);
    if (!el) return;

    e.preventDefault();
    document.body.classList.remove('nav-open');

    if (after && el !== hero) reveal();

    const y = Math.max(el.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET, 0);
    if (prefersReduced) window.scrollTo(0, y); else smoothScrollTo(y, DURATION);
    history.pushState(null, '', id);
  });

  // Segurança: se nada revelou em 1.2s, revela
  setTimeout(reveal, 1200);
})();
