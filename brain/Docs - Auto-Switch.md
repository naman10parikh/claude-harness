---
type: operations
status: active
created: 2026-05-25
updated: 2026-05-25
tags: [claude-harness, docs, autonomy]
source: docs/AUTO-SWITCH.md
related: ["[[MOC - claude-harness]]", "[[Docs - Memory System]]"]
---

# Docs — Auto-Switch

Navigation note. Canonical source: [`docs/AUTO-SWITCH.md`](../docs/AUTO-SWITCH.md).

Documents autonomous session management: `scripts/auto-switch.sh` wraps Claude in a session loop,
detects context degradation (compactions), writes a handoff, exits, and restarts a fresh session
with full context injection — enabling unattended overnight runs without losing the thread.

## Related Notes

- [[MOC - claude-harness]]
- [[Docs - Memory System]]
