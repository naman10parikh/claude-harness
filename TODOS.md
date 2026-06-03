# claude-harness — TODOS (CP117 harness-completion)

Human- and agent-readable task ledger for the CP117 harness-maturity pass. Source of truth:
`energy/audit/HARNESS-MATURITY-AUDIT-2026-06-01.md` (claude-harness = maturity 3.8, detail block "D18").
This repo is the **source scaffold** ~13 other repos are forged from, so every fix here cascades.

**Hard rule:** additive only (add / enhance / shuffle — never delete). Surgical diffs. Verify before done.

## Named gaps (from the audit)

- [x] **CP117-1 — Identity is a template.** `identity/SOUL.md` (and `MEMORY.md`, `HEARTBEAT.md`,
  `BRAND.md`) are unfilled `{{AGENT_NAME}}` / `{{MISSION}}` stubs. Fill them with a real, specific
  identity for the claude-harness scaffold itself, written so forged children inherit a sensible
  default rather than a placeholder.
- [x] **CP117-2 — No runnable `eval/`.** `eval/` had only a `README.md`. Add a golden-task set +
  an assertion-style (Hamel L1/L2) eval that checks the scaffold's own invariants, runnable via
  `npm run eval`.
- [x] **CP117-3 — Confirm `.claude/agents/` is flat** (the forge double-nest `agents/agents/` was
  fixed fleet-wide). Verified flat here; the eval now asserts it so it can never regress.

## Work done this pass

- [x] Filled `identity/SOUL.md` — real identity for the scaffold ("the harness is the product"),
  with a clearly-marked default-identity block forged children inherit.
- [x] Filled `identity/BRAND.md`, `identity/MEMORY.md`, `identity/HEARTBEAT.md` (removed all
  `{{...}}` placeholders; kept the agent-format structure: Identity → Personality → Boundaries).
- [x] Added `eval/golden-tasks.json` — the golden-task set (scaffold invariants + a live
  expert-tier scaffold install).
- [x] Added `eval/run-eval.mjs` — runnable assertion eval (zero new deps; Node built-ins only).
- [x] Wired `npm run eval` in `package.json`.
- [x] Bugfix (additive, surgical): `copyDir` in `bin/install.js` now skips OS-junk files
  (`.DS_Store`, `Thumbs.db`) so the scaffolder never copies them into a user's project. This also
  makes the expert-tier skill count deterministic (15) on macOS, fixing a local-only test failure.
- [x] Added an `eval` step to `.github/workflows/ci.yml` (runs `npm ci` + `npm run eval`).
- [x] Added `eval/IMPLEMENTATION-NOTE.md` documenting the pass.

## Verify

- [x] `npm test` green (19/19).
- [x] `npm run eval` green (all golden tasks pass).
- [x] `.claude/agents/` flat — no `.claude/agents/agents/`.
