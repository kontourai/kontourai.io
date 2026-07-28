import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { validateTrustBundle } from "@kontourai/surface";

test("homepage leads with a single Flow Agents headline and the recognition-then-mechanism argument", async ({ page }) => {
  await page.goto("/");

  // AC1: exactly one hero headline story above the fold, and the slogan is the
  // first thing in it. The "Kontour · Flow Agents" kicker that used to sit above
  // the h1 is gone by owner direction — the guard stays so it does not creep
  // back, because the whole point of the hero is that the slogan leads.
  await expect(page.locator(".label-sm").filter({ hasText: "Kontour · Flow Agents" })).toHaveCount(0);
  await expect(page.locator(".hero-kicker")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { level: 1, name: "Make your agents show their work.", exact: true }),
  ).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  // Nothing renders above the headline inside the hero block.
  await expect(page.locator(".hero-inner > *").first()).toHaveClass(/hero-title/);
  await expect(page.getByText("AI writes more code than anyone can read line by line.").first()).toBeVisible();

  // Hero CTAs
  await expect(page.locator('[data-umami-event="home-hero-early-access"]')).toHaveAttribute("href", "/early-access/");
  await expect(page.locator('[data-umami-event="home-hero-flow-agents"]')).toHaveAttribute("href", "/flow-agents/");
  await expect(page.locator('[data-umami-event="home-hero-github"]')).toBeVisible();

  // The prompt-vs-gate line survives the enforcement section's deletion; it now
  // closes the mechanism section, with the runtime qualification attached so the
  // page never claims uniform blocking.
  await expect(page.getByText("a gate refuses to let the work pass until the evidence is there").first()).toBeVisible();
  await expect(page.getByText("in other runtimes it surfaces the disagreement to you instead of blocking")).toBeVisible();

  // Mechanism section: "how a gate knows" the claim from the capture, sitting
  // below the recognition moments.
  await expect(page.locator(".label-sm").filter({ hasText: "How a gate knows" }).first()).toBeVisible();
  const mechanismHeading = page.getByRole("heading", { level: 2 }).filter({ hasText: "Don't ask the agent." });
  await expect(mechanismHeading).toBeVisible();
  await expect(mechanismHeading).toContainText("Check the toothbrush.");
  await expect(page.getByText("1 · The claim")).toBeVisible();
  await expect(page.getByText("2 · The capture")).toBeVisible();
  await expect(page.getByText("3 · The recompute")).toBeVisible();

  // Proof replay: the staged runtime-catch demo plays on scroll. toBeVisible()
  // cannot distinguish opacity-0 (review finding: vacuous assertion), so the
  // proof the script ran under the external-asset CSP path is class state:
  // arming adds .is-armed, and the final beat's reveal adds .is-on.
  const replay = page.locator("[data-proof-replay]");
  await replay.scrollIntoViewIfNeeded();
  await expect(replay).toHaveClass(/is-armed/);
  await expect(replay.locator('[data-beat="4"]')).toHaveClass(/is-on/, { timeout: 10000 });
  // The replay button appears after the first play and re-runs the sequence.
  const replayBtn = replay.locator("[data-replay]");
  await expect(replayBtn).toBeVisible();
  await replayBtn.click();
  await expect(replay.locator('[data-beat="4"]')).toHaveClass(/is-on/, { timeout: 10000 });
  await expect(replay.getByText("Staged replay of the runtime catch")).toBeVisible();

  // #113: recognition moments — examples first, mechanism second.
  await expect(page.getByRole("heading", { name: "Anyone can say the tests passed." })).toBeVisible();
  // Credibility ordering: the backstop/memory case leads (believable AND implemented).
  await expect(page.getByText('"Said done — never actually ran it."')).toBeVisible();
  await expect(page.getByText('"The summary said pass; the log said fail."')).toBeVisible();
  await expect(page.getByText('"Masked the exit code."')).toBeVisible();
  await expect(page.getByText('"Edited the evidence record."')).toBeVisible();
  await expect(page.getByText('"Made the gate green under pressure."')).toBeVisible();
  await expect(page.locator(".narrator__moment")).toHaveCount(5);
  // Doctrine ordering pinned in full (marketing-hooks credibility ordering).
  await expect(page.locator(".narrator__moment .narrator__quote")).toHaveText([
    '"Said done — never actually ran it."',
    '"The summary said pass; the log said fail."',
    '"Masked the exit code."',
    '"Edited the evidence record."',
    '"Made the gate green under pressure."',
  ]);
  // Moment 1's catch is the backstop re-run. It must stay CONDITIONAL: the gate
  // re-runs the check only when the project declared it, and says so when it
  // can't. The old unconditional phrasing was the overclaim this pass removed.
  await expect(page.getByText("If the project declared that check, the gate runs it itself")).toBeVisible();
  await expect(page.getByText("the claim is marked unverified rather than accepted")).toBeVisible();
  // Moment 5 must NOT imply an unconditional CI identity (signing is opt-in;
  // scope lives on /trust) — it claims only the fresh, untouched-env re-run.
  await expect(page.locator(".narrator__moment").getByText("in an environment the agent never touched")).toBeVisible();
  // Residuals stated as gaps, never as catches — all three named, and stated
  // concretely rather than under an editorial "honest residuals" label.
  await expect(page.getByText("Three things this doesn't catch:")).toBeVisible();
  await expect(page.getByText("isn't re-invalidated when the code changes afterward")).toBeVisible();
  await expect(page.getByText("running one test file instead of the suite looks the same as running the suite")).toBeVisible();
  await expect(page.getByText("an edited test slips through the runtime gate")).toBeVisible();
  await expect(page.locator('[data-umami-event="home-narrator-trust"]')).toHaveAttribute("href", "/trust/");
  // Examples-first placement: the recognition block renders above the mechanism.
  const narratorBox = await page.getByRole("heading", { name: "Anyone can say the tests passed." }).boundingBox();
  const toothbrushBox = await page.getByRole("heading", { name: "Don't ask the agent. Check the toothbrush." }).boundingBox();
  expect(narratorBox).not.toBeNull();
  expect(toothbrushBox).not.toBeNull();
  expect(narratorBox.y).toBeLessThan(toothbrushBox.y);
  await expect(page.locator('[data-umami-event="home-mechanism-receipts"]')).toHaveAttribute("href", "/receipts/");

  // Survey is now described where it earns it — in the generalisation section —
  // and only for what it actually owns: the record chain behind a value.
  // Scoped to the body: the header's Products menu also contains "Survey", and
  // a collapsed <details> item is hidden, so an unscoped .first() resolves to
  // the wrong node now that every page carries the full header.
  await expect(
    page.locator("body > :not(header)").getByText("Survey", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByText("an extracted value stays tied to the page it came from")).toBeVisible();
  await expect(page.locator('[data-umami-event="home-proof-survey"]')).toHaveAttribute("href", "/survey/");
  await expect(page.locator('[data-umami-event="home-beyond-writing"]')).toHaveAttribute(
    "href",
    "/writing/llm-proposes-structure-verifies/",
  );
  // The deleted overclaim: Survey does not run pipelines, and no public artifact
  // backed the "real pipelines run on it today" framing either.
  await expect(page.getByText("Survey runs real pipelines")).toHaveCount(0);
  // The IA lie: a link labeled "See the Builder Kit loop" that pointed at
  // /flow-agents/. Deleted rather than relabeled.
  await expect(page.getByText("See the Builder Kit loop")).toHaveCount(0);

  // AC3: the "Six products. One job." architecture tour is NOT on the index.
  await expect(page.getByText("Six products. One job.")).toHaveCount(0);
  await expect(page.locator('[aria-label="Kontour product layer stack"]')).toHaveCount(0);
  // Old lead framing is retired.
  await expect(page.getByText("Show the work behind AI.")).toHaveCount(0);

  // Subscribe
  await expect(page.locator('[data-umami-event="home-subscribe"]')).toBeVisible();

  // AC6: the moved architecture tour stays reachable from the home teaser.
  await expect(page.locator('[data-umami-event="nav-developers"]')).toHaveAttribute("href", "/developers/");
  await expect(page.locator('[data-umami-event="home-cta-developers"]')).toHaveAttribute("href", "/developers/");
  await expect(page.locator('[data-umami-event="footer-developers"]')).toBeVisible();

  // #82: receipts are the proof story's evidence — reachable from the nav and
  // the footer even under the teaser rules (the mechanism ghost link above
  // carries the in-body path).
  await expect(page.locator('[data-umami-event="nav-receipts"]')).toHaveAttribute("href", "/receipts/");
  await expect(page.locator('[data-umami-event="footer-receipts"]')).toHaveAttribute("href", "/receipts/");

  // #109: peak-conviction fork right after the proof story — both paths.
  await expect(page.locator('[data-umami-event="home-fork-early-access"]')).toHaveAttribute("href", "/early-access/");
  await expect(page.locator('[data-umami-event="home-fork-trust"]')).toHaveAttribute("href", "/trust/");
  await expect(page.getByText("Skeptical? Good.")).toBeVisible();
  await expect(page.getByText("See how to cheat it →")).toBeVisible();
  // Placement: the mechanism argument lands before the fork, and the fork sits
  // at peak conviction — above the generalisation section, not after it.
  const mechanismBox = await page.locator(".label-sm").filter({ hasText: "How a gate knows" }).first().boundingBox();
  const forkBox = await page.getByText("Skeptical? Good.").boundingBox();
  const beyondBox = await page.locator(".label-sm").filter({ hasText: "Beyond code" }).first().boundingBox();
  expect(mechanismBox).not.toBeNull();
  expect(forkBox).not.toBeNull();
  expect(beyondBox).not.toBeNull();
  expect(mechanismBox.y).toBeLessThan(forkBox.y);
  expect(forkBox.y).toBeLessThan(beyondBox.y);
  await expect(page.locator('[data-umami-event="footer-trust"]')).toHaveAttribute("href", "/trust/");

  // The teaser rule used to strip the product menu from the header here. It
  // now applies to the page body and footer only: the header is the one piece
  // of chrome that must not change shape as you move around the site.
  await expect(page.locator('[data-umami-event="nav-products-menu"]')).toHaveCount(1);
  await expect(page.locator('[data-umami-event="nav-developers-menu"]')).toHaveCount(1);
  await expect(page.locator('[data-umami-event="nav-flow"]')).toHaveCount(1);
  await expect(page.locator('[data-umami-event="nav-hachure"]')).toHaveCount(1);
  await expect(page.locator('[data-umami-event="footer-flow"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-veritas"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-surface"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-survey"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-builder-kit"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-knowledge-kit"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-console"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-github"]')).toBeVisible();
  await expect(page.locator('[data-umami-event="footer-contact"]')).toBeVisible();
  await expect(page.locator('[data-umami-event="footer-contact"]')).toHaveAttribute("href", "/early-access/");
  await expect(page.locator("p.footer__category")).toHaveText("The receipt layer for AI work.");

  // Guard against leaked build-process / internal copy regressing back in
  await expect(page.getByText("still shaping")).toHaveCount(0);
  await expect(page.getByText("intentionally simple")).toHaveCount(0);
});

test("/preview no longer serves the old preview page", async ({ page }) => {
  // In production (Cloudflare Pages), _redirects issues a 301 to /.
  // In the local Vite preview server, the page is simply absent (404 served from 404.html).
  // Both outcomes are correct: the old preview content must not be reachable.
  await page.goto("/preview/", { waitUntil: "load" });
  const finalUrl = page.url();
  const redirectedAway = !finalUrl.includes("/preview");
  const got404 = await page.getByText("PRODUCT LINE PREVIEW").count() === 0;
  // Acceptable: redirected to home, or serving 404 without old preview content
  expect(redirectedAway || got404, `Old /preview content is still accessible at ${finalUrl}`).toBe(true);
});

test("no page ships a British spelling", async () => {
  // Kontour AI LLC is a US company and the site copy is US English. These crept
  // in across a long authoring pass -- "licence" was the one a reader noticed.
  // Scans built output so a new page is covered the moment it exists.
  const { readdirSync, readFileSync } = await import("node:fs");
  const { join } = await import("node:path");

  const BRITISH =
    /\b(licence|behaviour|colour|recognis\w*|summaris\w*|organis\w*|prioritis\w*|scrutinis\w*|normalis\w*|apologis\w*|defence|artefact|centre|labelled|modelled|whilst|amongst|learnt|fulfil)\b/i;

  const files = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith(".html")) files.push(full);
    }
  };
  walk("dist");

  expect(files.length).toBeGreaterThanOrEqual(10);
  for (const f of files) {
    const m = readFileSync(f, "utf8").match(BRITISH);
    expect(m?.[0], `${f} uses the British spelling "${m?.[0]}"`).toBeUndefined();
  }
});

test("no page ships an unfilled authoring placeholder", async () => {
  // Five `[[OWNER: …]]` tokens shipped into the built HTML during the July
  // rewrite. They were written to be "too loud to miss" — nothing actually
  // stopped them, so this does. Scans the build output directly so a new page
  // is covered the moment it exists, without being added to a list.
  const { readdirSync, readFileSync } = await import("node:fs");
  const { join } = await import("node:path");

  const htmlFiles = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".html")) htmlFiles.push(full);
    }
  };
  walk("dist");

  expect(htmlFiles.length).toBeGreaterThanOrEqual(10);
  for (const file of htmlFiles) {
    expect(readFileSync(file, "utf8"), `${file} ships an authoring placeholder`).not.toMatch(
      /\[\[OWNER|>\s*TODO\b|>\s*FIXME\b|LOREM IPSUM/i,
    );
  }
});

// Astro's `compressHTML` strips the newline between a line of prose and an
// inline element that starts the next source line, so `…on the\n<a>developers
// page</a>` ships as "on thedevelopers page". 36+ of these reached production
// across 15 routes because nothing looked at the rendered result — the built
// HTML is well-formed, the copy reads correctly in source, and no string check
// can tell a missing space from a deliberately absent one.
//
// So this measures pixels instead. For every pair of adjacent rendered runs of
// text with no whitespace between them, it asks the browser how far apart the
// two glyphs actually are. A real collapse renders at 0px. The legitimate
// no-whitespace cases separate themselves: a padded `.codechip` measures 5.6px
// and ProofReplay's `margin-right: 0.5ch` speaker labels measure 3.4px, so they
// pass without needing to be listed here — the guard tracks what the reader
// sees, not which classes happen to exist today.
const MIN_VISIBLE_GAP_PX = 1;

// Runs inside the page. Must stay self-contained (no closure over test scope).
const findCollapsedWordJoins = (minGapPx) => {
  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "SVG", "HEAD"]);

  const texts = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.data.trim()) return NodeFilter.FILTER_REJECT;
      for (let el = node.parentElement; el; el = el.parentElement) {
        if (SKIP_TAGS.has(el.tagName)) return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  for (let n = walker.nextNode(); n; n = walker.nextNode()) texts.push(n);

  const isInline = (el) => {
    const display = getComputedStyle(el).display;
    return display.startsWith("inline") || display === "contents";
  };
  const charRect = (node, index) => {
    const range = document.createRange();
    range.setStart(node, index);
    range.setEnd(node, index + 1);
    const rects = range.getClientRects();
    return rects.length ? rects[rects.length - 1] : null;
  };

  const joins = [];
  for (let i = 0; i < texts.length - 1; i += 1) {
    const before = texts[i];
    const after = texts[i + 1];

    // Source already supplies whitespace — nothing to collapse.
    if (/\s$/.test(before.data) || /^\s/.test(after.data)) continue;

    // Both runs must sit in one inline formatting context, or they are simply
    // two blocks that happen to share a line (grid cells, flex rows).
    const ancestors = new Set();
    for (let el = before.parentElement; el; el = el.parentElement) ancestors.add(el);
    let common = after.parentElement;
    while (common && !ancestors.has(common)) common = common.parentElement;
    if (!common) continue;
    let sameInlineContext = true;
    for (const start of [before.parentElement, after.parentElement]) {
      for (let el = start; el && el !== common && sameInlineContext; el = el.parentElement) {
        if (!isInline(el)) sameInlineContext = false;
      }
    }
    if (!sameInlineContext) continue;

    // Inside one code sample, `foo.bar(baz)` splits across highlight spans with
    // no space by design. Prose-to-code boundaries have their common ancestor
    // outside the code element, so they are still checked.
    let insideCodeSample = false;
    for (let el = common; el; el = el.parentElement) {
      if (el.tagName === "PRE" || el.tagName === "CODE") insideCodeSample = true;
    }
    if (insideCodeSample) continue;

    // A missing space is only visible when a word follows. Punctuation hugging
    // a word ("</code>." or "(<a>ADR 0018</a>") is correct typography — except
    // for a leading "@", which on this site always starts a scoped package name
    // and reads as a word. "suite router,@kontourai/cli" shipped past this
    // check on its first cut precisely because "@" was treated as punctuation.
    const lastChar = before.data[before.data.length - 1];
    if (!/[\p{L}\p{N}@]/u.test(after.data[0])) continue;
    if (/[(\[{<"'“‘«/\\@#$&+=~^|*·•‐-― -]/u.test(lastChar)) continue;

    const beforeRect = charRect(before, before.data.length - 1);
    const afterRect = charRect(after, 0);
    if (!beforeRect || !afterRect) continue;
    // Different visual lines: the line break supplies the separation.
    if (Math.abs(beforeRect.top - afterRect.top) > Math.max(beforeRect.height, afterRect.height) * 0.6) continue;

    const gap = afterRect.left - beforeRect.right;
    if (gap >= minGapPx) continue;
    // Guard against right-to-left or wrapped runs measuring nonsense.
    if (gap < -2) continue;

    joins.push({
      gap: Math.round(gap * 100) / 100,
      text: `${before.data.slice(-40)}[NO SPACE]${after.data.slice(0, 40)}`,
      element: after.parentElement
        ? `<${after.parentElement.tagName.toLowerCase()}${
            typeof after.parentElement.className === "string" && after.parentElement.className
              ? ` class="${after.parentElement.className}"`
              : ""
          }>`
        : "",
    });
  }
  return joins;
};

test("no rendered page fuses two words where the source expected a space", async ({ page }) => {
  test.setTimeout(180_000);

  const { readdirSync, readFileSync } = await import("node:fs");
  const { join, relative } = await import("node:path");

  const routes = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".html")) {
        // Redirect stubs resolve to their target, which is scanned on its own.
        if (/http-equiv="refresh"/i.test(readFileSync(full, "utf8"))) continue;
        routes.push(`/${relative("dist", full).replace(/index\.html$/, "")}`);
      }
    }
  };
  walk("dist");
  routes.sort();

  expect(routes.length, "expected the build output to contain routes to scan").toBeGreaterThanOrEqual(10);

  const failures = [];
  for (const route of routes) {
    await page.goto(route, { waitUntil: "load" });
    const joins = await page.evaluate(findCollapsedWordJoins, MIN_VISIBLE_GAP_PX);
    for (const join_ of joins) {
      failures.push(`${route}  ${join_.gap}px  ${join_.element}\n    …${join_.text}…`);
    }
  }

  expect(
    failures,
    `Words render with no visible gap (whitespace collapsed by compressHTML).\n` +
      `Fix each in src/ with {' '} before the inline element, or reflow the source ` +
      `so the inline element does not start the line.\n\n${failures.join("\n")}\n`,
  ).toEqual([]);
});

test("early access page gives static contact paths", async ({ page }) => {
  await page.goto("/early-access/");

  // The page no longer claims an access gate — that is its whole point, and the
  // old h1 was a verbatim duplicate of the homepage CTA heading.
  await expect(page.getByRole("heading", { name: "Nothing here is gated." })).toBeVisible();
  await expect(page.getByText("The engine is free today. The conversation is about your workflow.")).toBeVisible();
  await expect(page.getByText("No key, no waitlist, no email required.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Design partner" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Product builder" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Agent workflow team" })).toBeVisible();
  await expect(page.getByText("One concrete workflow is enough.")).toBeVisible();
  await expect(page.locator('[data-umami-event="early-access-hero-email"]')).toHaveAttribute("href", /mailto:hello@kontourai\.io/);

  // #82: receipts stay reachable even on teaser pages (it is proof, not a product).
  await expect(page.locator('[data-umami-event="nav-receipts"]')).toHaveAttribute("href", "/receipts/");
  await expect(page.locator('[data-umami-event="footer-receipts"]')).toHaveAttribute("href", "/receipts/");

  // Teaser: product links stay hidden in the footer and inline copy. The
  // header is exempt by design — it is identical on every page.
  await expect(page.locator('[data-umami-event="nav-veritas"]')).toHaveCount(1);
  await expect(page.locator('[data-umami-event="footer-surface"]')).toHaveCount(0);
  // Scoped below the header: the teaser rule governs what the page argues,
  // not the site chrome, which is now identical everywhere.
  await expect(
    page
      .locator("body > :not(header)")
      .locator('a[href="/surface/"], a[href="/survey/"], a[href="/flow/"], a[href="/flow-agents/"], a[href="/veritas/"], a[href="/console/"]')
  ).toHaveCount(0);
});

test("default social metadata includes canonical and share image", async ({ page }) => {
  await page.goto("/early-access/");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://kontourai.io/early-access/");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://kontourai.io/early-access/");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", "https://kontourai.io/og/kontour-share.png");
  await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute("content", "image/png");
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", /Kontour AI share card/);
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", "https://kontourai.io/og/kontour-share.png");
  await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute("content", /Kontour AI share card/);
});

test("pages without a custom description fall back to the receipt-layer default", async ({ page }) => {
  await page.goto("/404/");

  const defaultDescription =
    "The receipt layer for AI work. Kontour makes AI-assisted work inspectable — what was claimed, what supports it, which gates it passed, and what is still uncertain.";
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", defaultDescription);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", defaultDescription);

  // Old lead framing is retired from the default description too.
  await expect(page.locator('meta[name="description"]')).not.toHaveAttribute("content", /Show the work behind AI\./);
});

test("production analytics scripts are configured defensively", async ({ page }) => {
  await page.goto("/");

  const umami = page.locator('script[src="https://cloud.umami.is/script.js"]');
  await expect(umami).toHaveAttribute("data-website-id", "6a6ee693-2480-4bd2-a371-6af4e5f82e7d");
  await expect(umami).toHaveAttribute("data-domains", "kontourai.io,www.kontourai.io");
  await expect(umami).toHaveAttribute("data-do-not-track", "true");
  await expect(umami).toHaveAttribute("data-exclude-search", "true");
});

test("flow page explains process transparency and proof-first outcomes", async ({ page }) => {
  await page.goto("/flow/");

  // #91 F12: published packages link their npmjs page (parity with Surface/Survey/Veritas).
  await expect(page.locator('[data-umami-event="flow-hero-npm"]')).toHaveAttribute(
    "href",
    "https://www.npmjs.com/package/@kontourai/flow",
  );

  await expect(page.getByText("the agent said it was done — this is the part it skipped")).toBeVisible();

  // Order-independence framing (#209): gates judge what has arrived, not step order.
  await expect(page.getByRole("heading", { name: /The conversation can wander/ })).toBeVisible();
  await expect(page.getByText("Flow does not care what order the proof arrived in", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("A trace says what happened.")).toBeVisible();
  await expect(page.getByText("Flow says whether it was enough.")).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "What Flow answers" })).toBeVisible();
  await expect(page.getByText("What was this run supposed to do?")).toBeVisible();
  await expect(page.getByText("Why did it move on — or why did it not?")).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "Example use case" })).toBeVisible();
  await expect(page.getByText("A release path that waits for evidence.")).toBeVisible();
  await expect(page.getByText("route-back verify-gate: Test results are ready for verification. missing")).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "Fits your stack" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Give the tools you already use one visible definition of done." }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Durable workflow engines" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Agent frameworks" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Observability stacks" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Policy and security tools" })).toBeVisible();

  // Flow 3.0 runtime root: generated run state lives under .kontourai/flow, not .flow.
  await expect(page.getByText(".kontourai/flow/runs/demo/report.md")).toBeVisible();
  await expect(page.getByText(".kontourai/flow/runs/<id>/")).toBeVisible();
  await expect(page.getByText(/\.flow\/runs/)).toHaveCount(0);

  // `flow console` prints exactly three lines. Nine of the twelve lines this
  // page used to show were invented, and the test pinned one of them in place.
  // These guards keep the fabricated console transcript from coming back.
  const consoleTerminal = page.locator(".terminal").filter({ hasText: "flow console --run demo" });
  await expect(consoleTerminal.getByText("Flow Console: http://127.0.0.1:4317/")).toBeVisible();
  await expect(page.getByText("Reading: .kontourai/flow/runs/")).toHaveCount(0);
  await expect(page.getByText(/GET \/[^\s]* 200/)).toHaveCount(0);
  await expect(page.getByText("loopback only")).toHaveCount(0);

  // #164 enrichment: run lifecycle authority + kits as the distribution unit.
  await expect(page.getByRole("heading", { name: "Pausing a run is a decision, and it says who decided." })).toBeVisible();
  await expect(page.getByText("flow pause demo --request pause-request.json")).toBeVisible();
  await expect(page.getByText("flow kit validate ./release-kit")).toBeVisible();
  // The lifecycle terminal's two invented lines: a caption posing as stdout, and
  // a success line the CLI never prints.
  await expect(page.getByText("recorded: who, why, when")).toHaveCount(0);
  await expect(page.getByText("kit contract valid")).toHaveCount(0);

  // The whole fabricated scenario, not just its individual lines. Every
  // terminal here was a hand-built illustration of a run that never happened:
  // an invented run id, an invented branch, a gate expectation the packaged
  // demo does not enforce (browser-evidence-reviewed is required: false), and a
  // Veritas readiness step that appears nowhere in the demo. Captured output
  // from `flow@3.10.0` replaced all of it.
  await expect(page.getByText(/dev-1847/)).toHaveCount(0);
  await expect(page.getByText(/feature-search-filters/)).toHaveCount(0);
  await expect(page.getByText(/Veritas readiness/)).toHaveCount(0);
  await expect(page.getByText(/release-readiness-flow/)).toHaveCount(0);

  // Runtime honesty: blocking is NOT uniform, and GitHub Actions is where the
  // CI re-run happens, not an editor-runtime adapter (it was listed as one).
  await expect(page.getByText("blocking in Claude Code and Codex, advisory everywhere else")).toBeVisible();
  await expect(page.getByText(/GitHub Actions/)).toHaveCount(0);

  // Guard against the old internal "the user sees" framing
  await expect(page.getByText("The user sees a useful workflow")).toHaveCount(0);
});

test("surface page presents inspectable claims and trust vocabulary", async ({ page }) => {
  await page.goto("/surface/");

  await expect(page.getByText("make every claim show its evidence, freshness, and gaps").first()).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "What Surface answers" })).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "Example use case" })).toBeVisible();
  await expect(page.getByText("This provider directory listing is current")).toBeVisible();
  // The use case is a claim card now, not a fake CLI transcript. Its gap row is
  // a real Surface concept; the deleted `action: show uncertainty beside
  // recommendation` line advertised an unimplemented capability.
  await expect(page.getByText("The phone number attestation is private")).toBeVisible();
  await expect(page.getByText("show uncertainty beside recommendation")).toHaveCount(0);
  await expect(page.getByText(/Transparency Capabilit/i)).toHaveCount(0);

  // Trust report output
  await expect(page.getByText("Transparency gaps:")).toBeVisible();
  await expect(page.getByText("Claim groups:")).toBeVisible();

  // The vocabulary is prose now: claim / evidence / policy / gap, with the
  // gap-visibility promise stated outright.
  await expect(page.locator(".label-sm").filter({ hasText: "What's in a receipt" })).toBeVisible();
  await expect(page.getByText("Surface's job is to keep the gap as visible as the claim")).toBeVisible();
  // The nine-status grid moved to the docs; `stale` is explained inline with a
  // real badge, and the full taxonomy is one link away.
  await expect(page.locator(".trust-badge--stale").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /all nine statuses/ })).toBeVisible();

  // Fabricated console output guard: `src/console/server.ts` has exactly one
  // console.log, and `eval`/`confidence` have no referent anywhere in Surface.
  await expect(page.getByText("eval accepted")).toHaveCount(0);
  await expect(page.getByText(/confidence: high/)).toHaveCount(0);

  // Surface Console — including the multi-producer merge shipped in 2.1.0.
  await expect(page.getByText("Surface Console").first()).toBeVisible();
  await expect(page.getByText("merge multiple").first()).toBeVisible();
  await expect(page.getByText("kontour-surface-validation-examples")).toBeVisible();
  await expect(page.getByText("kontour-surface-validation-fixtures")).toHaveCount(0);

  // #164 enrichment: agent tooling, waiver validity, customer-facing surfaces,
  // and the conformance suite — all shipped capabilities the page omitted.
  await expect(page.getByRole("heading", { name: "Agent-queryable (MCP)" })).toBeVisible();
  await expect(page.getByText("npx @kontourai/surface mcp")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Waiver validity" })).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "Show it to your users" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trust Panel embed" })).toBeVisible();
  await expect(page.getByText("<surface-trust-panel>")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Snapshot viewer" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Built with Surface badge" })).toBeVisible();
  // Independence claim, scoped to what is true: the spec, schemas and test
  // vectors are published separately. Surface's own conformance suite proves
  // compatibility WITH Surface, so citing it as third-party proof was wrong.
  await expect(page.getByText("published separately from us")).toBeVisible();
  await expect(page.getByText("A conformance suite lives in the Surface repo")).toHaveCount(0);
  // The suite does not run one version of the contract — two majors of drift.
  await expect(page.getByText("one version of the contract")).toHaveCount(0);
  await expect(page.getByText("never leaves the page")).toBeVisible();

  // Products built with Surface
  await expect(page.locator(".label-sm").filter({ hasText: "Products built with Surface" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Veritas" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your product", exact: true })).toBeVisible();

  // No project-specific public-data branding leakage
  await expect(page.getByText(new RegExp(`camp${"fit"}`, "i"))).toHaveCount(0);
});

test("veritas page shows the promise, a concrete catch, and the surface handoff", async ({ page }) => {
  await page.goto("/veritas/");

  await expect(page.getByText("show whether a change is ready before it reaches review").first()).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "What Veritas makes possible" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Define what good looks like" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Guide work at the moment of change" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Earn merge readiness" })).toBeVisible();

  // Concrete use-case section
  await expect(page.locator(".label-sm").filter({ hasText: "Example use case" })).toBeVisible();
  await expect(page.getByText("The catch you'd")).toBeVisible();
  // The catch is now the real rule from the shipped nextjs-typescript template,
  // and the real WARN it produces. The old assertion pinned an invented `BLOCK`
  // line — a status the formatter cannot emit (PASS/FAIL/WARN/INFO only).
  await expect(page.getByText("api-routes-require-api-tests").first()).toBeVisible();
  await expect(page.getByText("enforcementLevel").first()).toBeVisible();
  await expect(page.getByText(/\bBLOCK\b/)).toHaveCount(0);
  await expect(page.getByText("api handler changed, test missing")).toHaveCount(0);

  // Current CLI and the Surface handoff
  await expect(page.locator(".label-sm").filter({ hasText: "Current CLI" })).toBeVisible();
  await expect(page.getByText("Veritas is built with Surface.")).toBeVisible();
  // #164 enrichment: exceptions are first-class and attributed.
  await expect(page.getByText("authority-backed decision to accept")).toBeVisible();
  await expect(page.getByText("accepted by exception").first()).toBeVisible();

  // Integrations are split by CAPABILITY, not listed as equivalents. Only the
  // Claude Code PreToolUse path blocks a write; the codex/cursor/copilot hooks
  // install as Stop hooks that exit 0 so the session can repair the findings.
  // The old flat list encoded the wrong runtime claim.
  await expect(page.getByText("veritas integrations claude-code install")).toBeVisible();
  await expect(page.getByText("veritas integrations codex install")).toBeVisible();
  await expect(page.getByText("feedback, not a block")).toBeVisible();
  await expect(page.getByText("codex, claude-code, cursor, or copilot")).toHaveCount(0);
  // Attestation copy is scoped to what ships: the authorizing block is optional,
  // records verbatim words or a prompt/response exchange — "environment" is not a field.
  await expect(page.getByText("Attestations can record how authorization was collected")).toBeVisible();
  await expect(page.getByText("the channel, the environment")).toHaveCount(0);
});

test("survey page explains the producer pipeline and surface handoff", async ({ page }) => {
  await page.goto("/survey/");

  await expect(page.getByText("review facts without losing where they came from").first()).toBeVisible();
  // Hero leads with the information-preservation story: approval becomes an inspectable record.
  await expect(page.getByText("turns approval from a disappearing click into a record").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Survey", exact: true })).toBeVisible();

  // Producer pipeline
  await expect(page.locator(".label-sm").filter({ hasText: "The producer pipeline" })).toBeVisible();
  await expect(page.getByText("Raw Source", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Source Reference").first()).toBeVisible();
  await expect(page.getByText("Extraction", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Candidate", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Review", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Claim", { exact: true }).first()).toBeVisible();
  // Review statuses named truthfully (ReviewStatus: verified | assumed | rejected | proposed).
  await expect(page.getByText("verified, assumed, rejected, or proposed").first()).toBeVisible();
  await expect(page.getByText("Needs Review")).toHaveCount(0);
  // Install hint carries the runtime dep + Surface companion, per the README quickstart.
  await expect(page.getByText("npm install @kontourai/survey @kontourai/surface").first()).toBeVisible();
  // fieldObservation example carries the claim fields required since surface-2.0.
  await expect(page.getByText("facet").first()).toBeVisible();
  await expect(page.getByText("fieldOrBehavior").first()).toBeVisible();

  // Customer outcomes and integration helpers
  await expect(page.locator(".label-sm").filter({ hasText: "What teams gain" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Everything needed to decide" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fits the review you already run" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Reviewed data stays useful" })).toBeVisible();
  // The two near-identical "contract" sections merged into one; the adapter
  // snippet lives in the integration guide the section links.
  await expect(page.locator(".label-sm").filter({ hasText: "Your server stays in charge of the write" })).toBeVisible();
  await expect(page.getByText("your server replays those events against the snapshot the reviewer actually saw")).toBeVisible();
  await expect(page.getByRole("link", { name: "Read the integration guide" })).toHaveAttribute(
    "href",
    "https://github.com/kontourai/survey/blob/main/docs/consumer-integration-guide.md",
  );
  await expect(page.getByText("fieldObservation").first()).toBeVisible();
  // The marquee example must carry `excerpt` — it is optional in the helper and
  // silently synthesizes a fake label when absent, so a reader copying a version
  // without it would get an excerpt that isn't from the document.
  await expect(page.getByText("the sentence a reviewer can click back to")).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "Example use case" })).toBeVisible();
  await expect(page.getByText("public record and needs to preserve the extraction")).toBeVisible();

  // #164 enrichment: review surfaces (MCP, standalone console, flywheel).
  await expect(page.getByRole("heading", { name: "The queue meets the reviewer where they already are." })).toBeVisible();
  await expect(page.getByText("npx survey-review-mcp")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Review Console" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Reviewed learning updates" })).toBeVisible();
  // 1.9/1.10: calibration derived from owned review outcomes.
  await expect(page.getByRole("heading", { name: "Calibrated confidence" })).toBeVisible();
  await expect(page.getByText("labeled sample")).toBeVisible();
  // The fourth review outcome is load-bearing copy: the MCP card, the section,
  // and the real run that shows the refusal without a reason.
  await expect(page.getByText("four outcomes, not two")).toBeVisible();
  await expect(page.getByText("survey_review_decide requires a non-empty reason for could-not-confirm")).toBeVisible();
  await expect(page.getByText("couldNotConfirm=1")).toBeVisible();
  // The Fieldwork/Survey split — the app vs the contracts — is stated, not implied.
  await expect(page.locator('[data-umami-event="survey-fieldwork"]')).toHaveAttribute("href", "/fieldwork/");

  // Surface handoff
  await expect(page.getByText("Survey produces.")).toBeVisible();
  await expect(page.getByText("Surface makes it inspectable.")).toBeVisible();
  await expect(page.getByText("Surface TrustBundle").first()).toBeVisible();
});

test("reference story: LLM proposes, structure verifies (#74)", async ({ page }) => {
  await page.goto("/writing/llm-proposes-structure-verifies/");

  await expect(
    page.getByRole("heading", { level: 1, name: "The AI read your tax form. Nothing checked it." }),
  ).toBeVisible();
  // The spine and the structural claim.
  await expect(page.getByText("extracted → resolved → verified")).toBeVisible();
  await expect(page.getByText("can only read verified facts.")).toBeVisible();
  // The limits are stated as content, not under an editorial meta-label.
  await expect(page.getByRole("heading", { name: "What the gate can't do" })).toBeVisible();
  await expect(page.getByText("deterministic parsers, not LLMs")).toBeVisible();
  await expect(page.getByText(/TaxHacker/i)).toHaveCount(0);
  // The accuracy ceiling sits next to the claim it qualifies: the check proves
  // the quote is in the prepared text, NOT that the number is right.
  await expect(page.getByText("It does not confirm the")).toBeVisible();
  await expect(page.getByText(/hallucination-proof/i)).toHaveCount(0);

  // Privacy boundary. This assertion is INVERTED on purpose: the essay used to
  // point at a private household repo holding real financial records, and that
  // disclosure was deliberately removed. The test must now hold the removal.
  await expect(page.getByText(/private household repo/i)).toHaveCount(0);
  await expect(page.getByText(/corrected W-2/i)).toHaveCount(0);
  await expect(page.getByText("The pipeline itself isn't open source")).toBeVisible();
  await expect(page.locator('a[href*="briananderson1222"]')).toHaveCount(0);

  // It is a worked example now: one runnable artifact, pinned, with the real
  // refusal string the package prints.
  await expect(page.getByText("excerpt not found in prepared content")).toBeVisible();
  await expect(page.getByText(/@kontourai\/traverse@0\.23\.0/).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "The same rule, somewhere else" })).toBeVisible();

  // Product links out, from the essay body rather than the nav/footer chrome.
  await expect(page.locator('.container--readable a[href="/survey/"]').first()).toBeVisible();
  await expect(page.locator('.container--readable a[href="/receipts/"]').first()).toBeVisible();

  // /writing/ resolves and lists the essay (it used to 404).
  await page.goto("/writing/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator('a[href="/writing/llm-proposes-structure-verifies/"]').first()).toBeVisible();

  // Discovery: the survey page links the story.
  await page.goto("/survey/");
  await expect(page.locator('[data-umami-event="survey-writing-story"]')).toHaveAttribute(
    "href",
    "/writing/llm-proposes-structure-verifies/",
  );
});

test("console page presents the suite operating plane and operator outcomes", async ({ page }) => {
  await page.goto("/console/");

  await expect(page.getByText("see what is live, stale, blocked, waiting, and backed by proof").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Console", exact: true })).toBeVisible();
  const consoleStatus = JSON.parse(
    await readFile(new URL("../src/data/product-status.json", import.meta.url), "utf8"),
  ).products.console;
  await expect(page.getByText(`v${consoleStatus.version}`).first()).toBeVisible();

  // Operating state + plane
  await expect(page.locator(".label-sm").filter({ hasText: "What it answers" })).toBeVisible();
  await expect(page.getByText("One screen for sessions, gates, proof, queues, and next actions.").first()).toBeVisible();

  // Nothing on this page is "illustrative" any more: both invented terminals
  // (the "suite work queue" and the "operator attention view") are deleted, and
  // every block is a real run against this site's own public repo.
  await expect(page.getByText("kontourai-kontourai-io-208").first()).toBeVisible();
  await expect(page.getByText("illustrative")).toHaveCount(0);
  await expect(page.getByText("kontour-flow-bridge").first()).toBeVisible();
  // Flow Agents is live via kontour-process-bridge in 2.8.0 — "still being wired
  // in" understated what ships.
  await expect(page.getByText("kontour-process-bridge").first()).toBeVisible();
  await expect(page.getByText("the live feeds are landing product by product").first()).toBeVisible();
  await expect(page.getByText("still being wired in")).toHaveCount(0);
  // The runtime root moved to .kontourai/console in 2.0.0; the retired .kontour root must not render.
  await expect(page.getByText(".kontourai/console").first()).toBeVisible();
  await expect(page.getByText(/"\.kontour"/)).toHaveCount(0);
  // Maturity note is truthful: hosted private production deployment exists (OIDC login etc.).
  await expect(page.getByText("console.kontourai.io").first()).toBeVisible();
  await expect(page.getByText("OIDC").first()).toBeVisible();
  await expect(page.getByText("No hosted service. No login.")).toHaveCount(0);
  // Provenance claims stay attributable: the trust panel via the Flow bridge, no ledger indexing.
  await expect(page.getByText("brings the evidence relevant to each run into Console's trust panel")).toBeVisible();
  // The two provenance overclaims. `trust.bundle` carries no commit metadata —
  // the binding is trust.checkpoint.json's commit_sha, ancestor-or-equal, not
  // the merge commit — and nothing here is un-fakeable.
  await expect(page.getByText("checkpoint file stamped with the commit it was sealed against")).toBeVisible();
  await expect(page.getByText(/Un-fakeable/i)).toHaveCount(0);
  await expect(page.getByText("pinned to the merge commit")).toHaveCount(0);

  // The duplicate "unified work queue" section (a second invented terminal) is
  // gone; the example-use-case narrative absorbed its one load-bearing line.
  await expect(page.locator(".label-sm").filter({ hasText: "Example use case" })).toBeVisible();
  await expect(page.getByText("A release operator sees what needs attention.")).toBeVisible();
  await expect(page.getByText("blocked on browser evidence nobody attached")).toBeVisible();
  await expect(page.getByText("release-browser-check missing")).toHaveCount(0);

  // #164 enrichment: the run-it-locally quickstart with real suite-CLI commands.
  await expect(page.getByRole("heading", { name: "One command. No install, no account, no cloud." })).toBeVisible();
  await expect(page.getByText("npx --package @kontourai/console kontour serve").first()).toBeVisible();
  // @kontourai/console and @kontourai/cli both claim the `kontour` bin, so
  // installing both globally is last-write-wins and can break the very next
  // command the reader types. That install path must never come back.
  await expect(page.getByText("npm install --global @kontourai/cli @kontourai/console")).toHaveCount(0);
  await expect(page.getByText("kontour console serve")).toHaveCount(0);
  // ...but the page prints `kontour` a dozen times and never said which package
  // owns that name. @kontourai/cli is published and claims the same bin, so the
  // collision is now named explicitly instead of being silently avoided.
  await expect(page.locator('[data-umami-event="console-run-cli"]')).toHaveAttribute(
    "href",
    "https://github.com/kontourai/cli",
  );
  await expect(page.getByText("there is also a separate suite router")).toBeVisible();
  await expect(page.getByText("install one of them globally rather than both")).toBeVisible();
  await expect(page.getByText("kontour-flow-bridge --flow-root .kontourai/flow --watch")).toBeVisible();
  // The registry documents API routes; some UI content is derived client-side,
  // so "everything the UI renders" was broader than the spec covers.
  await expect(page.getByText("for every endpoint the UI calls")).toBeVisible();
  await expect(page.getByText("an OpenAPI spec for everything the UI")).toHaveCount(0);
  // The integration surface is framed by what customers can build with it.
  await expect(page.getByRole("heading", { name: "Use the UI. Build on the same live API." })).toBeVisible();
  await expect(page.getByText("Build a focused operator view, automate a response")).toBeVisible();

  // Daily operating value.
  await expect(page.locator(".label-sm").filter({ hasText: "Built for daily operations" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Orient in seconds" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Understand before acting" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Start local, grow with the team" })).toBeVisible();
});

test("kit pages show real sidecar/store shapes and record dimensions", async ({ page }) => {
  // Builder Kit: sidecar state is keyed by a provider-derived work-item slug.
  // The old slug on the page was invented; this one is a real committed session
  // in this repo, so the assertion is checkable against the artifact.
  await page.goto("/builder-kit/");
  await expect(page.getByText(".kontourai/flow-agents/kontourai-kontourai-io-206/")).toBeVisible();
  await expect(page.getByText(".kontourai/flow-agents/builder.build/")).toHaveCount(0);
  await expect(page.getByText("issue-214-search-filters")).toHaveCount(0);
  // The hero defines the word before using it.
  await expect(page.getByText("A kit is a workflow your agent has to follow")).toBeVisible();
  // `kit activate <name>` never read the positional argument, so the command the
  // page used to print would have activated every installed kit.
  await expect(page.getByText("kit activate")).toHaveCount(0);
  // The engine emits no BLOCK/PASS strings like these; that whole terminal was
  // a diagram in terminal costume.
  await expect(page.getByText("BLOCK verify-work")).toHaveCount(0);
  await expect(page.getByText("PASS scoped implementation")).toHaveCount(0);

  // Knowledge Kit: the shipped record dimensions — no "Authority" field exists in the store contract.
  await page.goto("/knowledge-kit/");
  await expect(page.getByRole("heading", { name: "Record type" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Authority" })).toHaveCount(0);
  await expect(page.getByText("owner label present")).toHaveCount(0);
  await expect(page.getByText("authority required before durable promotion")).toHaveCount(0);
  // The four fabrications this pass removed. Two terminals were invented
  // wholesale: `kit activate knowledge` (the kit declares no provisions and the
  // command reads no positional), and a "knowledge gate" block whose PASS/BLOCK
  // lines have no CLI surface — the freshness and contradiction passes are
  // read-only audits. "disputed" is not a status this kit has at all.
  await expect(page.getByText("kit activate knowledge")).toHaveCount(0);
  await expect(page.getByText("public-boundary")).toHaveCount(0);
  await expect(page.getByText("freshness expired")).toHaveCount(0);
  await expect(page.getByText("disputed")).toHaveCount(0);
  await expect(page.getByText("source refs to every raw required")).toHaveCount(0);
  await expect(page.getByText("mutation log intact")).toHaveCount(0);
  // The real, code-backed properties those strings were standing in for.
  await expect(page.getByText("The mutation log is append-only")).toBeVisible();
  await expect(page.getByText("Every note points at one, and you can open it.")).toBeVisible();
  // Freshness is derived on read, never stored — the record is not rewritten.
  await expect(page.getByText("the record itself is never rewritten behind your back")).toBeVisible();
  // Store root is a constructor argument with no default path — shown as adopter-chosen.
  await expect(page.getByText("root you configure")).toBeVisible();
  // #164 enrichment: store adapters + hygiene (verified vs kits/knowledge/adapters/).
  await expect(page.getByRole("heading", { name: "The knowledge lands where you already work." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Obsidian vault" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hygiene flows" })).toBeVisible();

  // Builder capabilities strip (verified vs kits/builder/kit.json + changelog).
  // The old title pinned a "3.x line" framing on a product at 5.3.0, two of
  // whose four items shipped in 2.x.
  await page.goto("/builder-kit/");
  await expect(page.getByRole("heading", { name: "Long jobs, hard jobs, and the ones that move between tools." })).toBeVisible();
  await expect(page.getByText("builder.publish-learn")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Model routing + escalation" })).toBeVisible();
  // Retitled to drop the uniform-enforcement claim: portable STATE is the claim,
  // and the badges say where the gate can actually block.
  await expect(page.getByRole("heading", { name: "Work that moves between tools" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "One run across every client" })).toHaveCount(0);
  await expect(page.locator('[data-enforcement="blocking"]').first()).toHaveText("Blocking");
  await expect(page.locator('[data-enforcement="advisory"]').first()).toHaveText("Advisory");
  await expect(page.getByRole("heading", { name: "Long work that resumes cleanly" })).toBeVisible();
  await expect(page.getByText(".kontourai/flow-agents/knowledge/")).toHaveCount(0);
});

test("every page renders the same header", async ({ page }) => {
  // The header used to have four shapes (full, home-without-products,
  // teaser-without-developers, and unhighlighted) driven by one overloaded
  // prop. Pin the invariant: same items, same order, everywhere.
  const EXPECTED = ["nav-products-menu", "nav-developers-menu", "nav-receipts", "nav-github"];
  const PAGES = [
    "/",
    "/developers/",
    "/early-access/",
    "/subscribed/",
    "/trust/",
    "/privacy/",
    "/receipts/",
    "/writing/",
    "/surface/",
    "/404.html",
  ];
  for (const path of PAGES) {
    await page.goto(path);
    const items = await page
      .locator("header.nav [data-umami-event]")
      .evaluateAll((els) => els.map((el) => el.getAttribute("data-umami-event")));
    expect(items.filter((i) => EXPECTED.includes(i)), `header items on ${path}`).toEqual(EXPECTED);
    // Exactly one thing may claim to be the current page, and only when the
    // header actually contains an entry for it.
    const current = await page.locator('header.nav [aria-current="page"]').count();
    expect(current, `aria-current count on ${path}`).toBeLessThanOrEqual(1);
  }
});

test("a page under a menu highlights the menu without claiming to be its overview", async ({ page }) => {
  // /writing/ borrowed active="developers" to light the menu, which also made
  // the Overview item announce aria-current="page" on a page that is not it.
  await page.goto("/writing/");
  await expect(page.locator('[data-umami-event="nav-developers-menu"]')).toHaveClass(
    /nav-dropdown__summary--active/,
  );
  await expect(page.locator('[data-umami-event="nav-developers"]')).not.toHaveAttribute(
    "aria-current",
    "page",
  );
  // The real Overview page still marks itself.
  await page.goto("/developers/");
  await expect(page.locator('[data-umami-event="nav-developers"]')).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("no built page ships inline scripts or style attributes the CSP would block", async () => {
  // The production CSP is script-src 'self' + allowlisted analytics hosts —
  // no 'unsafe-inline', no hashes. Local servers and this test suite do not
  // apply _headers, so an inlined script passes every local check and then
  // dies at the edge (the territory map's terrain did exactly this). Enforce
  // the constraint statically against the build output.
  const { readdirSync, readFileSync, statSync } = await import("node:fs");
  const { join } = await import("node:path");
  const htmlFiles = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith(".html")) htmlFiles.push(p);
    }
  };
  walk("dist");
  expect(htmlFiles.length).toBeGreaterThan(10);
  const offenders = [];
  for (const file of htmlFiles) {
    const html = readFileSync(file, "utf8");
    for (const tag of html.match(/<script\b[^>]*>/g) ?? []) {
      if (!/\bsrc\s*=/.test(tag)) offenders.push(`${file}: ${tag}`);
    }
    // style-src 'self' also blocks style attributes (no 'unsafe-hashes').
    for (const tag of html.match(/<[a-z][^>]*\sstyle="[^"]*"[^>]*>/g) ?? []) {
      offenders.push(`${file}: ${tag.slice(0, 120)}`);
    }
  }
  expect(offenders).toEqual([]);
});

test("developers territory map draws the public suite with verified-edge framing", async ({ page }) => {
  await page.goto("/developers/");
  const territory = page.locator("#territory");
  await territory.scrollIntoViewIfNeeded();
  await expect(territory.getByRole("heading", { name: "One sheet, whole suite" })).toBeVisible();

  // Exact public roster: 17 markers + the cli scale bar + the kit shelf.
  await expect(territory.locator(".fm-mk")).toHaveCount(17);
  await expect(territory.locator(".fm-cli")).toHaveCount(1);
  await expect(territory.locator(".fm-kits")).toHaveCount(1);

  // The summit is Surface, labeled with the open trust format, linking to /hachure/.
  const summit = territory.locator(".fm-summit");
  await expect(summit.locator(".fm-nm")).toHaveText("surface");
  await expect(summit.locator(".fm-vb a")).toHaveAttribute("href", "/hachure/");

  // Legend carries the four edge meanings — no more, no fewer.
  await expect(territory.locator(".fm-legend > span")).toHaveCount(4);

  // The terrain script ships as an external file (CSP: no inline scripts).
  await expect(page.locator('script[src="/field-map.js"]')).toHaveCount(1);

  // Terrain canvas painted (non-zero backing store after draw).
  const painted = await territory.locator("#fm-terrain").evaluate((c) => c.width > 0 && c.height > 0);
  expect(painted).toBe(true);
});

test("developers page leads with the engine and kits, then exposes the proof chain", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/developers/");

  // The nav carries two dropdowns (Products and Developers); on this page the
  // Developers summary carries the active state and the Overview item inside is
  // the current page.
  const devSummary = page.locator(".nav-dropdown__summary--active");
  await expect(devSummary).toBeVisible();
  await expect(page.locator('[data-umami-event="nav-developers-menu"]')).toHaveClass(/nav-dropdown__summary--active/);
  await devSummary.click();
  await expect(page.locator('[data-umami-event="nav-developers"]')).toHaveAttribute("aria-current", "page");
  await devSummary.click();
  await expect(page.getByRole("heading", { name: "Kontour for developers" })).toBeVisible();

  // Single-story restructure: engine+kits lead; the six-product tour, the
  // Older duplicated architecture maps are gone; the page leads with the
  // installable engine and kits, then offers one lower proof-chain map.
  await expect(page.getByText("Six products. One job.")).toHaveCount(0);
  await expect(page.getByLabel("Kontour product relationship summary")).toHaveCount(0);
  await expect(page.getByLabel("Evidence lifecycle flow")).toHaveCount(0);
  await expect(page.getByText("Composes by:")).toHaveCount(0);

  // Hero sells the engine+kits story and routes straight to install.
  await expect(page.getByText("install the engine, add a kit, keep the receipts")).toBeVisible();
  await expect(page.locator('[data-umami-event="developers-hero-quickstart"]')).toHaveAttribute("href", "#quickstart");

  // Quickstart with REAL commands + verify-us links, pins rendered from
  // package.json so the advertised stack can't drift from CI.
  await expect(page.getByRole("heading", { name: "Install it, then check our receipts before you believe us." })).toBeVisible();
  // Enforcement is NOT uniform across the five runtimes. The old string
  // ("advisory on the rest") sat next to a list that implied Kiro blocks; the
  // site's own runtime-enforcement matrix badges Kiro advisory.
  await expect(page.getByText("are advisory out of the box (matrix on /trust)")).toBeVisible();
  // Appears twice by design: the hero install-hint badge and the quickstart terminal.
  await expect(page.getByText("npx @kontourai/flow-agents init").first()).toBeVisible();
  const devPins = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  ).devDependencies;
  await expect(page.getByText(`npx -y -p ajv@${devPins.ajv} -p hachure@${devPins.hachure}`)).toBeVisible();
  // The "two validators" claim is only honest if the page shows two. ajv is
  // hachure's own schema engine — it was previously advertised as the second
  // opinion, which it cannot be. Surface report is the genuine second one.
  await expect(page.getByText("recompute under two validators").first()).toBeVisible();
  await expect(page.getByText("ajv is hachure's schema engine,")).toBeVisible();
  await expect(page.getByText("not a second opinion")).toBeVisible();
  await expect(page.getByText(/ajv is the second,? independent opinion/)).toHaveCount(0);
  await expect(page.getByText("npx @kontourai/surface@")).toBeVisible();
  await expect(page.getByText("valid TrustBundle (schemaVersion 5)")).toBeVisible();
  // Independence scope disclosed, not implied away.
  await expect(page.getByText("implementation independence, not organizational independence")).toBeVisible();
  await expect(page.locator('[data-umami-event="developers-quickstart-receipts"]')).toHaveAttribute("href", "/receipts/");
  await expect(page.locator('[data-umami-event="developers-quickstart-trust"]')).toHaveAttribute("href", "/trust/");

  // The kits section: all four catalog kits, the two paged ones linking to
  // their own pages, quickstart above them (install first, catalog second).
  await expect(page.getByRole("heading", { name: "Four workflows ship with it. Pick one." })).toBeVisible();
  await expect(page.locator('[data-umami-event="developers-kit-builder"]')).toHaveAttribute("href", "/builder-kit/");
  await expect(page.locator('[data-umami-event="developers-kit-knowledge"]')).toHaveAttribute("href", "/knowledge-kit/");
  await expect(page.getByText("Release Evidence Kit")).toBeVisible();
  await expect(page.getByText("Veritas Governance Kit")).toBeVisible();
  // The Veritas kit is not agentless — it ships two flows AND three agent
  // skills, from a different repo than the engine.
  await expect(page.getByText("Two flows and three agent skills")).toBeVisible();
  await expect(page.getByText("Agentless, flows-only governance gates.")).toHaveCount(0);
  // The two external kit cards linked to the same generic docs homepage.
  await expect(page.locator('[data-umami-event="developers-kit-release-evidence"]')).toHaveAttribute(
    "href",
    "https://github.com/kontourai/flow-agents/tree/main/kits/release-evidence",
  );
  await expect(page.locator('[data-umami-event="developers-kit-veritas-governance"]')).toHaveAttribute(
    "href",
    "https://github.com/kontourai/veritas",
  );
  const quickstartBox = await page.getByRole("heading", { name: "Install it, then check our receipts before you believe us." }).boundingBox();
  const kitsBox = await page.getByRole("heading", { name: "Four workflows ship with it. Pick one." }).boundingBox();
  expect(quickstartBox).not.toBeNull();
  expect(kitsBox).not.toBeNull();
  expect(quickstartBox.y).toBeLessThan(kitsBox.y);

  // The one technical map: the shared ProofChain, which now labels itself by
  // what it produces rather than by internal layer names.
  const proofChain = page.getByLabel("What produces a Kontour receipt, layer by layer");
  await expect(proofChain).toBeVisible();
  await expect(proofChain.getByText("The receipt format")).toBeVisible();
  await expect(proofChain.getByText("Survey")).toBeVisible();
  await expect(page.locator('[data-umami-event="developers-map-surface"]')).toHaveAttribute("href", "/surface/");
  await expect(page.locator('[data-umami-event="developers-map-console"]')).toHaveAttribute("href", "/console/");
  // Hachure is the load-bearing open format, promoted out of the lab list.
  await expect(page.locator('[data-umami-event="developers-map-hachure-page"]')).toHaveAttribute("href", "/hachure/");

  // Preview-grade work is named as preview-grade; the aspirational roadmap grid
  // (Kubernetes-style operators, "future possibilities") is gone rather than
  // rewritten — it described nothing that exists.
  await expect(page.getByText("Two things are preview-grade and say so in their own docs")).toBeVisible();
  await expect(page.getByText("AWS Strands framework adapters")).toBeVisible();
  await expect(page.getByText("Kubernetes-style operators")).toHaveCount(0);
  await expect(page.getByText("They are not current requirements")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Future possibilities", exact: true })).toHaveCount(0);
  // Lab prose accuracy: Lookout builds on Forage's snapshots (not Traverse's),
  // and Datum's four opt-in model-calling commands are disclosed.
  await expect(page.getByText("Built on Forage's snapshots")).toBeVisible();
  await expect(page.getByText("apart from four opt-in commands")).toBeVisible();
  await expect(page.getByText("Never makes model calls")).toHaveCount(0);

  // Nav: two menus split by what the reader wants — Products holds the three
  // things you install and run (engine, app, operating view) plus the kits that
  // run on the engine; Developers holds the open format and the parts.
  const productsSummary = page.locator('[data-umami-event="nav-products-menu"]');
  await expect(productsSummary).toBeVisible();
  await expect(devSummary).toBeVisible();
  // Products is a category, not a page: the summary must not be a link.
  await expect(productsSummary).toHaveJSProperty("tagName", "SUMMARY");
  await expect(page.locator('[data-umami-event="nav-surface"]')).toBeHidden();
  await expect(page.locator('[data-umami-event="nav-builder-kit"]')).toBeHidden();
  // toBeVisible() ignores ancestor overflow clipping (learned on this PR's
  // first cut, where the panel was 100% clipped yet tests were green) — so
  // assert real hit-testability: the point at the link's center must
  // resolve to the link itself.
  const hitTest = (event) =>
    page.evaluate((name) => {
      const link = document.querySelector(`[data-umami-event="${name}"]`);
      if (!link) return false;
      const r = link.getBoundingClientRect();
      const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return !!el && (el === link || link.contains(el));
    }, event);
  await productsSummary.click();
  // The shopfront: engine, the finished app, and the operating view, each
  // carrying its own mark, with the kits filed under the engine that runs them.
  for (const event of ["nav-flow-agents", "nav-fieldwork", "nav-console", "nav-builder-kit", "nav-knowledge-kit"]) {
    expect(await hitTest(event), `${event} is not hit-testable inside the Products panel`).toBe(true);
  }
  await expect(page.locator('[data-umami-event="nav-fieldwork"]')).toHaveAttribute("href", "/fieldwork/");
  await expect(page.locator('[data-umami-event="nav-console"]')).toHaveAttribute("href", "/console/");
  await expect(page.locator('[data-umami-event="nav-flow-agents"]')).toHaveAttribute("href", "/flow-agents/");
  // The engine→kits relationship survives the regrouping in the group label.
  await expect(page.getByText("Kits that run on Flow Agents")).toBeVisible();
  // Every Products entry carries a mark, including the two new ones.
  const productsMarks = await page
    .locator('.nav-dropdown__panel [data-umami-event="nav-fieldwork"] svg, .nav-dropdown__panel [data-umami-event="nav-console"] svg, .nav-dropdown__panel [data-umami-event="nav-flow-agents"] svg')
    .count();
  expect(productsMarks).toBe(3);
  await productsSummary.click();

  await devSummary.click();
  expect(await hitTest("nav-surface")).toBe(true);
  // Hachure moved into the Developers menu with a mark of its own; the
  // Applications group is gone from here because Fieldwork is a Product now.
  expect(await hitTest("nav-hachure")).toBe(true);
  await expect(page.locator('[data-umami-event="nav-hachure"] svg')).toHaveCount(1);
  await expect(page.locator('.nav-dropdown__panel [data-umami-event="nav-fieldwork"]')).toHaveCount(1);
  await devSummary.click();
  // The row itself must not overflow its container on desktop.
  const navOverflow = await page.locator(".nav__links").evaluate((el) => el.scrollWidth - el.clientWidth);
  expect(navOverflow).toBeLessThanOrEqual(0);

  // Where-to-go-next is four doors, not ten same-weight links. Builder and
  // Knowledge are dropped here because they are carded in the kits grid above.
  await expect(page.locator('[data-umami-event="developers-next-flow-agents"]')).toHaveAttribute("href", "/flow-agents/");
  await expect(page.locator('[data-umami-event="developers-next-builder-kit"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="developers-next-knowledge-kit"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="developers-next-receipts"]')).toHaveAttribute("href", "/receipts/");
  await expect(page.locator('[data-umami-event="developers-next-trust"]')).toHaveAttribute("href", "/trust/");

  // Lab section: the exact published set, in order. The list is rendered from
  // the shared catalog and `npm run validate` proves every packageName below is
  // live on npm, so this test owns the *editorial* expectation — which
  // packages the page claims exist — and the validator owns the registry fact.
  const expectedLab = [
    ["cli", "@kontourai/cli"],
    ["datum", "@kontourai/datum"],
    ["bearing", "@kontourai/bearing"],
    ["relay", "@kontourai/relay"],
    ["dispatch", "@kontourai/dispatch"],
    ["conduit", "@kontourai/conduit"],
    ["traverse", "@kontourai/traverse"],
    ["forage", "@kontourai/forage"],
    ["lookout", "@kontourai/lookout"],
    ["plumb", "@kontourai/plumb"],
    ["ui", "@kontourai/ui"],
  ];
  const renderedLabSlugs = await page
    .locator('#lab [data-umami-event$="-repo"]')
    .evaluateAll((links) =>
      links.map((link) => link.getAttribute("data-umami-event").replace(/^developers-lab-|-repo$/g, "")),
    );
  expect(renderedLabSlugs).toEqual(expectedLab.map(([slug]) => slug));
  for (const [slug, packageName] of expectedLab) {
    await expect(page.locator(`[data-umami-event="developers-lab-${slug}-repo"]`)).toHaveAttribute(
      "href",
      `https://github.com/kontourai/${slug}`,
    );
    // The card's whole claim is that this is installable, so it has to name the
    // package and link the registry entry, not just the repository.
    await expect(page.locator(`[data-umami-event="developers-lab-${slug}-npm"]`)).toHaveAttribute(
      "href",
      `https://www.npmjs.com/package/${packageName}`,
    );
    await expect(page.locator("#lab").getByText(packageName, { exact: true })).toBeVisible();
  }
  // The two dead names the list used to carry. Neither Ephemeris nor the
  // Research Kit was ever published, so both cards invited an install that did
  // not exist — `npm run validate` now refuses an entry in that state.
  expect(renderedLabSlugs).not.toContain("ephemeris");
  expect(renderedLabSlugs).not.toContain("kit-research");
  await expect(page.getByText("Console Kit (UI)")).toHaveCount(0);
  await expect(page.getByText("Research Kit")).toHaveCount(0);
  await expect(page.getByText("Ephemeris")).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-developers"]')).toBeVisible();

  await expect(page.getByText("raw internal critique")).toHaveCount(0);
  await expect(page.getByText("production-ready Kubernetes operator")).toHaveCount(0);
  await expect(page.getByText("current Kubernetes runtime")).toHaveCount(0);
});

test("developers page keeps visual maps readable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1200 });
  await page.goto("/developers/");

  await expect(page.getByRole("heading", { name: "Kontour for developers" })).toBeVisible();
  await expect(page.getByLabel("What produces a Kontour receipt, layer by layer")).toBeVisible();
  await expect(page.locator(".ownership-map")).toHaveCSS("display", "grid");

  const viewport = page.viewportSize();
  const mapBox = await page.locator(".ownership-map").boundingBox();
  expect(viewport).not.toBeNull();
  expect(mapBox).not.toBeNull();
  if (viewport && mapBox) {
    expect(mapBox.x).toBeGreaterThanOrEqual(0);
    expect(mapBox.x + mapBox.width).toBeLessThanOrEqual(viewport.width + 1);
  }

  // Products dropdown on narrow screens: a fixed full-width sheet that
  // escapes the nav row's scroll clipping — hit-test, not just visibility.
  await page.locator(".nav-dropdown__summary--active").scrollIntoViewIfNeeded();
  await page.locator(".nav-dropdown__summary--active").click();
  const mobileHit = await page.evaluate(() => {
    const link = document.querySelector('[data-umami-event="nav-veritas"]');
    const r = link.getBoundingClientRect();
    const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return !!el && (el === link || link.contains(el));
  });
  expect(mobileHit).toBe(true);
});

test("flow agents page presents agent-tool discipline and status", async ({ page }) => {
  await page.goto("/flow-agents/");

  await expect(page.getByRole("heading", { name: "Flow Agents", exact: true })).toBeVisible();
  await expect(page.getByText("make your coding agent show its work — in the tools you already run").first()).toBeVisible();

  // Published status, not vapor: badge shows the released version from metadata
  const { products } = JSON.parse(
    await readFile(new URL("../src/data/product-status.json", import.meta.url), "utf8"),
  );
  await expect(page.getByText(`v${products["flow-agents"].version}`).first()).toBeVisible();

  // The page now leads with a real catch instead of an architecture lesson: the
  // verbatim Stop-hook output from the engine's own conformance fixture.
  await expect(page.getByText("Your agent says the tests pass.")).toBeVisible();
  await expect(page.getByText("This is a caught false-completion.")).toBeVisible();
  await expect(page.getByText("What it catches", { exact: true })).toBeVisible();
  // The two PreToolUse refusals, verbatim from config-protection.js.
  await expect(page.getByText("Modifying .eslintrc.json is not allowed.")).toBeVisible();
  await expect(page.getByText('"git commit --no-verify" bypasses git verification hooks.')).toBeVisible();

  // Kits are explained for someone who has never heard the word.
  await expect(page.getByText("Kits", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "A kit is a workflow, written down." })).toBeVisible();
  const kitNames = page.locator(".kit-card__name");
  await expect(kitNames.filter({ hasText: "Builder Kit" })).toBeVisible();
  await expect(kitNames.filter({ hasText: "Knowledge Kit" })).toBeVisible();
  await expect(kitNames.filter({ hasText: "Release Evidence Kit" })).toBeVisible();
  await expect(kitNames.filter({ hasText: "Veritas Governance Kit" })).toBeVisible();
  // `flow-agents kit list` never enumerates the built-in catalog — it prints
  // installed registry rows. This exact string was fabricated twice over: wrong
  // command AND wrong kit count (the catalog has three; Veritas is git-installed).
  await expect(page.getByText("Builder · Knowledge · Release Evidence · Veritas Governance")).toHaveCount(0);
  await expect(page.getByText("kits/catalog.json")).toHaveCount(0);
  // `privilege: none` was rendered as if it were a kit.json field. It is not.
  await expect(page.getByText("privilege: none")).toHaveCount(0);
  await expect(page.getByText("Installed separately, from the Veritas repo.")).toBeVisible();

  await expect(page.getByText("Claude Code").first()).toBeVisible();
  await expect(page.getByText("Codex").first()).toBeVisible();
  await expect(page.getByText("npx @kontourai/flow-agents init").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Know what ran, what passed, and what still needs a decision." })).toBeVisible();
  // The install section states the cost before the reader pays it.
  await expect(page.getByText("Needs Node 22 or newer.")).toBeVisible();
  await expect(page.getByText("Nothing leaves your machine unless you point it at a Console.")).toBeVisible();
  // The old install terminal claimed ✓ engine / ✓ gates / ✓ adapters /
  // ✓ primitives / ✓ catalog — none of which the tool prints.
  await expect(page.getByText("Installed Claude Code bundle into")).toBeVisible();
  await expect(page.getByText("✓ engine")).toHaveCount(0);
  await expect(page.getByText("✓ primitives")).toHaveCount(0);

  // Guard against the old "coming soon" framing regressing back in
  await expect(page.getByText("coming soon")).toHaveCount(0);

  // #91 F12: published packages link their npmjs page (parity with Surface/Survey/Veritas).
  await expect(page.locator('[data-umami-event="flow-agents-hero-npm"]')).toHaveAttribute(
    "href",
    "https://www.npmjs.com/package/@kontourai/flow-agents",
  );

  // #110: the shared enforcement matrix is applied here — badges come from
  // EnforcementBadge (data-enforcement fingerprint), not hand-rolled spans.
  await expect(page.getByRole("heading", { name: "Where the gate actually blocks, per runtime" })).toBeVisible();
  const faMatrix = page.locator(".enforcement-table");
  await expect(faMatrix.getByRole("row", { name: /Claude Code/ }).locator('[data-enforcement="blocking"]')).toHaveText("Blocking");
  await expect(faMatrix.getByRole("row", { name: /Kiro/ }).locator('[data-enforcement="advisory"]')).toHaveText("Advisory / opt-in block");
  await expect(faMatrix.getByRole("row", { name: /opencode/ }).locator('[data-enforcement="advisory"]')).toHaveText("Advisory / partial");
  await expect(faMatrix.getByRole("row", { name: /Other harnesses/ }).locator('[data-enforcement="spec-only"]')).toHaveText("Spec-only");
});

// /memory/ was absorbed into /knowledge-kit/#bring-your-own. The old page's
// spine claim — that Kontour records "the sources it relied on" for produced
// work — was not backed by anything in Flow Agents, so it was dropped rather
// than moved. This test holds the surviving (true) positioning and the removal.
test("memory positioning lives on the knowledge kit page", async ({ page }) => {
  // /memory/ is now a redirect stub: it must not serve the retired copy, and it
  // must land the reader on the absorbed section.
  const memoryStub = await (await page.request.get("/memory/")).text();
  expect(memoryStub).toContain('href="https://kontourai.io/knowledge-kit/#bring-your-own"');
  expect(memoryStub).toContain("noindex");
  await page.goto("/memory/");
  await page.waitForURL(/\/knowledge-kit\//);

  await page.goto("/knowledge-kit/#bring-your-own");
  await expect(page.getByRole("heading", { name: "Keep it." })).toBeVisible();
  await expect(page.getByText("Kontour never touches the retrieval side")).toBeVisible();
  // What Flow Agents actually records: the run, not the retrieval.
  await expect(page.getByText("the commands the harness actually executed, their exit codes")).toBeVisible();
  // The unbacked context-to-output provenance claim must not come back.
  await expect(page.getByText("the sources it relied on")).toHaveCount(0);
  await expect(page.getByText("which sources and checks supported the work")).toHaveCount(0);
  // Named-vendor endorsement framing is gone, which also retires the
  // "not partnership or certified-integration claims" disclaimer it needed.
  await expect(page.getByText("Context Lattice")).toHaveCount(0);
  await expect(page.getByText("not partnership or certified-integration claims")).toHaveCount(0);

  // Reachable from developer-facing navigation (R1 reachability). Points at
  // the absorbed section directly — routing readers through the redirect stub
  // worked, but spent a hop to reach the same anchor.
  await page.goto("/developers/");
  await expect(page.locator('[data-umami-event="developers-next-memory"]')).toHaveAttribute(
    "href",
    "/knowledge-kit/#bring-your-own",
  );
});

test("receipts index lists the real pipeline bundles with downloads", async ({ page }) => {
  await page.goto("/receipts/");

  await expect(page.getByRole("heading", { name: "Check the receipts yourself" })).toBeVisible();

  // #82: the receipts nav link marks itself active on the receipts surface.
  await expect(page.locator('[data-umami-event="nav-receipts"]')).toHaveAttribute("aria-current", "page");

  // Honest framing (AC5): our own pipelines, no external-adoption claim. Stated
  // as a plain fact now rather than under an "Honest framing" meta-label.
  await expect(page.getByText("came out of Kontour's own pipelines")).toBeVisible();
  await expect(page.getByText(/another team has adopted it/)).toBeVisible();

  // #107: the page LEADS with the blocked run — demo, not archive.
  await expect(page.getByRole("heading", { name: "The receipt that says no, read line by line." })).toBeVisible();
  // The story beats are derived from the bundle, not hand-authored.
  await expect(page.getByText("software-readiness-verdict").first()).toBeVisible();
  await expect(page.getByText("required-veritas-cli-artifacts").first()).toBeVisible();
  await expect(page.getByText("passing: false")).toBeVisible();
  await expect(page.locator('[data-umami-event="receipts-lead-blocked"]')).toHaveAttribute(
    "href",
    "/receipts/governance-readiness-not-ready/",
  );
  await expect(page.locator('[data-umami-event="receipts-lead-download"]')).toHaveAttribute(
    "href",
    "/receipts/governance-readiness-not-ready.trust.bundle",
  );
  // Every archive-grid view/download link is instrumented (the live event
  // sweep found only the lead download tracked — 4 of 5 downloads invisible).
  await expect(page.locator('[data-umami-event="receipts-download-flow-agents-delivery"]')).toHaveAttribute(
    "href",
    "/receipts/flow-agents-delivery.trust.bundle",
  );
  await expect(page.locator('[data-umami-event="receipts-view-flow-agents-delivery"]')).toHaveAttribute(
    "href",
    "/receipts/flow-agents-delivery/",
  );
  await expect(page.locator(".receipt-download:not([data-umami-event])")).toHaveCount(0);
  // Umami silently truncates event names over 50 chars — keep slug-derived
  // names inside the limit as new receipts are added.
  const eventNames = await page.locator("[data-umami-event]").evaluateAll(
    (els) => els.map((el) => el.getAttribute("data-umami-event")),
  );
  for (const name of eventNames) expect(name.length).toBeLessThanOrEqual(50);
  // Honest framing on the lead exhibit: a fixture projection, not a live stopped run.
  await expect(page.getByText("not a live delivery stopped mid-run")).toBeVisible();
  // The blocked exhibit renders ABOVE the archive grid.
  const blockedBox = await page.getByRole("heading", { name: "The receipt that says no, read line by line." }).boundingBox();
  const archiveBox = await page.getByRole("heading", { name: "Every published receipt, green or not." }).boundingBox();
  expect(blockedBox).not.toBeNull();
  expect(archiveBox).not.toBeNull();
  expect(blockedBox.y).toBeLessThan(archiveBox.y);

  // All four receipts are present.
  await expect(page.getByRole("heading", { name: "Flow Agents delivery bundle" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Governance Kit readiness — ready verdict" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Governance Kit readiness — blocked verdict" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Flow Agents ownership-guard bundle" })).toBeVisible();

  // Each has a rendered-view link and a raw download link (AC2/AC3).
  for (const slug of [
    "flow-agents-delivery",
    "governance-readiness-ready",
    "governance-readiness-not-ready",
    "flow-agents-ownership-guard",
  ]) {
    // Scoped to the archive grid so the lead exhibit's duplicate links (#107)
    // can't satisfy these on a card's behalf.
    const archiveGrid = page.locator(".archive-grid");
    await expect(archiveGrid.locator(`a[href="/receipts/${slug}/"]`)).toBeVisible();
    await expect(archiveGrid.locator(`a[href="/receipts/${slug}.trust.bundle"][download]`)).toBeVisible();
  }

  // #111: the second-validator affordance shows the exact pinned hachure+ajv
  // stack from package.json (check-receipts enforces the pins + runs the CLI).
  const { devDependencies, dependencies } = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  );
  await expect(page.getByText("two implementations, same verdict")).toBeVisible();
  // Honest independence scope: separate implementations, shared maintainer.
  await expect(page.getByText("the organization behind them isn't yet")).toBeVisible();
  // The tamper demonstration: the verdict is derived, so editing the stored
  // status changes nothing — and the page says what that does NOT protect.
  await expect(page.getByRole("heading", { name: "Try to make it lie." })).toBeVisible();
  await expect(page.getByText("the file says verified; the answer is still disputed")).toBeVisible();
  await expect(page.getByText("tamper-evident against edits after the fact, not unforgeable at the source")).toBeVisible();
  await expect(page.getByText(/tamper-proof/i)).toHaveCount(0);
  await expect(
    page.getByText(`npx -y -p ajv@${devDependencies.ajv} -p hachure@${devDependencies.hachure} hachure validate`).first(),
  ).toBeVisible();

  // Each card names its own exact "check it yourself" command.
  await expect(page.getByText("Check it yourself")).toHaveCount(4);
  for (const slug of [
    "flow-agents-delivery",
    "governance-readiness-ready",
    "governance-readiness-not-ready",
    "flow-agents-ownership-guard",
  ]) {
    await expect(
      page.getByText(`npx @kontourai/surface@${dependencies["@kontourai/surface"]} report --input ${slug}.trust.bundle --format summary`),
    ).toBeVisible();
  }
});

test("a receipt view renders the bundle's actual derived contents", async ({ page }) => {
  await page.goto("/receipts/governance-readiness-not-ready/");

  await expect(page.getByRole("heading", { name: "Governance Kit readiness — blocked verdict" })).toBeVisible();

  // Status derived from the artifact, not hardcoded: this bundle's claim is disputed.
  await expect(page.locator(".trust-badge--disputed").first()).toBeVisible();

  // The actual claim type from the bundle is shown.
  await expect(page.getByText("software-readiness-verdict").first()).toBeVisible();

  // #111: the per-file second-opinion command names the exact pinned stack
  // and THIS receipt's file — a hardcoded version or wrong slug fails here.
  const slugPagePins = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  ).devDependencies;
  await expect(
    page.getByText(`npx -y -p ajv@${slugPagePins.ajv} -p hachure@${slugPagePins.hachure} hachure validate`),
  ).toBeVisible();
  await expect(page.getByText("governance-readiness-not-ready.trust.bundle").first()).toBeVisible();
  await expect(page.getByText("second opinion — the reference CLI")).toBeVisible();

  // Provenance links to the immutable commit; download button points at the raw file.
  await expect(
    page.locator('a[href*="7a083966db47672ea552f13264ea3111e08fa06b"]'),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/receipts/governance-readiness-not-ready.trust.bundle"][download]'),
  ).toBeVisible();

  // The eyebrow above the command block was relabeled "Check it yourself"
  // (was "Verify it yourself"); this command names the validator.
  await expect(page.locator(".label-sm").filter({ hasText: "Check it yourself" }).first()).toBeVisible();
  await expect(page.getByText("Verify it yourself")).toHaveCount(0);
  await expect(page.getByText("npx @kontourai/surface").first()).toBeVisible();
  await expect(page.getByText("validateTrustBundle").first()).toBeVisible();
});

test("the ownership-guard receipt discloses its waived pre-existing-failure gap", async ({ page }) => {
  await page.goto("/receipts/flow-agents-ownership-guard/");

  await expect(page.getByRole("heading", { name: "Flow Agents ownership-guard bundle" })).toBeVisible();

  // AC: the gaps section is visible and names the waived claim from the bundle
  // (subjectId ends with pre-existing-failure-baseline) rather than hiding it.
  //
  // The section is now driven by the validator instead of a homegrown
  // heuristic. Per `surface report`, this bundle has ZERO transparency gaps —
  // the waived claim is a high-impact UNSUPPORTED claim, which is a different
  // thing. The old `.gap-item` locator and the `high-impact but status is
  // "assumed"` string were both deriveGaps() inventions that disagreed with the
  // validator (it rendered 12 gaps where the validator found 0).
  await expect(page.getByRole("heading", { name: "What this receipt leaves open" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "High-impact claims counted as unsupported (1)" })).toBeVisible();
  await expect(
    page
      .locator(".unsupported-list li")
      .filter({ hasText: "Three eval suites carry failures independently reproduced as pre-existing baselines" }),
  ).toBeVisible();
  await expect(page.getByText('high-impact but status is "assumed"')).toHaveCount(0);
});

test("every receipt's rendered status matches what the validator derives", async ({ page }) => {
  // The integrity property this page exists for: what the page BADGES must be
  // what `buildTrustReport` derives from the published artifact. This is
  // deliberately NOT a stored-vs-derived check — the delivery bundle legitimately
  // stores `superseded` where the derivation says `proposed`, and the page now
  // displays that divergence on purpose.
  const { buildTrustReport } = await import("@kontourai/surface");
  for (const slug of [
    "flow-agents-delivery",
    "governance-readiness-ready",
    "governance-readiness-not-ready",
    "flow-agents-ownership-guard",
  ]) {
    const bundle = JSON.parse(await (await page.request.get(`/receipts/${slug}.trust.bundle`)).text());
    const report = buildTrustReport(bundle);

    const counts = new Map();
    for (const claim of report.claims) {
      counts.set(claim.status, (counts.get(claim.status) ?? 0) + 1);
    }
    const expectedBadges = [...counts.entries()].map(([status, n]) => `${n} ${status}`).sort();
    // Not vacuous: every published bundle derives at least one status.
    expect(expectedBadges.length, `${slug} derives at least one status`).toBeGreaterThan(0);

    await page.goto(`/receipts/${slug}/`);
    const rendered = (await page.locator(".hero-badges .trust-badge").allTextContents())
      .map((t) => t.trim())
      .sort();
    expect(rendered, `${slug} hero badges match the derived statuses`).toEqual(expectedBadges);

    // The transparency-gap count on the page is the validator's, not a heuristic's.
    const gapCount = report.transparencyGaps?.length ?? 0;
    await expect(
      page.locator(".gap-item"),
      `${slug} renders exactly the validator's transparency gaps`,
    ).toHaveCount(gapCount);
  }
});

test("trust page states what it can't certify, the bypass list, the assurance dial, and honest runtime badging", async ({ page }) => {
  await page.goto("/trust/");

  // Section 1 — hero: the honest ceiling. Exactly one h1 on the page.
  await expect(
    page.getByRole("heading", { level: 1, name: "We can't certify an agent is right. No one can.", exact: true }),
  ).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  // The status function takes policy and time, not just evidence — the elided
  // form understated what the derivation depends on (and why `stale` moves).
  await expect(page.getByText("status = f(evidence, policy, now)").first()).toBeVisible();
  await expect(page.getByText("Recomputable", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Captured, not narrated").first()).toBeVisible();
  await expect(page.getByText("Refuses or escalates", { exact: true }).first()).toBeVisible();
  await expect(page.locator('[data-umami-event="trust-hero-receipts"]')).toHaveAttribute("href", "/receipts/");
  await expect(page.locator('[data-umami-event="trust-hero-early-access"]')).toHaveAttribute("href", "/early-access/");

  // Section 2 — the bypass list: four cheat rows, each badged. The stale-pass
  // row is new: it names the three residuals the homepage also discloses.
  await expect(
    page.getByRole("heading", { level: 2, name: "Four ways to cheat it — and who catches each one." }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tamper with it locally." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Forge the content." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Let a real pass go stale." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bypass as an admin." })).toBeVisible();
  await expect(page.getByText("Caught", { exact: true })).toHaveCount(2);
  await expect(page.getByText("Caught later, in CI")).toBeVisible();
  await expect(page.getByText("Named, not caught")).toBeVisible();
  await expect(page.getByText("never \"tamper-proof.\"")).toBeVisible();
  // The check has one name. It is the `trust-verify` action, and in the Flow
  // Agents repo it runs under the check name `Trust Reconcile`. "Trust Verify"
  // as a job name never existed.
  await expect(page.getByText("the way the Flow Agents repo does, where it runs under the name").first()).toBeVisible();
  await expect(page.getByText("Trust Reconcile").first()).toBeVisible();
  await expect(page.getByText("Trust Verify")).toHaveCount(0);
  // Every count on the page is checkable against the ADRs, so the residual list
  // is described by size and content rather than claimed to be exhaustive.
  await expect(page.getByText("this exact residuals list")).toHaveCount(0);
  // The config-protection gate has a currently-open bypass class (flow-agents
  // #1009) and a second open gap in the redirect detector (#1008). Both must be
  // disclosed next to the local-tamper claim they qualify.
  await expect(page.getByText("One class stays open, and can't be closed there")).toBeVisible();
  await expect(page.getByText("X=cd; $X /path").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "issue #1009" })).toHaveAttribute(
    "href",
    "https://github.com/kontourai/flow-agents/issues/1009",
  );
  await expect(page.getByRole("link", { name: "issue #1008" })).toHaveAttribute(
    "href",
    "https://github.com/kontourai/flow-agents/issues/1008",
  );
  await expect(page.getByText("it was never the boundary")).toBeVisible();
  // Negative guard: with a known-open class published, the page must never claim
  // its bypass list is complete. A future edit that reaches for exhaustiveness
  // language fails here.
  const trustHtml = (await page.content()).toLowerCase();
  for (const overclaim of [
    "exhaustive",
    "complete list",
    "the full list",
    "every way to",
    "all the ways",
    "the only ways",
    "nothing else can",
  ]) {
    expect(trustHtml, `trust page must not claim "${overclaim}"`).not.toContain(overclaim);
  }
  await expect(page.getByText("This list is what we know of today, not everything that exists.")).toBeVisible();
  await expect(page.getByText("installing the tool doesn't configure your branch protection")).toBeVisible();
  // Site-parity claim stays exactly as strong as the branch-protection fact:
  // required + no-bypass, with the workflow-protection gap disclosed.
  await expect(page.getByText("This site's own repo now requires the check too")).toBeVisible();
  // Since PR #141, workflow definitions and CI scripts are owner-review-protected via CODEOWNERS.
  await expect(page.getByText("require owner review via CODEOWNERS")).toBeVisible();
  await expect(page.getByText("isn't yet owner-review-protected")).toHaveCount(0);
  await expect(page.getByText("on where we build Flow Agents, off by default")).toBeVisible();
  await expect(page.getByText("It is the irreducible human boundary").first()).toBeVisible();

  // Section 3 — objection handler: "isn't that what CI does?"
  await expect(
    page.getByRole("heading", { level: 2, name: "But isn't that what CI does?" }),
  ).toBeVisible();
  // The opening concession must stay intact -- house rule, never silently drop it.
  await expect(page.getByText("We don't claim otherwise.")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "CI is green on what nobody wrote a check for." }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "We run inside CI too." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Before CI, in the loop." })).toBeVisible();

  // Section 4 — the assurance dial (L0/L1/L2), the load-bearing distinction.
  await expect(page.getByRole("heading", { name: "Turn up assurance as the stakes rise." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "L0 — Unsigned, local." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "L1 — Keyless CI identity." })).toBeVisible();
  // Transparency-log anchoring is optional for L1 (Hachure spec) — the copy must not imply it's intrinsic.
  await expect(page.getByText("optionally anchored in a public transparency log")).toBeVisible();
  await expect(page.getByRole("heading", { name: "L2 — Organization-held keys." })).toBeVisible();
  await expect(page.getByText("Assurance caps trust in provenance, never in derivation.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Hachure specification" })).toHaveAttribute(
    "href",
    "https://github.com/hachure-org/spec/blob/main/assurance.md",
  );

  // Section 5 — runtime enforcement, badged honestly (blocking vs advisory).
  await expect(
    page.getByRole("heading", { name: "Enforcement isn't uniform. Here's exactly where it blocks." }),
  ).toBeVisible();
  const runtimeTable = page.locator(".enforcement-table");
  await expect(runtimeTable.getByRole("row", { name: /Claude Code/ }).locator(".trust-badge--verified")).toHaveText("Blocking");
  await expect(runtimeTable.getByRole("row", { name: /Codex/ }).locator(".trust-badge--verified")).toHaveText("Blocking");
  // Kiro ships the engine's warn default (only Claude Code/Codex ship block) —
  // badging it "Blocking" was an overclaim, fixed in #110.
  await expect(runtimeTable.getByRole("row", { name: /Kiro/ }).locator(".trust-badge--stale")).toHaveText("Advisory / opt-in block");
  await expect(runtimeTable.getByRole("row", { name: /opencode/ }).locator(".trust-badge--stale")).toHaveText("Advisory / partial");
  await expect(runtimeTable.getByRole("row", { name: /^pi\s/ }).locator(".trust-badge--stale")).toHaveText("Advisory / partial");
  await expect(runtimeTable.getByRole("row", { name: /AWS Strands/ }).locator(".trust-badge--stale")).toHaveText("Advisory / partial");
  await expect(runtimeTable.getByRole("row", { name: /Other harnesses/ }).locator(".trust-badge--unknown")).toHaveText("Spec-only");
  await expect(page.getByText("it refuses or escalates to you, never silently proceeds.")).toBeVisible();
  // The hook-conformance scale must stay visibly distinct from the signing assurance dial.
  await expect(page.getByText("a different dial from the signing assurance levels above")).toBeVisible();

  // Receipt-linked stories + CTA pair. The PR #475 story was promoted to the
  // top as the lead example, so the closing section carries a single story and
  // the two-card wrapper heading is gone (no duplicate telling).
  await expect(page.getByRole("heading", { name: "Two times the boundary held." })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "The agent that refused its own admin powers" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "The security fix that almost shipped its own backdoor" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "ADR 0017" }).first()).toHaveAttribute(
    "href",
    "https://github.com/kontourai/flow-agents/blob/main/docs/adr/0017-anti-gaming-trust-security-model.md",
  );
  await expect(page.getByRole("link", { name: "Flow Agents PR #475" })).toHaveAttribute(
    "href",
    "https://github.com/kontourai/flow-agents/pull/475",
  );
  await expect(page.locator('[data-umami-event="trust-cta-receipts"]')).toHaveAttribute("href", "/receipts/");
  await expect(page.locator('[data-umami-event="trust-cta-early-access"]')).toHaveAttribute("href", "/early-access/");

  // Footer + mechanism seed link both resolve to /trust/ from this page too.
  await expect(page.locator('[data-umami-event="footer-trust"]')).toHaveAttribute("href", "/trust/");
});

test("published bundles download and validate under the named validator", async ({ page }) => {
  for (const slug of [
    "flow-agents-delivery",
    "governance-readiness-ready",
    "governance-readiness-not-ready",
    "flow-agents-ownership-guard",
  ]) {
    const response = await page.request.get(`/receipts/${slug}.trust.bundle`);
    expect(response.status(), `${slug} download status`).toBe(200);
    const parsed = JSON.parse(await response.text());
    // AC4: the downloaded artifact passes the named validator.
    expect(() => validateTrustBundle(parsed), `${slug} validates`).not.toThrow();
  }
});
