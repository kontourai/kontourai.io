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

async function handleSubscribe(request, env) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "method-not-allowed" }, 405);
  }

  if (!env.SUBSCRIBERS) {
    return json({ ok: false, error: "not-configured" }, 503);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "invalid-body" }, 400);
  }

  // Honeypot: real users leave this empty. Bots fill every field. Pretend
  // success so the bot does not learn it was filtered.
  if (payload && typeof payload.company === "string" && payload.company.trim() !== "") {
    return json({ ok: true });
  }

  const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: "invalid-email" }, 422);
  }

  const source = typeof payload?.source === "string" ? payload.source.slice(0, 64) : "site";

  // Light per-IP throttle: 5 writes / 10 min. Best-effort, KV-backed.
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const rateKey = `rate:${ip}`;
  const hits = Number((await env.SUBSCRIBERS.get(rateKey)) || "0");
  if (hits >= 5) {
    return json({ ok: false, error: "rate-limited" }, 429);
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

  return json({ ok: true });
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
      return handleSubscribe(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
