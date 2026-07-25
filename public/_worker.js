// Cloudflare Pages advanced-mode worker.
//
// Responsibilities:
//   1. Canonical host redirects (.com → .io, www → apex).
//   2. POST /api/subscribe — early-access email capture, stored in KV.
//   3. Everything else falls through to the static assets (env.ASSETS).
//
// The subscribe route needs a KV namespace bound as `SUBSCRIBERS`. Until that
// binding exists the route degrades to HTTP 503 instead of throwing, so the
// rest of the site keeps serving. See docs for the one-time binding setup.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

// The bundled script posts JSON; a browser with JS disabled (or blocked) posts
// the form natively as urlencoded. Both are real submissions, so both are
// accepted — and each gets the reply shape it can actually use: JSON for fetch,
// a redirect to a real page for a native form post.
async function readPayload(request) {
  const contentType = (request.headers.get("content-type") || "").toLowerCase();

  if (contentType.includes("application/json")) {
    try {
      return { payload: await request.json(), wantsJson: true };
    } catch {
      return { payload: null, wantsJson: true };
    }
  }

  try {
    const form = await request.formData();
    return { payload: Object.fromEntries(form.entries()), wantsJson: false };
  } catch {
    return { payload: null, wantsJson: false };
  }
}

function reply(url, wantsJson, body, status, redirectPath) {
  if (wantsJson) return json(body, status);
  return Response.redirect(new URL(redirectPath, url).toString(), 303);
}

async function handleSubscribe(request, env, url) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "method-not-allowed" }, 405);
  }

  const { payload, wantsJson } = await readPayload(request);

  if (!env.SUBSCRIBERS) {
    return reply(url, wantsJson, { ok: false, error: "not-configured" }, 503, "/early-access/");
  }

  if (!payload) {
    return reply(url, wantsJson, { ok: false, error: "invalid-body" }, 400, "/early-access/");
  }

  // Honeypot: real users leave this empty. Bots fill every field. Pretend
  // success so the bot does not learn it was filtered.
  if (typeof payload.subscribe_hp === "string" && payload.subscribe_hp.trim() !== "") {
    return reply(url, wantsJson, { ok: true }, 200, "/subscribed/");
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return reply(url, wantsJson, { ok: false, error: "invalid-email" }, 422, "/early-access/");
  }

  const source = typeof payload.source === "string" ? payload.source.slice(0, 64) : "site";

  // Light per-IP throttle: 5 writes / 10 min. Best-effort, KV-backed.
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const rateKey = `rate:${ip}`;
  const hits = Number((await env.SUBSCRIBERS.get(rateKey)) || "0");
  if (hits >= 5) {
    return reply(url, wantsJson, { ok: false, error: "rate-limited" }, 429, "/early-access/");
  }
  await env.SUBSCRIBERS.put(rateKey, String(hits + 1), { expirationTtl: 600 });

  await env.SUBSCRIBERS.put(
    `sub:${email}`,
    JSON.stringify({
      email,
      source,
      ts: new Date().toISOString(),
      ua: (request.headers.get("user-agent") || "").slice(0, 256),
      ref: (request.headers.get("referer") || "").slice(0, 256),
    })
  );

  return reply(url, wantsJson, { ok: true }, 200, "/subscribed/");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === "kontourai.com" || url.hostname === "www.kontourai.com") {
      url.hostname = "kontourai.io";
      return Response.redirect(url.toString(), 301);
    }

    if (url.hostname === "www.kontourai.io") {
      url.hostname = "kontourai.io";
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === "/api/subscribe") {
      return handleSubscribe(request, env, url);
    }

    return env.ASSETS.fetch(request);
  },
};
