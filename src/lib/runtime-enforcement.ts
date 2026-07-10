/**
 * Per-runtime enforcement levels (#110): the single source both /trust and
 * /flow-agents render from, so the honesty table can't drift between pages.
 *
 * Levels are the site's public vocabulary (blocking / advisory / spec-only),
 * NOT the runtime-hook-surface spec's L0–L2 conformance grades and NOT the
 * Hachure signing assurance dial — see the /trust receipt line that keeps
 * those scales distinct.
 */
export type EnforcementLevel = "blocking" | "advisory" | "spec-only";

export interface RuntimeEnforcement {
  runtime: string;
  level: EnforcementLevel;
  /** Display override when a row needs nuance (e.g. "Advisory / partial"). */
  label?: string;
  meaning: string;
}

export const runtimeEnforcement: RuntimeEnforcement[] = [
  {
    runtime: "Claude Code",
    level: "blocking",
    meaning: 'The Stop hook refuses or escalates on unbacked "done."',
  },
  {
    runtime: "Codex",
    level: "blocking",
    meaning: "Same blocking path, mapped to Codex agent definitions.",
  },
  {
    // Kiro's adapter has the full blocking capability (hook-surface L2), but
    // unlike Claude Code and Codex its shipped config leaves the engine's
    // canonical `warn` default — badging it "Blocking" would overclaim the
    // out-of-the-box behavior (runtime-hook-surface spec, Decision contract).
    runtime: "Kiro",
    level: "advisory",
    label: "Advisory / opt-in block",
    meaning:
      "Full blocking capability is wired, but the shipped default warns instead of blocking — set FLOW_AGENTS_GOAL_FIT_MODE=block to enforce.",
  },
  {
    runtime: "opencode",
    level: "advisory",
    label: "Advisory / partial",
    meaning:
      "Stop-goal-fit reports but can't block there; config protection still blocks at tool-call time.",
  },
  {
    runtime: "pi",
    level: "advisory",
    label: "Advisory / partial",
    meaning:
      "No stop hook — the done-check can't run; config protection still blocks at tool-call time.",
  },
  {
    runtime: "AWS Strands (Python & TS)",
    level: "advisory",
    label: "Advisory / partial",
    meaning:
      "Official framework adapters: config protection blocks at tool-call time; steering, quality, and stop policies are telemetry- or shim-only so far.",
  },
  {
    runtime: "Other harnesses",
    level: "spec-only",
    meaning: "The open format runs; no runtime hook yet.",
  },
];
