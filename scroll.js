(function () {
  const hero = document.getElementById('inicio');
  const after = document.getElementById('after-hero');
  const btn = document.querySelector('.scroll-down');

  if (hero && after) {
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) after.classList.add('show');
    }, { threshold: 0.85 });

    io.observe(hero);

    // Fallbacks: qualquer interação já revela
    const reveal = () => after.classList.add('show');
    window.addEventListener('wheel', reveal, { passive: true, once: true });
    window.addEventListener('touchstart', reveal, { passive: true, once: true });
    window.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) reveal();
    }, { once: true });

    // Clique na setinha rola até o conteúdo
    btn?.addEventListener('click', () => {
      after.classList.add('show');
      after.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
})();
