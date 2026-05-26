# Hooks Guide

Hooks are shell scripts that run at specific points in Claude Code's lifecycle. They automate context management, safety checks, memory persistence, and quality gates — all without consuming Claude's context window or requiring manual intervention.

## Hook Events

Claude Code fires hooks at 7 lifecycle events:

| Event | When It Fires | Can Block? | Use For |
|-------|--------------|------------|---------|
| `SessionStart` | Claude Code starts or resumes | No | Context injection, health checks |
| `PreToolUse` | Before a tool executes | Yes (exit 2) | Safety gates, input validation |
| `PostToolUse` | After a tool completes | No | Verification, logging, formatting |
| `PreCompact` | Before context compaction | No | Memory persistence, state snapshots |
| `Stop` | Before Claude stops responding | Yes (exit 2) | Quality gates, completion checks |
| `SessionEnd` | Session is closing | No | Logging, cleanup |
| `Notification` | Notification triggered | No | System alerts |

**Blocking hooks:** PreToolUse and Stop can block execution by exiting with code 2. Stderr output is shown to Claude as an error message. Exit 0 = allow, Exit 2 = block.

## The Harness Hooks (12 scripts)

### Session Lifecycle (5 hooks)

#### session-start-context.sh (SessionStart)

The most important hook. Injects full context on every session start:

```
=== SESSION CONTEXT ===
- CONTEXT.md (first 20 lines)
- maintainer checklist
- maintainer prompt titles
- Today's daily log (last 50 lines)
- Long-term memory (first 60 lines)
- Recent learnings (last 30 lines)
- Last 10 git commits
- Unread resources alert
- Git status summary
- Skills/rules/agents inventory
- MCP server count
- Environment health (features passing, TypeScript errors)
- Anchor state (if post-compaction, <2h old)
- Last session output (if auto-switch, <1h old)
- Terminal-specific context (via CLAUDE_TERMINAL_CONTEXT)
```

Everything Claude needs to orient itself, in one injection.

#### context-monitor.sh (SessionStart)

Health checks that run alongside context injection:

- Warns if `plan.md` is stale (>24h old)
- Warns if uncommitted files exceed 50
- Warns if MEMORY.md exceeds 100 lines
- Warns if LEARNINGS.md exceeds 150 lines
- Notes if no daily log exists for today
- Warns if CONTEXT.md hasn't been modified in 48+ hours

#### complete-story-alignment.sh (SessionStart)

Reminds Claude about the north star vision document (`docs/VISION.md`). Shows line count, last modified date, and which sections to read for different types of work.

#### session-end-log.sh (SessionEnd)

Writes a session summary to two places:

- `memory/daily/YYYY-MM-DD.md` — daily log (append)
- `.claude/session-log.md` — master log (append)

Records: timestamp, modified file count, file names (up to 20).

#### worktree-cleanup.sh (SessionEnd)

Cleans up abandoned git worktrees from agent teams:

- Prunes git's internal worktree tracking
- Removes worktrees with no uncommitted changes
- Leaves worktrees with uncommitted work intact

### Context Compaction (2 hooks)

#### pre-compact-memory-flush.sh (PreCompact)

The last chance to persist state before context compression. Creates:

1. **Anchor state** (`.claude/anchor-state.md`) — structured "what we're doing right now"
   - Recent daily log entries
   - Compaction count tracking
   - Recovery steps
   - Inventory summary
   - Hard stop warnings at 2+ compactions

2. **Full backup** (`.claude/backups/pre-compact-TIMESTAMP.md`)
   - CONTEXT.md snapshot (80 lines)
   - MEMORY.md snapshot (60 lines)
   - Today's daily log (60 lines)
   - LEARNINGS.md (30 lines)
   - Git status and modified files
   - Recent 5 commits

3. **Last session output** (`.claude/last-session-output.md`)
   - For auto-switch continuity
   - Active tasks, handoff doc, uncommitted work

4. **Compaction counter** — tracks how many times context has been compacted this session

5. **Session signal** — writes `context-degraded` to `/tmp/claude-session-signal` at 2+ compactions, triggering auto-switch to start a fresh session

Also: prunes old backups (keeps last 10), appends compaction marker to daily log.

#### post-compact-restore.sh (SessionStart, matcher: "compact")

Re-injects critical context after compaction:

1. Compaction count and warnings
2. Active task file (resume working on it)
3. Anchor state (pre-compaction snapshot)
4. Today's daily log (last 40 lines)
5. Handoff doc (session bridge)
6. maintainer prompt titles
7. Uncommitted files
8. Recent commits
9. Inventory count
10. Instructions (hard stop if 2+ compactions, otherwise resume)

### Safety (2 hooks)

#### Destructive Command Blocker (PreToolUse, matcher: Bash)

Inline hook that blocks dangerous shell commands:

```bash
# Blocked patterns:
rm -rf /
rm -rf ~/
sudo rm -rf
> /dev/sda
mkfs
dd if=/dev
```

Exit 2 with message: "BLOCKED: Destructive system command detected. Ask the maintainer before proceeding."

#### Protected File Guard (PreToolUse, matcher: Write|Edit)

Inline hook that blocks writes to sensitive files:

```bash
# Protected files:
pnpm-lock.yaml
package-lock.json
.env
.env.local
.env.production
```

Exit 2 with message: "BLOCKED: Protected file. Use ask permission or manual edit."

### Quality Gates (2 hooks)

#### stop-verify.sh (Stop)

Blocks Claude from stopping if work is incomplete:

- **Checks uncommitted source files** — if >3 modified files and CONTEXT.md not updated, blocks stop
- **Respects compaction** — if compacted 3+ times, allows stop (context is degraded)
- **VP bypass** — VPs (pane labels starting with VP-, AG-, OSS-, Mgr-, Sub-) are never blocked
- **Circuit breaker** — if hook fires >3 times in 60 seconds, allows stop (prevents infinite loops)

#### task-completion-gate.sh (Stop)

Blocks Claude from stopping if there's an active task:

- Checks for `.claude/active-task.md` file
- Blocks if task status isn't "done" or "blocked"
- Removes task file when status is done/blocked
- Same VP bypass and circuit breaker as stop-verify

### Observability (2 hooks)

#### post-push-verify.sh (PostToolUse, matcher: Bash)

Triggers after `git push` commands:

- Checks production health endpoint (HTTP status)
- Checks GitHub Actions deploy workflow status
- Reports results (informational, never blocks)

#### audit-log.sh (PostToolUse)

Append-only audit trail in JSONL format (`.claude/audit.jsonl`):

- Logs state-changing tools: Write, Edit, Bash, Agent, NotebookEdit, TaskCreate, TaskUpdate, CronCreate
- Skips read-only tools to reduce noise
- Atomic writes with `flock` for multi-terminal safety
- Auto-prunes at 10K lines (keeps recent 5K)

Format:

```json
{"ts":"2026-03-17T20:15:30Z","tool":"Write","terminal":"platform","file":"src/index.ts"}
```

#### screenshot-cleanup.sh (SessionStart)

Removes screenshot files older than 2 hours from `resources/screenshots/`. Prevents storage bloat from visual testing.

## Creating Your Own Hooks

### Basic Structure

```bash
#!/bin/bash
set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Your logic here

# For blocking hooks (PreToolUse, Stop):
# exit 0 = allow
# exit 2 = block (stderr shown to Claude)

exit 0
```

### Available Environment Variables

| Variable | Available In | Contents |
|----------|-------------|----------|
| `CLAUDE_PROJECT_DIR` | All hooks | Project root directory |
| `CLAUDE_TOOL_NAME` | PreToolUse, PostToolUse | Tool being called (Bash, Write, etc.) |
| `CLAUDE_TOOL_INPUT` | PreToolUse, PostToolUse | Tool input (command text, file content) |
| `CLAUDE_TOOL_INPUT_FILE_PATH` | PreToolUse, PostToolUse | File path for Write/Edit/Read tools |
| `CLAUDE_TERMINAL_CONTEXT` | All hooks | Terminal context identifier |
| `TMUX_PANE` | All hooks (if in tmux) | Current tmux pane ID |

### Wiring a Hook

Add to `settings.local.json`:

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "optional-regex",
        "hooks": [
          {
            "type": "command",
            "command": "/absolute/path/to/hook.sh"
          }
        ]
      }
    ]
  }
}
```

**Matcher patterns:**

- Empty/omitted = fires for all tool calls
- `"Bash"` = only fires for Bash tool calls
- `"Write|Edit"` = fires for Write or Edit tool calls
- `"compact"` = special SessionStart matcher for post-compaction

### Best Practices

1. **Always use `set -euo pipefail`** — catch errors early, don't swallow failures

2. **Circuit breakers for blocking hooks** — if a Stop hook fires >3 times in 60 seconds, allow stop to prevent infinite loops:

```bash
COUNTER_FILE="/tmp/my-hook-counter"
WINDOW=60
MAX_FIRES=3

NOW=$(date +%s)
if [ -f "$COUNTER_FILE" ]; then
  FIRST_FIRE=$(head -1 "$COUNTER_FILE")
  FIRE_COUNT=$(wc -l < "$COUNTER_FILE" | tr -d ' ')
  AGE=$(( NOW - FIRST_FIRE ))
  if [ "$AGE" -gt "$WINDOW" ]; then
    echo "$NOW" > "$COUNTER_FILE"
  else
    echo "$NOW" >> "$COUNTER_FILE"
    if [ "$FIRE_COUNT" -ge "$MAX_FIRES" ]; then
      rm -f "$COUNTER_FILE"
      exit 0  # Allow — circuit breaker tripped
    fi
  fi
else
  echo "$NOW" > "$COUNTER_FILE"
fi
```

3. **VP bypass for multi-agent setups** — if you use agent grids, VP panes shouldn't be blocked by stop hooks:

```bash
if [ -n "${TMUX_PANE:-}" ]; then
  PANE_LABEL=$(tmux show-options -p -t "$TMUX_PANE" @pane_label 2>/dev/null | sed 's/@pane_label //' || echo "")
  if echo "$PANE_LABEL" | grep -qiE '^(VP-|AG-|OSS-)'; then
    exit 0
  fi
fi
```

4. **Stdout is injected into context** — for SessionStart hooks, whatever you `echo` becomes part of Claude's context. Be concise.

5. **Stderr is shown as errors** — for blocking hooks (exit 2), stderr is the error message Claude sees.

6. **Keep hooks fast** — hooks block Claude's execution. Target <1 second. Avoid network calls in PreToolUse hooks.

7. **Use temp files for state** — hooks run in subprocesses. Use files in `/tmp/` for cross-invocation state (counters, timestamps).

### Debugging Hooks

```bash
# Test a hook manually
CLAUDE_PROJECT_DIR=/path/to/project bash .claude/hooks/my-hook.sh

# Check hook output
CLAUDE_PROJECT_DIR=/path/to/project bash .claude/hooks/session-start-context.sh 2>&1

# Verify settings.local.json is valid JSON
python3 -m json.tool .claude/settings.local.json
```
