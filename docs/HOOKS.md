# Hook System

Claude Code hooks automate actions at specific lifecycle events.

## How Hooks Work

Hooks are shell scripts that run automatically when Claude Code triggers lifecycle events. They receive context via environment variables and communicate back via exit codes and stdout/stderr.

## Lifecycle Events

| Event                  | When It Fires              | Use Case                    |
| ---------------------- | -------------------------- | --------------------------- |
| SessionStart           | New session begins         | Load context, check health  |
| SessionStart (compact) | After auto-compaction      | Restore lost context        |
| PreToolUse             | Before any tool call       | Block dangerous commands    |
| PostToolUse            | After any tool call        | Format code, verify deploys |
| PreCompact             | Before context compression | Save state to disk          |
| Stop                   | Before Claude stops        | Quality gate                |
| SessionEnd             | Session terminates         | Log session summary         |

## Included Hooks

### session-start-context.sh (SessionStart)

Loads project context on every session start:

- CONTEXT.md (current state)
- memory/MEMORY.md (long-term decisions)
- memory/LEARNINGS.md (error patterns)
- Recent git commits
- Unread resources detection
- Post-compaction anchor state recovery

### context-monitor.sh (SessionStart)

Health checks that warn about:

- Stale plan files (>24h old)
- Memory bloat (MEMORY.md >100 lines, LEARNINGS.md >150 lines)
- Missing daily log
- CONTEXT.md staleness (>48h since last update)
- Too many uncommitted files (>50)

### pre-compact-memory-flush.sh (PreCompact)

The most critical hook. Fires before context compression:

1. Creates structured backup in `.claude/backups/`
2. Writes anchor-state.md (survives compaction)
3. Tracks compaction count per session
4. Appends compaction marker to daily log
5. Signals auto-switch if 2+ compactions

### post-compact-restore.sh (SessionStart, compact matcher)

Re-injects context after auto-compaction:

1. Shows compaction count and degradation warning
2. Loads active task file
3. Loads anchor state from pre-compaction flush
4. Shows recent daily log entries
5. Lists uncommitted files
6. Provides recovery instructions

### stop-verify.sh (Stop)

Quality gate before Claude stops working:

- Warns if >3 uncommitted source files without CONTEXT.md update
- Circuit breaker: allows stop after 3 fires in 60 seconds (prevents loops)
- Auto-allows stop if context compacted 3+ times

### session-end-log.sh (SessionEnd)

Logs session summary to `memory/daily/{date}.md`:

- Timestamp
- Number of modified files

## Inline Hooks

Configured directly in settings.local.json (no script file):

### Destructive Command Blocker (PreToolUse: Bash)

Blocks: `rm -rf /`, `rm -rf ~/`, `sudo rm -rf`, `> /dev/sda`, `mkfs`, `dd if=/dev`

### Protected File Blocker (PreToolUse: Write|Edit)

Blocks: `pnpm-lock.yaml`, `package-lock.json`, `.env`, `.env.local`

## Creating Custom Hooks

```bash
#!/bin/bash
set -euo pipefail
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Your logic here

# Exit 0 = allow, Exit 2 = block (stderr shown to Claude)
exit 0
```

Add to `.claude/settings.local.json` under the appropriate event.
