---
name: memory-compression
description: Production memory management. Prevents context loss across compactions with structured anchoring and tiered storage.
---

## Three-Layer Memory Architecture

```
.claude/ or project root/
├── CLAUDE.md        # Static project config — human-authored
├── memory/
│   ├── MEMORY.md        # Curated long-term — capped at ~500 lines
│   ├── LEARNINGS.md     # Append-only patterns and mistakes
│   ├── daily/
│   │   ├── 2026-03-01.md  # Structured daily journals
│   │   └── 2026-03-03.md  # Last 7 days active, older archived
│   └── backups/
│       └── pre-compact-*.md  # Auto-generated before compaction
```

Plain Markdown beats vector databases for structured retrieval: structure IS the retrieval mechanism.

## Pre-Compaction Flush

### When It Triggers

Fires before Claude Code auto-compacts context (typically at 70-80% utilization).

### Anchor State Pattern

```markdown
## Anchor State

### Intent

[What we're building right now, one sentence]

### Changes Made

- [file]: [what changed and why]

### Decisions Taken

- [decision]: [rationale] — alternatives: [X, Y]

### Next Steps (ordered)

1. [Most important next action]
2. [Second priority]
```

Each compaction MERGES into this anchor rather than starting fresh.

### What to KEEP (Always Survives)

- Architecture decisions with rationale
- User preferences and constraints
- Error patterns and their fixes
- File paths and their purposes
- The current anchor state

### What to SUMMARIZE (Compress)

- Multi-turn debugging -> "Fixed X by changing Y in file Z"
- Research exploration -> "Compared A vs B vs C; chose B because [reason]"
- Tool output -> strip to relevant lines only

### What to DISCARD

- Confirmations ("sounds good", "yes", "ok")
- Repeated failed attempts (keep only the fix)
- Full file contents that were read (keep path + line refs)
- Verbose tool output (keep summary)

## Prompt Caching (Anthropic)

Cache hierarchy: **Tools -> System -> Messages**. Content cached as byte-identical prefix.

| Operation   | Multiplier | Break-even            |
| ----------- | ---------- | --------------------- |
| Cache write | 1.25x      | Pays off after 1 read |
| Cache READ  | 0.1x       | 90% savings per read  |

- Max 4 breakpoints per request
- Minimum: 1024 tokens (Sonnet/Opus), 2048 tokens (Haiku)
- TTL is sliding: refreshed on every hit (5min default)

## Post-Compaction Recovery

### Hook Chain

1. **PreCompact** (`pre-compact-memory-flush.sh`): Write anchor-state.md + backup + daily log
2. **PostCompact** (`post-compact-restore.sh` via SessionStart `compact` matcher): Re-inject anchor state + active task

### Compaction Rules

- Auto-compaction at ~70-80% context usage
- After 2 compactions: STOP work, write handoff, start new session
- Each compaction retains only 20-30% of detail
- After 2 compactions: 4-9% of original context survives

## Session Handoff Protocol

At session end, write to daily log:

```markdown
# Session Handoff — {date} {time}

## Anchor State

### Intent

[one sentence]

### Changes Made

- [file]: [change]

### Next Steps

1. [next action]
```
