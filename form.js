(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form.form");
    if (!form) return;

    // pega os campos por tipo (robusto p/ esse markup)
    const elNome = form.querySelector('input[type="text"]');
    const elTel = form.querySelector('input[type="tel"]');
    const elEmail = form.querySelector('input[type="email"]');
    const elPref = form.querySelector("select");
    const elMsg = form.querySelector("textarea");

    const CLINIC_PHONE = (form.dataset.whatsPhone || "").replace(/\D/g, ""); // só dígitos

    function formatPhone(raw) {
      const d = (raw || "").replace(/\D/g, "");
      if (d.length === 11)
        return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
      if (d.length === 10)
        return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
      return raw || "—";
    }

    function getPrefText(sel) {
      if (!sel) return "—";
      return sel.options[sel.selectedIndex]?.text || sel.value || "—";
    }

    function buildMessage() {
      const nome = (elNome?.value || "").trim();
      const email = (elEmail?.value || "").trim();
      const pref = getPrefText(elPref);
      const telRaw = (elTel?.value || "").trim();
      const telFmt = formatPhone(telRaw);
      const extra = (elMsg?.value || "").trim();

      const linhas = [
        `Olá, Letícia! Meu nome é ${nome || "—"}.`,
        `Quero agendar uma consulta.`,
        `Preferência de atendimento: ${pref}.`,
        `Telefone: ${telFmt}`,
        `E-mail: ${email || "—"}`,
        extra ? `Mensagem: ${extra}` : null,
        `Página: ${window.location.href}`,
      ].filter(Boolean);

      return linhas.join("\n");
    }

    function openWhatsApp(msg) {
      if (!CLINIC_PHONE) {
        console.warn("Defina data-whats-phone com o número (somente dígitos).");
        return;
      }
      const url = `https://wa.me/${CLINIC_PHONE}?text=${encodeURIComponent(
        msg
      )}`;
      window.open(url, "_blank");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // validação mínima
      if (elNome && !elNome.value.trim()) {
        elNome.focus();
        return;
      }
      if (elEmail && !elEmail.checkValidity()) {
        elEmail.reportValidity();
        return;
      }

      const msg = buildMessage();
      openWhatsApp(msg);
    });
  });
})();
