      const toggle = document.querySelector(".nav-toggle");
      const nav = document.getElementById("nav");
      toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        document.body.classList.toggle("nav-open");
      });
      nav.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => {
          document.body.classList.remove("nav-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });