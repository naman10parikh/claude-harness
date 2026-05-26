---
type: company-brain
status: active
created: 2026-05-25
updated: 2026-05-25
tags: [claude-harness, company-brain, learnings]
source: brain/ORG_MEMORY.md
related: ["[[MOC - claude-harness]]", "[[ORG_CONTEXT]]"]
---

# claude-harness — ORG_MEMORY (company brain memory)

Every agent writes back here after acting. The fleet inherits every workflow's learnings.

## Learnings

- **Two-harness separation is the core invariant.** This repo is both a scaffolder (its bundled
  top-level `skills/ rules/ hooks/ agents/ templates/ examples/ docs/ bin/ scripts/` are the
  *product payload* shipped to users) and a normal repo with its own operating harness (`.claude/
  brain/ identity/ memory/`). The most common mistake is editing one when you mean the other —
  always check `package.json` `files` to tell payload from repo-config. Documented in `CLAUDE.md`
  and `AGENTS.md`.

- **AGENTS.md must be repo-specific, not the WikiMem schema.** Forged from Energy on 2026-05-25,
  this repo inherited a generic WikiMem wiki-schema `AGENTS.md` (sha `627eebad…`). It was rewritten
  to describe *this* repo's two surfaces and dev conventions during CP104 doc-standardization.

- **The gate is `npm test` (19 tests).** `test/install.test.js` is the immune system — any change
  to `bin/install.js` or the bundled payload is verified against those 19 tests before shipping.
  "It compiles" is not enough; dogfood the CLI with `node bin/claude-harness.js init` on a temp dir.

## Decisions

- **Distribution = npm package `claude-harness@1.0.0`**, MIT-licensed, zero-config payload copy.
  `bin/` exposes `init` + `verify`; tiers are starter / pro / expert.

## Related Notes

- [[MOC - claude-harness]]
- [[ORG_CONTEXT]]
