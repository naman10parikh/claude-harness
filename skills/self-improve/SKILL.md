---
name: self-improve
description: Analyze past sessions to find repeated patterns, forgotten rules, and backtracking. Auto-update CLAUDE.md, skills, and rules.
---

## When to Use

- After several sessions of active development
- When you notice Claude making the same mistakes repeatedly
- Periodically (weekly) as a maintenance task

## Process

### 1. Session Log Analysis

Read session files from `~/.claude/projects/` (JSONL format).
Look for:

- Questions Claude asks repeatedly (add answer to CLAUDE.md)
- Rules Claude forgets (add to .claude/rules/)
- Information Claude keeps re-discovering (promote to bootstrap memory)
- Patterns of backtracking (create a skill that prevents it)
- Tool call failures (improve error handling in hooks)

### 2. Signal Classification

- **High confidence:** Explicit corrections from user — immediately persist
- **Medium confidence:** Patterns that worked well — persist after confirming
- **Low confidence:** Observations — queue for review

### 3. Output

For each finding:

1. Identify which file to update (CLAUDE.md, a rule, a skill, settings)
2. Make the minimal change needed
3. Log the improvement to memory/LEARNINGS.md

### 4. Verification

- Confirm CLAUDE.md is still under 2K tokens
- Confirm no conflicting rules exist
- Confirm skills are still discoverable (short descriptions)

## Known Error Pattern Categories

### Category 1: State Loss in Serverless

- **Pattern:** In-memory Maps/globals lost between Lambda invocations
- **Fix:** Client-side state or external store — never module-scope Maps in API routes

### Category 2: Race Conditions in Async Boot

- **Pattern:** Operation attempted before dependency is ready
- **Fix:** Retry loop with backoff, never assume ready after fixed sleep

### Category 3: Stream Timeout During Long Operations

- **Pattern:** Browser/proxy drops connection when no data flows for 10-15s
- **Fix:** Keepalive pings on all SSE streams

### Category 4: Silent Catch Blocks

- **Pattern:** `catch { }` or `catch { /* comment */ }` with no logging
- **Fix:** Always log with context prefix and error message

## The Compound Effect

Each improvement makes the next session slightly better. Over weeks, this compounds into a dramatically better development experience. The harness improves itself.
