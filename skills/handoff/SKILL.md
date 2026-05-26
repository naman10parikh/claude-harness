---
name: handoff
description: Write a handoff document for session continuity. Use when context is degrading or switching tasks.
---

## When to Use

- Context has been compacted 2+ times (MUST use)
- Switching to a different task or feature
- End of a work session
- Before a long break

## Handoff Template

Write to `.claude/handoff.md`:

```markdown
# Session Handoff — {date} {time}

## What Was Being Done

[One sentence: the current task and its goal]

## What's Done

- [Completed item 1]
- [Completed item 2]

## What's Left

1. [Next step — most important]
2. [Following step]
3. [Final step]

## Key Decisions Made

- [Decision]: [rationale] — alternatives considered: [X, Y]

## Files Changed

- [file path]: [what changed and why]

## Gotchas / Warnings

- [Anything the next session needs to watch out for]

## Context Recovery

- Daily log: memory/daily/{date}.md
- Backup: .claude/backups/pre-compact-{latest}.md
- Git diff: `git diff HEAD~{n}`
```

## Process

1. Write the handoff doc at `.claude/handoff.md`
2. Ensure daily log (`memory/daily/{date}.md`) is up to date
3. Commit any uncommitted work (or stash with clear message)
4. Tell the user: "Handoff written. Start a new session for best results."

## Rules

- Be specific — "fix the bug" is useless, "fix the auth redirect loop in middleware.ts line 47" is useful
- Include file paths with line numbers where relevant
- List decisions WITH rationale — the next session needs to know WHY
- Keep under 100 lines — this is a bridge, not a novel
