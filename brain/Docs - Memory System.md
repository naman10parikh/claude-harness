---
type: operations
status: active
created: 2026-05-25
updated: 2026-05-25
tags: [claude-harness, docs, memory]
source: docs/MEMORY-SYSTEM.md
related: ["[[MOC - claude-harness]]", "[[Docs - Hooks]]", "[[Docs - Auto-Switch]]"]
---

# Docs — Memory System

Navigation note. Canonical source: [`docs/MEMORY-SYSTEM.md`](../docs/MEMORY-SYSTEM.md).

How the scaffolded harness manages memory across sessions and compactions: a layered markdown
system (`MEMORY.md` long-term index → `topics/` deep-dives → `daily/` session logs → `archive/`
compressed history >30 days, never deleted) plus `LEARNINGS.md` (append-only error→rule log).
Hooks bridge compaction by writing anchor state before and re-injecting it after.

## Related Notes

- [[MOC - claude-harness]]
- [[Docs - Hooks]]
- [[Docs - Auto-Switch]]
