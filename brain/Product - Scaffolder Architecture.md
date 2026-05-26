---
type: architecture
status: active
created: 2026-05-25
updated: 2026-05-25
tags: [claude-harness, architecture, cli]
source: bin/claude-harness.js
related: ["[[MOC - claude-harness]]", "[[ORG_CONTEXT]]", "[[Docs - Getting Started]]"]
---

# Product — Scaffolder Architecture

Navigation note. Canonical source: [`bin/claude-harness.js`](../bin/claude-harness.js) and
[`bin/install.js`](../bin/install.js).

The CLI exposes two commands. `init [directory]` is interactive — it prompts for project name,
language (TypeScript / Python / general), tier (starter / pro / expert), and project type
(web-app / cli-tool / agent-project), then calls `install()` to copy the matching payload into the
target's `.claude/` and `memory/`. `verify` runs `scripts/verify.sh` (or a built-in fallback) to
confirm `CLAUDE.md`, `.claude/settings.local.json`, and the skills/hooks/rules dirs exist.

The payload that gets installed lives at the repo root (`skills/`, `hooks/`, `rules/`, `agents/`,
`templates/`, `scripts/`) and is enumerated in `package.json` `files`. This is the **product**, not
this repo's own `.claude/`. The installer is covered by 19 tests in `test/install.test.js`.

## Related Notes

- [[MOC - claude-harness]]
- [[ORG_CONTEXT]]
- [[Docs - Getting Started]]
