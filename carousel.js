(function () {
  const carousels = document.querySelectorAll(".t-carousel");
  carousels.forEach(initCarousel);

  function initCarousel(root) {
    const viewport = root.querySelector(".t-viewport");      // <- scroll container
    const track = root.querySelector(".t-track");
    const slides = Array.from(root.querySelectorAll(".t-slide"));
    const prev = root.querySelector(".t-nav.prev");
    const next = root.querySelector(".t-nav.next");
    const dotsWrap = root.querySelector(".t-dots");
    const interval = Number(root.dataset.interval || 5000);

    // guarda: se não tiver viewport/track, sai
    if (!viewport || !track || slides.length === 0) return;

    // cria dots (com guarda)
    if (dotsWrap) {
      slides.forEach((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-label", `Ir ao slide ${i + 1}`);
        b.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(b);
      });
    }

    let index = 0,
      timer = null,
      visible = true;

    function updateDots() {
      if (!dotsWrap) return;
      dotsWrap.querySelectorAll("button").forEach((b, i) => {
        b.setAttribute("aria-selected", i === index ? "true" : "false");
      });
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      const target = slides[index];

      // centraliza o slide no viewport
      const offset =
        target.offsetLeft - (viewport.clientWidth - target.clientWidth) / 2;

      viewport.scrollTo({ left: offset, behavior: "smooth" });
      updateDots();
    }

    function nextSlide() {
      goTo(index + 1);
    }
    function prevSlide() {
      goTo(index - 1);
    }

    next?.addEventListener("click", nextSlide);
    prev?.addEventListener("click", prevSlide);

    // autoplay com “guardas”
    const prefersReduce = window
      .matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    function start() {
      if (prefersReduce || !visible || timer) return;
      timer = setInterval(nextSlide, interval);
    }
    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    // pausa em interação do usuário
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("touchstart", stop, { passive: true });
    root.addEventListener("pointerdown", stop);
    viewport.addEventListener("wheel", stop, { passive: true });

    // só roda autoplay quando visível
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        visible ? start() : stop();
      },
      { threshold: 0.5 }
    );
    io.observe(root);

    // atualiza índice quando o usuário desliza manualmente
    let ticking = false;
    viewport.addEventListener("scroll", () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const vpRect = viewport.getBoundingClientRect();
        const centerX = vpRect.left + vpRect.width / 2;
        let best = 0,
          bestDist = Infinity;
        slides.forEach((sl, i) => {
          const r = sl.getBoundingClientRect();
          const dist = Math.abs(r.left + r.width / 2 - centerX);
          if (dist < bestDist) {
            bestDist = dist;
            best = i;
          }
        });
        index = best;
        updateDots();
        ticking = false;
      });
      ticking = true;
    });

    // acessibilidade via teclado (setas)
    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      }
    });

    updateDots();
    start();
  }
})();
