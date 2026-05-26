# Memory System

How claude-harness manages memory across sessions and compactions.

## The Problem

Claude Code auto-compacts conversations when context fills up. Each compaction retains only 20-30% of detail. After 2 compactions, you're working with 4-9% of the original conversation. Without a memory system, Claude forgets decisions, patterns, and progress.

## Three-Tier Architecture

```
Tier 1: Bootstrap (always loaded)
  CLAUDE.md         → Project config, operating instructions
  memory/MEMORY.md  → Curated long-term decisions

Tier 2: On-Demand (loaded when needed)
  .claude/skills/   → Workflows loaded by trigger
  .claude/rules/    → Context loaded by file pattern

Tier 3: Recovery (loaded after compaction)
  .claude/anchor-state.md    → What we were doing pre-compaction
  .claude/backups/           → Full snapshots
  memory/daily/{date}.md     → Session journals
  memory/LEARNINGS.md        → Error patterns
```

## How Compaction Works

1. Claude's context fills to ~80% (configurable via `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`)
2. PreCompact hook fires → `pre-compact-memory-flush.sh`
3. Anchor state, backup, and daily log are written to disk
4. Claude compresses the conversation (lossy — 70-80% detail lost)
5. PostCompact hook fires → `post-compact-restore.sh`
6. Anchor state and recent context are re-injected

## Key Files

### memory/MEMORY.md

Curated long-term knowledge. Cap at ~500 lines. Structure:

```markdown
## Architecture Decisions

- [Decision]: [Rationale]

## Key Patterns

- [Pattern]: [When to use]

## Technology Choices

| Layer | Choice | Why |
```

### memory/LEARNINGS.md

Append-only error patterns. Format:

```markdown
- **What broke:** X
- **Root cause:** Y
- **Rule:** Always do Z instead
```

### memory/daily/{date}.md

Session journals. Auto-populated by hooks. One file per day.

### .claude/anchor-state.md

Written before compaction, read after. Contains:

- What you were doing (intent)
- Recent daily log entries
- Compaction health (count, warnings)
- Recovery steps

## Rules of Thumb

- Keep MEMORY.md under 500 lines — curate ruthlessly
- Keep CLAUDE.md under 2K tokens — skills are the overflow valve
- After 2 compactions: stop, write handoff, start new session
- Use sub-agents for research to protect your context window
- Daily logs are the paper trail — make them standalone stories
