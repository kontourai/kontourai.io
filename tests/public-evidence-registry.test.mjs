import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import {
  checkPublicEvidenceReachability,
  reachabilityExitCode
} from "../scripts/check-public-evidence-reachability.mjs";
import { validatePublicEvidenceRegistry } from "../scripts/validate-public-evidence-registry.mjs";

const execFileAsync = promisify(execFile);
const sourceUrl = "https://github.com/example/public/blob/0123456789abcdef0123456789abcdef01234567/README.md";

function registryForTest() {
  return {
    schemaVersion: 1,
    sources: [{ id: "example.readme", subject: "example", sourcePath: "README.md", url: sourceUrl }],
    claims: [{ id: "example.public-claim", pagePath: "src/pages/example.astro", sourceIds: ["example.readme"] }]
  };
}

function response(status, { url = sourceUrl, headers = {} } = {}) {
  return { status, ok: status >= 200 && status < 300, url, headers };
}

test("the registry validator requires canonical ids, immutable URLs, and page consumption", async () => {
  const registry = registryForTest();
  const errors = await validatePublicEvidenceRegistry(registry, {
    rootDir: "/registry-test",
    readFileImpl: async () =>
      "const source = getPublicEvidenceClaimSourceUrl('example.public-claim', 'example.readme');"
  });
  assert.deepEqual(errors, []);

  registry.sources[0].url = "https://github.com/example/public/blob/main/README.md";
  const invalid = await validatePublicEvidenceRegistry(registry);
  assert.ok(invalid.some((error) => error.includes("immutable GitHub")));
});

test("claim bindings reject swapped source associations deterministically", async () => {
  const registry = registryForTest();
  registry.sources.push({
    id: "example.guide",
    subject: "example",
    sourcePath: "GUIDE.md",
    url: "https://github.com/example/public/blob/0123456789abcdef0123456789abcdef01234567/GUIDE.md"
  });
  registry.claims.push({
    id: "example.guide-claim",
    pagePath: "src/pages/example.astro",
    sourceIds: ["example.guide"]
  });
  const swappedPage = [
    "getPublicEvidenceClaimSourceUrl('example.public-claim', 'example.guide')",
    "getPublicEvidenceClaimSourceUrl('example.guide-claim', 'example.readme')"
  ].join("\n");

  const errors = await validatePublicEvidenceRegistry(registry, {
    rootDir: "/registry-test",
    readFileImpl: async () => swappedPage
  });
  assert.ok(errors.some((error) => error.startsWith("claim example.public-claim:")));
  assert.ok(errors.some((error) => error.startsWith("claim example.guide-claim:")));
});

test("comparison-only scope is enforced for every subject", async () => {
  const registry = registryForTest();
  registry.sources[0].scope = "comparison-only";
  const errors = await validatePublicEvidenceRegistry(registry);
  assert.ok(errors.some((error) => error.includes("comparison-only sources may only support")));
});

test("anonymous reachability distinguishes pass, inaccessible failures, and transient gaps", async () => {
  const registry = registryForTest();
  const lines = [];
  const pass = await checkPublicEvidenceReachability({
    registry,
    fetchImpl: async (_url, options) => {
      assert.equal(options.headers.authorization, undefined);
      return response(200);
    },
    log: (line) => lines.push(line)
  });
  assert.equal(pass[0].status, "PASS");
  assert.match(
    lines[0],
    /^PASS  claim=example\.public-claim source=example\.readme path=README\.md:/,
  );

  const inaccessible = await checkPublicEvidenceReachability({
    registry,
    fetchImpl: async () => response(404),
    log: () => {}
  });
  assert.deepEqual(inaccessible[0], {
    claimId: "example.public-claim",
    sourceId: "example.readme",
    sourcePath: "README.md",
    status: "FAIL",
    detail: "inaccessible or private source (HTTP 404)"
  });

  const transient = await checkPublicEvidenceReachability({
    registry,
    fetchImpl: async () => response(429),
    log: () => {}
  });
  assert.equal(transient[0].status, "NOT_VERIFIED");
  assert.match(transient[0].detail, /rate limited/);
});

test("403 is indeterminate only when the response carries a transient signal", async () => {
  const registry = registryForTest();
  for (const headers of [
    { "retry-after": "30" },
    { "x-ratelimit-remaining": "0" }
  ]) {
    const transient = await checkPublicEvidenceReachability({
      registry,
      fetchImpl: async () => response(403, { headers }),
      log: () => {}
    });
    assert.equal(transient[0].status, "NOT_VERIFIED");
  }

  const positiveRemaining = await checkPublicEvidenceReachability({
    registry,
    fetchImpl: async () =>
      response(403, {
        headers: {
          "x-ratelimit-limit": "5000",
          "x-ratelimit-remaining": "4999",
          "x-ratelimit-reset": "1900000000"
        }
      }),
    log: () => {}
  });
  assert.equal(positiveRemaining[0].status, "FAIL");

  const inaccessible = await checkPublicEvidenceReachability({
    registry,
    fetchImpl: async () => response(403),
    log: () => {}
  });
  assert.equal(inaccessible[0].status, "FAIL");
});

test("each canonical source is fetched once before its result is projected to claims", async () => {
  const registry = registryForTest();
  registry.sources.push({
    id: "example.readme-alias",
    subject: "example",
    sourcePath: "README.md",
    url: sourceUrl
  });
  registry.claims.push({
    id: "example.second-claim",
    pagePath: "src/pages/example.astro",
    sourceIds: ["example.readme-alias"]
  });
  let fetchCount = 0;
  const lines = [];
  const results = await checkPublicEvidenceReachability({
    registry,
    fetchImpl: async () => {
      fetchCount += 1;
      return response(200);
    },
    log: (line) => lines.push(line)
  });

  assert.equal(fetchCount, 1);
  assert.equal(results.length, 2);
  assert.equal(new Set(lines).size, 2);
  assert.match(lines[0], /source=example\.readme path=README\.md/);
  assert.match(lines[1], /source=example\.readme-alias path=README\.md/);
});

test("reachability exit codes distinguish failure from indeterminate evidence", () => {
  assert.equal(reachabilityExitCode([{ status: "PASS" }]), 0);
  assert.equal(reachabilityExitCode([{ status: "NOT_VERIFIED" }]), 2);
  assert.equal(reachabilityExitCode([{ status: "FAIL" }]), 1);
  assert.equal(reachabilityExitCode([{ status: "NOT_VERIFIED" }, { status: "FAIL" }]), 1);
});

test("the default validation gate runs the focused unit test without recursion", async () => {
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  assert.match(packageJson.scripts.validate, /node --test tests\/public-evidence-registry\.test\.mjs/);
  assert.doesNotMatch(packageJson.scripts.validate, /npm run validate/);
});

test("the public content boundary scans an untracked registry file", async () => {
  const root = await mkdtemp(join(tmpdir(), "kontour-public-evidence-"));
  try {
    await mkdir(join(root, "scripts"), { recursive: true });
    await mkdir(join(root, "src", "data"), { recursive: true });
    await cp("scripts/check-content-boundary.cjs", join(root, "scripts", "check-content-boundary.cjs"));
    await writeFile(
      join(root, "src", "data", "public-evidence-registry.json"),
      JSON.stringify({ note: ["cam", "pfit"].join("") })
    );
    await execFileAsync("git", ["init", "-q"], { cwd: root });

    await assert.rejects(
      execFileAsync("node", ["scripts/check-content-boundary.cjs"], { cwd: root }),
      (error) => /public-evidence-registry\.json:1 private vertical product name/.test(error.stderr)
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
