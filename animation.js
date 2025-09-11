(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsWAAPI = 'animate' in Element.prototype;
    const supportsIO = 'IntersectionObserver' in window;

    // ---- Alvos das animações (além do .hero-inner) ----
    const TARGETS = [
      { selector: '.section-title',                          defaults: { distance: '30px', duration: 900,  delay: 0 } },
      { selector: 'article.service-card.highlight',          defaults: { distance: '40px', duration: 1100,  delay: 0 } },
      { selector: 'article.service-card',          defaults: { distance: '40px', duration: 1100,  delay: 0 } },
      { selector: 'section.cta',                             defaults: { distance: '60px', duration: 1100, delay: 0 } },
      { selector: '#localizacao.localizacao',                defaults: { distance: '60px', duration: 1100, delay: 0 } },
      { selector: '#depoimentos.depoimentos',                defaults: { distance: '60px', duration: 1100, delay: 0 } },
      { selector: '#contato.contato',                        defaults: { distance: '60px', duration: 1100, delay: 0 } },
      { selector: '.sobre-grid',                             defaults: { distance: '60px', duration: 1100, delay: 0 } }, // mantido do passo anterior
    ];

    // ---------------- Utils ----------------
    function showNow(target) {
      const els = typeof target === 'string' ? document.querySelectorAll(target) : (target instanceof NodeList ? target : [target]);
      els.forEach(el => {
        if (!el) return;
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.filter = 'none';
      });
    }

    function getCfg(el, defaults) {
      const cfg = { easing: 'cubic-bezier(.22,1,.36,1)', ...defaults };
      if (!el || !el.dataset) return cfg;
      const d = el.dataset;
      if (d.distance) cfg.distance = d.distance;                // "60vh" | "60px"
      if (d.duration) cfg.duration = parseInt(d.duration, 10);
      if (d.delay)    cfg.delay    = parseInt(d.delay, 10);
      if (d.easing)   cfg.easing   = d.easing;
      return cfg;
    }

    function prep(el, distance) {
      el.style.opacity = '0';
      el.style.transform = `translate3d(0, ${distance}, 0)`;
      el.style.filter = 'blur(1.5px)';
      el.style.willChange = 'transform, opacity, filter';
    }

    function animateFromBelow(el, { distance = '60px', duration = 1000, delay = 0, easing = 'cubic-bezier(.22,1,.36,1)' } = {}) {
      if (!el || !supportsWAAPI) return showNow(el);
      // garante estado inicial (caso carregue depois do CSS)
      prep(el, distance);
      el.animate(
        [
          { transform: `translate3d(0, ${distance}, 0)`, opacity: 0, filter: 'blur(1.5px)' },
          { transform: 'translate3d(0, 0, 0)',            opacity: 1, filter: 'blur(0)'     }
        ],
        { duration, delay, easing, fill: 'forwards' }
      );
    }

    function setupReveal(selector, baseDefaults) {
      const els = document.querySelectorAll(selector);
      if (!els.length) return;

      // Acessibilidade / compatibilidade
      if (reduce || !supportsWAAPI || !supportsIO) {
        return showNow(els);
      }

      // Estado inicial
      els.forEach(el => {
        const cfg = getCfg(el, baseDefaults);
        prep(el, cfg.distance || '60px');
      });

      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const el = entry.target;
          if (!entry.isIntersecting) {
            // se quiser repetir: data-repeat="true" no elemento
            if (el.dataset.repeat === 'true') {
              const cfg = getCfg(el, baseDefaults);
              prep(el, cfg.distance || '60px');
            }
            return;
          }

          const cfg = getCfg(el, baseDefaults);
          const stagger = parseInt(el.dataset.stagger || '0', 10); // anima filhos em sequência, se setado
          if (stagger > 0) {
            const kids = Array.from(el.children).filter(c => !(c.dataset && c.dataset.skipAnim === 'true'));
            kids.forEach((child, i) => {
              const childCfg = getCfg(child, {
                distance: child.dataset.distance || '30px',
                duration: child.dataset.duration ? parseInt(child.dataset.duration, 10) : 800,
                delay: (cfg.delay || 0) + i * stagger,
                easing: cfg.easing
              });
              animateFromBelow(child, childCfg);
            });
            el.style.opacity = '1'; // container não fica invisível
          } else {
            animateFromBelow(el, cfg);
          }

          if (el.dataset.repeat !== 'true') io.unobserve(el);
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

      els.forEach(el => io.observe(el));
    }

    // -------- Fallback total (se preferir sair já aqui) --------
    if (reduce || !supportsWAAPI) {
      showNow('.hero-inner');
      showNow(TARGETS.map(t => t.selector).join(','));
      return;
    }

    // 1) HERO: anima só na 1ª visita da sessão
    const hero = document.querySelector('.hero-inner');
    if (hero) {
      const firstVisit = !sessionStorage.getItem('heroSeen');
      if (firstVisit) {
        const cfg = getCfg(hero, { distance: '60vh', duration: 1200, delay: 150, easing: 'cubic-bezier(.22,1,.36,1)' });
        animateFromBelow(hero, cfg);
        sessionStorage.setItem('heroSeen', '1');
      } else {
        showNow(hero);
      }
    }

    TARGETS.forEach(t => setupReveal(t.selector, t.defaults));
  });
})();
