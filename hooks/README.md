# Hooks

Claude Code hooks automate actions on lifecycle events.

## Included Hooks

| Hook                          | Event                  | What It Does                                               |
| ----------------------------- | ---------------------- | ---------------------------------------------------------- |
| `session-start-context.sh`    | SessionStart           | Loads project context, memory, learnings, git status       |
| `context-monitor.sh`          | SessionStart           | Health checks: stale plans, memory bloat, uncommitted work |
| `pre-compact-memory-flush.sh` | PreCompact             | Saves anchor state + backup before context compression     |
| `post-compact-restore.sh`     | SessionStart (compact) | Re-injects context after auto-compaction                   |
| `stop-verify.sh`              | Stop                   | Quality gate: warns about uncommitted work                 |
| `session-end-log.sh`          | SessionEnd             | Logs session summary to daily memory                       |

The Claude Code plugin wires `session-start-context.sh` at `SessionStart` through
[`hooks.json`](hooks.json), so plugin users get the context block without running `init`.

## Inline Hooks (configured in settings.local.json)

### Destructive Command Blocker (PreToolUse: Bash)

Blocks dangerous commands like `rm -rf /`, `sudo rm -rf`, etc.

### Protected File Blocker (PreToolUse: Write|Edit)

Prevents accidental modification of lockfiles and `.env` files.

## Installation

Hooks are installed automatically by `claude-harness init`. To install manually:

1. Copy hook scripts to `.claude/hooks/`
2. Make executable: `chmod +x .claude/hooks/*.sh`
3. Add to `.claude/settings.local.json` (see `templates/settings.local.json`)

## Creating Custom Hooks

See the [Claude Code docs](https://docs.anthropic.com/en/docs/claude-code) for hook events and API.

Hook scripts receive the event as JSON on stdin (`tool_name`, `tool_input.command`,
`tool_input.file_path` and more); read it with `jq` or match it with `grep`. Claude Code also sets
`$CLAUDE_PROJECT_DIR`, the project root.

Exit codes:

- `0` — allow
- `2` — block (stderr shown to Claude)
