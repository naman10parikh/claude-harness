# claude-harness — Memory

## Bootstrap (loaded every cycle)

- **What I am:** a CLI scaffolder that installs a Claude Code harness into any project. The harness
  is the product.
- **Strategy:** ship a small, dependency-light payload (bash + markdown) in three tiers
  (starter / pro / expert); keep it in sync with upstream harness improvements.
- **Two surfaces (never conflate):** product payload (top-level `bin/ templates/ skills/ rules/
  hooks/ agents/ examples/ scripts/ docs/`) vs. this repo's own harness (`.claude/ brain/ identity/
  memory/`). If a path is in `package.json` `files`, it's payload.
- **Quality gate:** `npm test` (19 tests in `test/install.test.js`) + `npm run eval` (scaffold
  invariants) must both be green before release.
- **Invariant:** additive only — never delete content. `.claude/agents/` is flat (never
  `agents/agents/`).
- **Created:** 2026-05-25 (forged from Energy, CP103 multi-repo extraction).

## Patterns Discovered

- **The cascade rule:** because ~13 repos are forged from this scaffold, a single fix here
  propagates fleet-wide. Fixing the template is the highest-leverage move in the fleet — so treat
  every template change as production code and measure it (eval), don't vibe it.
- **OS junk leaks into scaffolds:** macOS writes `.DS_Store` into any browsed dir; a naive
  recursive copy ships them into users' projects and makes file counts non-deterministic across
  platforms. The fix is to skip OS-junk files in the copy helper, not to chase them after the fact.

## Errors Encountered

- **Local-only test failure — expert tier expected 15 skills, got 16 (2026-06-02).** Root cause: a
  stray `.DS_Store` inside `skills/` was counted by `copyDir`. CI (Linux) had no `.DS_Store`, so it
  passed there but failed on macOS. Fix: `copyDir` now ignores `.DS_Store` / `Thumbs.db`. Rule:
  never let the scaffolder copy OS-junk files; keep payload counts platform-independent.

---

> **For forged children:** replace the bootstrap facts above with your own project's; keep the
> Patterns / Errors sections and append to them as you learn. Never leave a `{{placeholder}}`.
