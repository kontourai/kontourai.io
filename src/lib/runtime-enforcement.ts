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
    runtime: "Kiro",
    level: "blocking",
    meaning: "Same blocking path, wired to Kiro sessions.",
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
    runtime: "Everywhere else",
    level: "spec-only",
    meaning: "The open format runs; no runtime hook yet.",
  },
];
