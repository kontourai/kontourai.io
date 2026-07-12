// Early-access email capture (progressive enhancement for <Subscribe />).
//
// Served as a same-origin static asset so it satisfies the site's strict
// `script-src 'self'` CSP — Astro would otherwise inline a hoisted module
// script, which the CSP (no 'unsafe-inline') blocks. Plain JS, no build step.
(function () {
  if (window.__kontourSubscribeInit) return;
  window.__kontourSubscribeInit = true;

  var MESSAGES = {
    "invalid-email": "That email doesn't look right — mind checking it?",
    "rate-limited": "Too many tries. Give it a minute and retry.",
    "not-configured": "Signup is warming up. Email hello@kontourai.io for now.",
    default: "Something went wrong. Email hello@kontourai.io instead.",
  };
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setStatus(el, state, text) {
    el.textContent = text;
    if (state) el.dataset.state = state;
    else delete el.dataset.state;
  }

  function init() {
    var forms = document.querySelectorAll("form.subscribe");
    forms.forEach(function (form) {
      var status = form.querySelector(".subscribe__status");
      var input = form.querySelector('input[name="email"]');
      var button = form.querySelector('button[type="submit"]');

      form.addEventListener("submit", async function (event) {
        event.preventDefault();

        var email = input.value.trim();
        if (!email || !EMAIL_RE.test(email)) {
          setStatus(status, "error", MESSAGES["invalid-email"]);
          input.focus();
          return;
        }

        button.disabled = true;
        setStatus(status, "", "Sending…");

        try {
          var hp = form.querySelector('input[name="company"]');
          var res = await fetch("/api/subscribe", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              email: email,
              company: (hp && hp.value) || "",
              source: form.dataset.source || "site",
            }),
          });
          var data = await res.json().catch(function () {
            return {};
          });

          if (res.ok && data.ok) {
            form.reset();
            setStatus(status, "ok", "You're on the list. We'll be in touch.");
            // The button's click event fires even when validation blocks the
            // submit, so it measures intent; this one measures completion.
            var evt = button.getAttribute("data-umami-event");
            if (evt && window.umami && typeof window.umami.track === "function") {
              window.umami.track(evt + "-success", { source: form.dataset.source || "site" });
            }
          } else {
            setStatus(status, "error", MESSAGES[data.error] || MESSAGES.default);
          }
        } catch (err) {
          setStatus(status, "error", MESSAGES.default);
        } finally {
          button.disabled = false;
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
