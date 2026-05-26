# Auto-Switch (Autonomous Session Management)

## What It Does

`auto-switch.sh` wraps Claude Code in a session loop. When a session ends (context degradation, crash, rate limit), it captures the final state and starts a fresh session with full context.

## Usage

```bash
# Interactive mode (daytime)
./scripts/auto-switch.sh

# Autonomous overnight mode
./scripts/auto-switch.sh --overnight

# Preview what would happen
./scripts/auto-switch.sh --dry-run
```

For background execution:

```bash
tmux new-session -d -s work './scripts/auto-switch.sh --overnight'
tmux attach -t work  # check on it
```

## How It Works

1. Starts a Claude Code session with full context
2. Claude works until session ends
3. Script detects exit reason:
   - **Context degraded** → immediate restart with handoff
   - **Rate limited** → wait 60 minutes, then restart
   - **Crash** → wait 30 seconds, then retry
   - **Normal exit** → stop
4. Builds a resume prompt with handoff context
5. Starts a new session (up to 20 sessions max)

## Exit Detection

The script detects why Claude exited:

| Signal             | Source                              | Action               |
| ------------------ | ----------------------------------- | -------------------- |
| `context-degraded` | Signal file from pre-compact hook   | Restart immediately  |
| `rate-limited`     | Grep session log for limit messages | Wait, then restart   |
| `crash:{code}`     | Non-zero exit code                  | Wait 30s, then retry |
| `normal`           | Clean exit                          | Stop loop            |

## Session Continuity

Between sessions, context is preserved via:

1. **`.claude/last-session-output.md`** — final state snapshot
2. **`.claude/handoff.md`** — structured bridge document
3. **`memory/daily/{date}.md`** — session journal
4. **`.claude/anchor-state.md`** — pre-compaction snapshot

The SessionStart hook loads all of these into the next session.

## Limits

- Max 20 sessions per loop (safety)
- Rate limit wait: 60 minutes (configurable)
- Crash retry delay: 30 seconds
- Session-scoped cron jobs do NOT survive between sessions
