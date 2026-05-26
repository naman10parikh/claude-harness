---
type: company-brain
status: active
created: 2026-05-25
updated: 2026-05-25
tags: [claude-harness, company-brain]
source: brain/ORG_CONTEXT.md
related: ["[[MOC - claude-harness]]", "[[ORG_MEMORY]]"]
---

# claude-harness — ORG_CONTEXT (company brain context)

Every agent reads this before acting. "If it is recorded, it happened to the AI."

`claude-harness` is a **CLI scaffolder** distributed as the npm package `claude-harness`. Its
single job is to drop a battle-tested Claude Code harness — lifecycle hooks, on-demand skills,
context-aware rules, sub-agent definitions, and a persistent `memory/` system — into any target
project so the same model produces roughly twice the useful output. The thesis is "the harness is
the product": output quality is dominated by the scaffold around the model, not the model alone.

The product surface is the CLI in `bin/claude-harness.js`, exposing two commands: `init` (an
interactive scaffold that asks for project name, language, tier, and project type, then installs
the chosen payload) and `verify` (a setup check that confirms the harness is wired). Quality is
guarded by a vitest suite — **19 tests** in `test/install.test.js` — that must stay green on every
change to the installer or the bundled payload.

The repo deliberately holds two harnesses and they must never be confused: the **product payload**
(top-level `bin/ templates/ skills/ rules/ hooks/ agents/ examples/ scripts/ docs/`, all listed in
`package.json` `files`) is what users receive; **this repo's own harness** (`.claude/ brain/
identity/ memory/`) is how agents behave while developing here. Editing the wrong surface is the
most common failure mode and is called out in `CLAUDE.md` and `AGENTS.md`.

## Related Notes

- [[MOC - claude-harness]]
- [[ORG_MEMORY]]
