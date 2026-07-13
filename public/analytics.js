// PostHog loader (progressive enhancement, same pattern as subscribe.js).
//
// Served as a same-origin static asset because the site's strict CSP
// (`script-src 'self' + allowlisted hosts`, no 'unsafe-inline') blocks
// PostHog's standard inline snippet. This file injects the CDN script
// (host allowlisted in public/_headers) and configures the privacy
// posture the site promises:
//   - anonymous events only (person_profiles: 'identified_only', and we
//     never call identify) — no consent banner required
//   - no cookies: localStorage persistence only
//   - session replays with every input masked (the only input on the
//     site is the subscribe email; page text is public marketing copy)
//   - respect Do Not Track, matching the umami tag
//
// Runs alongside umami during the evaluation period; the same
// data-umami-event attributes dual-fire as named PostHog events so
// funnels use the instrumentation scheme the tests already guard.
(function () {
  if (window.__kontourPosthogInit) return;
  window.__kontourPosthogInit = true;

  var script = document.currentScript;
  var KEY = script && script.getAttribute("data-posthog-key");
  var API_HOST = (script && script.getAttribute("data-posthog-host")) || "https://us.i.posthog.com";
  var ASSET_HOST = (script && script.getAttribute("data-posthog-assets")) || "https://us-assets.i.posthog.com";
  if (!KEY) return;
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;

  // Minimal official loader shape, minus eval/inline: queue calls until
  // the array.full.js bundle (allowlisted host) arrives.
  var posthog = (window.posthog = window.posthog || []);
  if (posthog.__SV) return;
  posthog._i = [];
  posthog.init = function (key, config, name) {
    function stub(target, method) {
      var parts = method.split(".");
      if (parts.length === 2) {
        target = target[parts[0]];
        method = parts[1];
      }
      target[method] = function () {
        target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
      };
    }
    var instance = posthog;
    if (typeof name !== "undefined") {
      instance = posthog[name] = [];
    } else {
      name = "posthog";
    }
    instance.people = instance.people || [];
    instance.toString = function (noStub) {
      var label = "posthog";
      if (name !== "posthog") label += "." + name;
      if (!noStub) label += " (stub)";
      return label;
    };
    instance.people.toString = function () {
      return instance.toString(1) + ".people (stub)";
    };
    var methods =
      "init capture register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset get_distinct_id get_session_id get_session_replay_url onFeatureFlags isFeatureEnabled getFeatureFlag startSessionRecording stopSessionRecording people.set people.set_once".split(
        " ",
      );
    for (var i = 0; i < methods.length; i++) stub(instance, methods[i]);
    posthog._i.push([key, config, name]);
  };
  posthog.__SV = 1;

  var el = document.createElement("script");
  el.async = true;
  el.src = ASSET_HOST + "/static/array.full.js";
  var first = document.getElementsByTagName("script")[0];
  first.parentNode.insertBefore(el, first);

  posthog.init(KEY, {
    api_host: API_HOST,
    // Current defaults preset (owner's setup wizard, docs 2026-05-30):
    // history-change pageviews, storage splitting, persistence debounce.
    defaults: "2026-05-30",
    person_profiles: "identified_only",
    persistence: "localStorage",
    autocapture: true,
    capture_pageleave: true,
    disable_surveys: true,
    respect_dnt: true,
    session_recording: {
      maskAllInputs: true,
    },
  });

  // Dual-fire the existing instrumentation: any element carrying
  // data-umami-event becomes a named PostHog event too, so funnels get
  // the exact names the rendered tests already pin.
  document.addEventListener(
    "click",
    function (event) {
      var el = event.target && event.target.closest && event.target.closest("[data-umami-event]");
      if (!el) return;
      var name = el.getAttribute("data-umami-event");
      if (!name) return;
      try {
        // sendBeacon transport: most tagged elements are links that navigate,
        // and a plain fetch is torn down with the document (observed live:
        // ERR_ABORTED on every real click-through; umami survives because
        // its beacon is unload-safe).
        window.posthog.capture(
          name,
          { source_attribute: "data-umami-event" },
          { transport: "sendBeacon" },
        );
      } catch (_) {
        /* analytics must never affect the page */
      }
    },
    { capture: true },
  );
})();
