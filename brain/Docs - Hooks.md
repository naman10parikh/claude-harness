---
type: operations
status: active
created: 2026-05-25
updated: 2026-05-25
tags: [claude-harness, docs, hooks]
source: docs/hooks-guide.md
related: ["[[MOC - claude-harness]]", "[[Docs - Skills]]", "[[Docs - Memory System]]"]
---

# Docs — Hooks

Navigation note. Canonical sources: [`docs/hooks-guide.md`](../docs/hooks-guide.md) (how every hook
works and how to write your own) and [`docs/HOOKS.md`](../docs/HOOKS.md) (the hook system reference).

Hooks are shell scripts that run at Claude Code lifecycle events (SessionStart, PreToolUse,
PostToolUse, PreCompact, Stop, SessionEnd) to automate context management, safety checks, memory
persistence, and quality gates — without consuming Claude's context window. The bundled hooks the
scaffolder installs live in the repo's top-level `hooks/` dir.

## Related Notes

- [[MOC - claude-harness]]
- [[Docs - Skills]]
- [[Docs - Memory System]]
