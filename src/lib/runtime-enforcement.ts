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
    // Kiro wires its hooks inside the agent JSON (its native config model), so
    // there is no `.kiro/` host-config directory to look for — all four policy
    // classes really do ship. What does NOT ship is the block-mode default:
    // GOAL_FIT_MODE_PREFIX is applied only in exportClaudeSettings() and
    // exportCodexHooks(), so Kiro's done-check resolves to `warn` unless the
    // reader sets the variable. Upstream grades it L2/blocking regardless —
    // flow-agents#1002.
    runtime: "Kiro",
    level: "advisory",
    label: "Advisory / opt-in block",
    meaning:
      "All four policies ship and config protection blocks at tool-call time, but the done-check arrives in warn mode — set FLOW_AGENTS_GOAL_FIT_MODE=block to make it stop the turn.",
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
      "Our own adapters for the Strands SDK: writes to protected config are blocked as they happen; steering, quality, and stop policies are reporting-only so far, and the Python adapter is still a proof of concept.",
  },
  {
    runtime: "Other harnesses",
    level: "spec-only",
    meaning: "The open format runs; no runtime hook yet.",
  },
];
